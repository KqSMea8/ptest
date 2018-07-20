let fs = require('fs');
let Crawler = require('crawler');
let logger = require('./logger.js').getRotateLog({
    prgname: 'vue',
    datePattern: 'YYYY-MM-DD'
});

let rstFile = 'vue.csv';
let crawler = new Crawler({
    retries: 0,
    jquery: false,
    rateLimit: 5000
});

let dynamic_proxy_user = "HBO175BO42T24R8D";
let dynamic_proxy_password = "BE6735E1D6A41931";
let proxy = "http://" + dynamic_proxy_user + ":" + dynamic_proxy_password + "@http-dyn.abuyun.com:9020";
let headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36' };

crawler.on('schedule', options => {
    options.proxy = proxy;
    options.limiter = Math.ceil(Math.random() * 15);
});

let words = ['旅行', 'travel', '探店', '旅游', 'vlog'];
words.forEach(function (word) {
    getList({
        word: word, page: 1
    });
});

function getList(word) {
    let url = 'https://api.vuevideo.net/api/v1/posts/search/' + encodeURIComponent(word.word) + '?&start=' + (word.page - 1) * 10 + '&length=10&country=CN&f=IOS&lang=zh-Hans-CN&lat=40.041434&lng=116.267860&p=VUE&tz=GMT%2B8&v=2.0.3&vc=323';
    crawler.queue({
        uri: url,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getList: ', err || res.body);
                getList(word);
                return done();
            }
            let data = JSON.parse(res.body).entities.data;
            let tmp = [];
            for (let video of data) {
                let title = video.title.replace(/[,\n]+/g, '');
                let videoUrl = video.videoURL;
                let commentCount = video.commentCount;
                let likeCount = video.likeCount;
                let viewCount = video.viewCount;
                let name = video.user.name.replace(/[,\n]+/g, '');
                let id = video.user.id;
                let username = video.user.username.replace(/[,\n]+/g, '');

                let location = video.user.location;
                if (!location) {
                    logger.warn('no location: ', JSON.stringify(video));
                } else {
                    location = location.replace(/[,\n]+/g, '');

                }
                let followerCount = video.user.followerCount;
                let postCount = video.user.postCount;
                let userUrl = 'https://m.vuevideo.net/share/user/' + username;
                tmp.push([title, videoUrl, commentCount, likeCount, viewCount, name, id, username, location, followerCount, postCount, userUrl].join());
            }
            fs.appendFileSync(rstFile, tmp.join('\n') + '\n');
            logger.info('got data length', tmp.length, word);
            if (!data || !data.length) {
                logger.warn('reach bottom ', word);
            } else {
                word.page++;
                getList(word);
            }
            done();
        }
    });
}