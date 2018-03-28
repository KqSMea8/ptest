let cheerio = require('cheerio')
let moment = require('moment');
let Crawler = require('crawler');
let MongoClient = require('mongodb').MongoClient;

let mongoUrl = 'mongodb://127.0.0.1:27017/miaopai_video',
    mongoConn, insertBuffer = [];
let crawler = new Crawler({
    rateLimit: 5000, retries: 0, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
});

start();

function start() {
    MongoClient.connect(mongoUrl).then((conn) => {
        mongoConn = conn;
        mongoConn.collection('video').createIndex({ vid: 1 });
        return mongoConn.collection('user').find({}, { uid: 1, _id: 0 }).toArray();
    }).then(users => {
        console.log('got users:' + users.length)
        for (let user of users) {
            getVideo(user.uid);
        }
    })
}

function getVideo(uid) {
    crawler.queue({
        uri: 'https://www.miaopai.com/u/' + uid,
        callback: (err, res, done) => {
            let $ = res.$;
            $('.videoCont').each(function () {
                let vid = $('.MIAOPAI_player', this).attr('data-scid') || '';
                if (vid.length < 20) return;
                let like = $('.commentLike a', this).first().text();
                let comment = $('.commentLike a.commentIco', this).text();
                let uname = $('p.personalDataN a', this).text();
                let pt = $('.personalDataT span', this).first().text();
                if (pt.trim().match(/^\d{2}-/)) {
                    pt = moment().format('YYYY') + '-' + pt.trim();
                } else if (pt.trim().match(/^\d{2}:\d{2}$/)) {
                    pt = moment().format('YYYY-MM-DD') + ' ' + pt.trim();
                }
                let view = $('.personalDataT span.red', this).text().replace('观看', '');
                let title = $('.viedoAbout p', this).first().text();
                let tags = $('.viedoAbout p.orange', this).text().trim();
                insertVideo({ vid, title, like, comment, view, pt, tags, uid, uname });
            });
            console.log(uid, ' got ', $('.videoCont').length)
            done();
        }
    })
}

function insertVideo(v) {
    insertBuffer.push(v);
    if (insertBuffer.length < 2) return;
    let batch = mongoConn.collection('video').initializeUnorderedBulkOp();
    for (let video of insertBuffer) {
        batch.find({ vid: video.vid }).upsert().updateOne({
            $setOnInsert: {
                ts: new Date(),
                uid: video.uid,
                uname: video.uname,
                title: video.title,
                pt: video.pt,
                tags: video.tags
            },
            $set: {
                comment: video.comment,
                like: video.like,
                view: video.view
            }
        });
    }
    insertBuffer = [];
    batch.execute().then(() => {
        console.log('insert 100');
    });
}
