
let fs = require('fs');
let util = require('util');
let Crawler = require('crawler');
let logger = require('./logger.js').getRotateLog({
    prgname: 'meipai',
    datePattern: 'YYYY-MM-DD'
});

let cates = {
    '旅行': 'http://www.meipai.com/topics/news_timeline?page=%s&count=24&tid=5964478428898728618',
    '带着美拍去旅行': 'http://www.meipai.com/topics/news_timeline?page=%s&count=24&tid=5873459921699665310',
    '旅行日记': 'http://www.meipai.com/topics/news_timeline?page=%s&count=24&tid=5873761246569600990',
    '说走就走的旅行': 'http://www.meipai.com/topics/news_timeline?page=%s&count=24&tid=5875988026778146380',
    '一起去旅行': 'http://www.meipai.com/topics/news_timeline?page=%s&count=24&tid=5880150389468200803'
}
let rstFile = './meipai.video.csv';
fs.writeFileSync(rstFile, '\ufeff话题,账号名称,账号id,粉丝,视频量,视频title,视频url,时长,喜欢,评论,分享,音乐名,音乐url\n');
let crawler = new Crawler({
    retries: 0,
    rateLimit: 1000
});

for (let key in cates) {
    getList({
        buttom: false,
        name: key,
        page: 1,
        total: 0
    });
}

function getList(cate) {
    let url = util.format(cates[cate.name], cate.page);
    if (cate.page !== 1) {
        url = url + '&maxid=' + cate.maxid;
    }
    crawler.queue({
        uri: url,
        jquery: false,
        headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
        },
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getList: ', err || res.body);
                getList(cate);
                return done();
            }
            let medias = JSON.parse(res.body).medias;
            if (medias.length === 0) {
                cate.buttom = true;
            } else {
                cate.maxid = medias[medias.length - 1].id;
            }
            medias = medias.filter(media => (!media.caption_origin.match(/美拍/)
                || media.caption_origin.match(/带着美拍去旅行/)));
            cate.left = medias.length;
            logger.info(res.options.uri, ' getList ' + medias.length, cate);
            for (let video of medias) {
                getDetail(cate, video);
            }
            done();
        }
    });
}

function getDetail(cate, video) {
    crawler.queue({
        uri: 'http://www.meipai.com/media/' + video.id,
        headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
        },
        priority: 1,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                if (res.body && res.body.match(/您访问的地址找不到/)) {
                    logger.error('can not find ', res.options.uri);
                    next(cate);
                    return done();
                }
                logger.error('getDetail: ', err || res.body);
                getDetail(cate, video);
                return done();
            }
            let $ = res.$;
            let duration = + $('[property="og:video:duration"]').attr('content');
            if (duration >= 10 && duration <= 60) {
                cate.total++;
            } else {
                logger.info(res.options.uri, ' video duration: ', duration);
            }
            let user = video.user;
            let music = video.new_music || {};
            let comments = $('#commentCount').text().trim();
            comments = comments === '评论' ? '0' : comments;
            let share = $('#shareMediaBtn span').text().trim();
            share = share === '分享' ? '0' : share;
            let like = $('.detail-like span').text().trim();
            like = like === '喜欢' ? '0' : like;

            fs.appendFileSync(rstFile, [
                cate.name,
                user.screen_name,
                user.id,
                user.followers_count,
                user.videos_count,
                video.caption_origin,
                res.options.uri,
                duration,
                like,
                comments,
                share,
                music.name ? music.name : 'N/A',
                music.url ? music.url : 'N/A'
            ].map(item => (item + '').trim().replace(/[,\s]+/g, '').trim()).join() + '\n');
            next(cate);
            done();
        }
    });
}

function next(cate) {
    cate.left--;
    if (cate.left === 0 && !cate.buttom && cate.total < 10000) {
        logger.info('not enough, continue to getlist');
        cate.page++;
        getList(cate);
    }
}
