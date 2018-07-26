let fs = require('fs');
let Crawler = require('crawler');
let decodeMp = require('./decodeMp');
let logger = require('./logger.js').getRotateLog({
    prgname: 'meipai.url',
    datePattern: 'YYYY-MM-DD'
});

let rstFile = 'meipai.url.csv';
let crawler = new Crawler({
    retries: 0,
    rateLimit: 4000
});

let lines = fs.readFileSync('meipai.seeds').toString().trim().split('\n');
let left = lines.length;

lines.forEach(function (line) {
    getDetail(line);
});


function getDetail(line) {
    crawler.queue({
        uri: line,
        callback: function (err, res, done) {
            if (res.body && res.body.match(/您访问的地址找不到/)) {
                logger.error('can not find ', res.options.uri);
                logger.info('left : ', --left);
                return done();
            }
            if (err || res.statusCode !== 200) {
                logger.error('getDetail: ', err || res.body);
                getDetail(line);
                return done();
            }
            let $ = res.$;
            let realUrl1 = $('[property="og:video:url"]').attr('content');
            let realUrl2 = $('#detailVideo').attr('data-video');
            let realUrl = realUrl1 || realUrl2;

            if (!realUrl) {
                logger.error('no url: ', line, res.body);
                logger.info('left : ', --left);
                return done();
            } else {
                realUrl = realUrl.trim();
            }
            let a = decodeMp(realUrl);
            if (a[a.length - 1] == '@') {
                a = a.substring(0, a.length - 1);
            }
            let guessUrl = a.replace(/_H.*/, '.mp4');
            logger.info('left : ', --left, guessUrl);
            fs.appendFileSync(rstFile, line + ',' + a.trim() + ',' + guessUrl + '\n');
            done();
        }
    });
}