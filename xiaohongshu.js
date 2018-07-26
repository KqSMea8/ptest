/**
 * @file 小红书抓取
 * @author qiuguanghui<qiuguanghui@baidu.com>
 */

let fs = require('fs');
let Crawler = require('crawler');
let logger = require('./logger.js').getRotateLog({
    prgname: 'xiaohongshu',
    datePattern: 'YYYY-MM-DD'
});
let headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
};
let dynamic_proxy_user = "H075OSZG2ZN4500D"
let dynamic_proxy_password = "8CA5447E4FC91CDC"
let proxy = "http://" + dynamic_proxy_user + ":" + dynamic_proxy_password + "@http-dyn.abuyun.com:9020";


let total = {};
let rstFile = './xiaohongshu.video.csv';
let seed = { id: '5a438da28000860661720f20', name: '北京旅行', page: 1 };
let crawler = new Crawler({
    retries: 0,
    jquery: false,
    rateLimit: 1000
});
crawler.on('schedule', options => {
    options.proxy = proxy;
    options.limiter = Math.ceil(Math.random() * 5);
});

crawler.on('drain', () => {
    if (count()) {
        seed.page++;
        getTopicList(seed);
    }
})

getTopicList(seed);

function getTopicList(topic) {
    let url = 'https://www.xiaohongshu.com/web_api/sns/v1/page/' + topic.id + '/topic/related?page_index=' + topic.page + '&page_size=30&page_type=topic';
    crawler.queue({
        uri: url,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getTopicList: ', err || res.body);
                getTopicList(topic);
                return done();
            }
            let data = JSON.parse(res.body).data;
            logger.info('got ' + data.length + ' topics');
            for (let item of data) {
                getVideoList({
                    id: item.page_id,
                    name: item.page_info.name,
                    page: 1
                });
            }
            done();
        }
    });
}


function getVideoList(topic) {
    crawler.queue({
        uri: 'https://www.xiaohongshu.com/web_api/sns/v1/page/' + topic.id + '/notes?page=' + topic.page + '&page_size=14&filters=%23WKSpecialTag%23%E8%A7%86%E9%A2%91',
        headers: headers,
        priority: 3,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getVideoList: ', err || res.body);
                getVideoList(topic);
                return done();
            }
            let data = JSON.parse(res.body).data;
            logger.info(topic, 'got videos ' + data.length);
            for (let v of data) {
                getVideoUrl(v);
            }
            if (data.length) {
                topic.page++;
                getVideoList(topic);
            }
            done();
        }
    });
}

function getVideoUrl(video) {
    if (total[video.id]) return;
    let url = 'https://www.xiaohongshu.com/discovery/item/' + video.id + '?_at=2e9b47fa5f460f55f3fb7b9dd725211fb6f10';
    if (video.redirectUrl) {
        url = video.redirectUrl;
    }
    crawler.queue({
        priority: 1,
        jquery: true,
        headers: headers,
        uri: url,
        callback: (err, res, done) => {
            if (err || res.statusCode !== 200) {
                logger.error('getVideoUrl: ', err || res.body);
                getVideoUrl(video);
                return done();
            }
            let $ = res.$;
            if ($('#info').text().match(/未自动跳转/)) {
                video.redirectUrl = $('#info > a').attr('href');
                logger.warn('redirect!');
                getVideoUrl(video);
                return done();
            }
            if (res.body.match(/anti-bot\.baidu\.com/)) {
                logger.info('ip forbidden', res.options.uri, res.body);
                getVideoUrl(video);
                return done();
            }
            let data = res.body.match(/__INITIAL_SSR_STATE__=(.*?)<\/script/);
            if (!data) {
                logger.error(res.body, res.options.uri);
                return done();
            }
            data = data[1];
            data = JSON.parse(data);
            try {
                fs.appendFileSync(rstFile, res.options.uri + ',http:' + data.NoteView.noteInfo.video + '\n');
                logger.info('got one video url ', data.NoteView.noteInfo.video);
                total[video.id] = 1;
                count();
            } catch (error) {
                logger.error(error, res.body, res.options.uri);
            }
            done();
        }
    });
}

function count() {
    if (Object.keys(total).length > 10000) {
        logger.info('5000 done!');
        process.exit();
    }
    return true;
}