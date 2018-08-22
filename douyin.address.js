
let fs = require('fs');
let Crawler = require('crawler');
let logger = require('./logger.js').getRotateLog({
    prgname: 'douyin',
    datePattern: 'YYYY-MM-DD'
});

let poiIds = fs.readFileSync('./address.sample').toString().trim().split('\n').map(line => {
    line = line.split('\t');
    return {
        city: line[0],
        point: line[1],
        url1: line[2],
        url2: line[3]
    };
});
let rstFile = './douyin.video.csv';

let crawler = new Crawler({
    retries: 0,
    jquery: false,
    rateLimit: 1000
});

crawler.on('drain', () => {
    for (let pos of poiIds) {
        fs.appendFileSync(rstFile, [pos.city, pos.point, pos.challenge, pos.poilist].join() + '\n');
    }
})

for (let pos of poiIds) {
    getList(pos, pos.url1);
    getList(pos, pos.url2);
}

function getList(position, url) {
    if (!url.match(/v\.douyin\.com/)) {
        return;
    }
    crawler.queue({
        uri: url,
        headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
        },
        callback: function(err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error(err || res.statusCode);
                getList(position, url);
                return done();
            }
            let finalUrl = res.request.uri;
            if (finalUrl.href.match(/share\/challenge/)) {

                if (position.hasOwnProperty('challenge')) {
                    logger.error('has own challenge', position, url);
                } else {
                    position.challenge = finalUrl.href;
                }
            } else if (finalUrl.href.match(/share\/poilist/)) {
                if (position.hasOwnProperty('poilist')) {
                    logger.error('has own poilist', position, url);
                } else {
                    position.poilist = finalUrl.href;
                }
            } else {
                logger.error('url exception', position, url);
            }
            done();
        }
    });
}