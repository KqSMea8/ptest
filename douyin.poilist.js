/**
 * @file 抖音抓取
 * @author qiuguanghui<qiuguanghui@baidu.com>
 */

let fs = require('fs');
let Crawler = require('crawler');
let logger = require('./logger.js').getRotateLog({
    prgname: 'douyin',
    datePattern: 'YYYY-MM-DD'
});

let poiIds = fs.readFileSync('./douyin.video.csv').toString().trim().split('\n').map(line => {
    line = line.split(',');
    let id = line[3].match(/poilist\/\?id=(.*?)&/);
    return {
        city: line[0],
        point: line[1],
        challenge: line[2],
        poilist: line[3],
        cursor: 0,
        id: id && id[1]
    };
});
let rstFile = './douyin.poilist.csv';
fs.appendFileSync(rstFile, '\ufeffpid,province,city,pname,videoUrl,videoDesc,musicName,authorNickname,authorUid,authorSignature\n');
let crawler = new Crawler({
    retries: 0,
    jquery: false,
    rateLimit: 15000
});

for (let pos of poiIds) {
    getList(pos);
}

function getList(position) {
    if (!position.id) return;
    crawler.queue({
        uri: 'https://www.iesdouyin.com/aweme/v1/poi/aweme/?poi_id=' + position.id + '&cursor=' + position.cursor + '&count=20&aid=1128&aweme_type=1',
        headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
        },
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error(err || res.statusCode);
                getList(position);
                return done();
            }
            let data = JSON.parse(res.body);
            let videos = data.aweme_list;
            logger.info(position, '  cursor: ' + position.cursor + ' got videos ' + videos.length);
            for (let video of videos) {
                processVideo(position, video);
            }
            position.cursor += videos.length;
            if (data.has_more && position.cursor < 20) {
                getList(position);
            }
            done();
        }
    });
}

function processVideo(position, video) {
    let videoUrl = video.video.play_addr.url_list[0];
    fs.appendFileSync(rstFile, [position.city, position.point, 'poilist', videoUrl].join() + '\n');
}
