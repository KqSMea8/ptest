let moment = require('moment');
let Crawler = require('crawler');
let cheerio = require('cheerio');
let MongoClient = require('mongodb').MongoClient;
let Entities = require('html-entities').XmlEntities;

let mongodb, entities = new Entities();
let crawler = new Crawler({ jquery: false, rateLimit: 30000, retries: 0 });
let url = 'https://weibo.com/a/aj/transform/loadingmoreunlogin?ajwvr=6&category=0&page=';
MongoClient.connect('mongodb://127.0.0.1:27017/weibo').then(conn => {
    conn.collection('hot').createIndex({ id: 1 });
    conn.collection('hot').createIndex({ ts: 1 });
    conn.collection('hot').createIndex({ time: 1 });
    mongodb = conn;
    getList(1);
});

function getList(page) {

    if (page > 30) {
        page = 1;
    }

    crawler.queue({
        uri: url + page,
        callback: (err, res, done) => {
            if (err || res.statusCode != 200) {
                console.log(err | res.statusCode);
                getList(page);
                return done();
            }
            let $ = cheerio.load(JSON.parse(res.body).data);
            let items = [];
            let ts = new Date();
            $('.UG_list_b,.UG_list_v2').each(function () {
                let video = $(this).attr('class').indexOf('UG_list_v2');
                let url = $(this).attr('href');
                if (video > -1) {
                    url = $('.vid', this).attr('href');
                    video = decodeURIComponent($('.vid', this).attr('action-data'));
                    if (video.match(/sinaimg\.cn/)) {
                        video = video.match(/video_src=(http.*unistore,video)/);
                        if (video) {
                            video = video[1];
                        } else {
                            console.log('video url error ', url, $('.vid', this).attr('action-data'))
                        }
                    } else if (video.match(/miaopai\.com/)) {
                        video = video.match(/video_src=(http.*__\.mp4)/)[1];
                    }
                } else {
                    video = null;
                }
                url = 'https:' + url;
                let id = url;
                let user = $('.subinfo.S_txt2', this).first().text();
                let praised = $('.ficon_praised', this).next('em').text();
                let repeat = $('.ficon_repeat', this).next('em').text();
                let forward = $('.ficon_forward', this).next('em').text();
                let time = $('span.subinfo.S_txt2', this).last().text();
                let title = $('.list_title_s', this).text().trim();
                let userUrl = 'https://weibo.com' + $('.subinfo_box > a').first().attr('href');
                let userPic = $('.subinfo_face img', this).attr('src');
                if (time.match(/分钟前/)) {
                    time = moment().subtract(Number(time.replace('分钟前', '').trim()), 'minutes').format('YYYY-MM-DD HH:mm:ss');
                } else if (time.match(/今天/)) {
                    time = moment().format('YYYY-MM-DD') + ' ' + time.replace('今天', '').trim() + ':00';
                } else if (time.match(/(\d+)月(\d+)日 (\d{2}:\d{2})/)) {
                    time = time.match(/(\d+)月(\d+)日 (\d{2}:\d{2})/);
                    time[1] = Number(time[1]) > 9 ? time[1] : '0' + time[1];
                    time[2] = Number(time[2]) > 9 ? time[2] : '0' + time[2];
                    time = moment().format('YYYY') + '-' + time[1] + '-' + time[2] + ' ' + time[3] + ':00';
                }
                let item = { video, ts, time, id, url, title, user, userUrl, userPic, praised, repeat, forward };
                items.push(item);
            });

            console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' page ' + page + '  got ' + $('.UG_list_b,.UG_list_v2').length);
            console.log();
            if (items.length) {
                upsert(items);
            }
            page++;
            getList(page);
            done();
        }
    })
}

function upsert(items) {
    let bulk = mongodb.collection('hot').initializeUnorderedBulkOp();
    items.forEach(item => {
        bulk.find({
            id: item.id
        }).upsert().update({ $setOnInsert: item });
    });
    return bulk.execute();
}