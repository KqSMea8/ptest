let fs = require('fs');
let Crawler = require('crawler');
let logger = require('./logger.js').getRotateLog({
    prgname: 'xiami.bgm',
    datePattern: 'YYYY-MM-DD'
});

let musicSet = new Set();
let rstFile = 'bgm.xiami.csv';
let crawler = new Crawler({
    retries: 0,
    rateLimit: 500
});
let left;
let dynamic_proxy_user = "HBO175BO42T24R8D";
let dynamic_proxy_password = "BE6735E1D6A41931";
let proxy = "http://" + dynamic_proxy_user + ":" + dynamic_proxy_password + "@http-dyn.abuyun.com:9020";
let headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
};

crawler.on('schedule', options => {
    options.proxy = proxy;
    options.limiter = Math.ceil(Math.random() * 15);
});

function getXmSearchList(kind) {
    let url = kind.url;
    crawler.queue({
        uri: url,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getXmSearchList error', err || res.body, url);
                getXmSearchList(kind);
                return done();
            }
            if (res.request.uri.href.match(/passport\.xiami\.com/)) {
                logger.error('ip forbidden');
                getXmSearchList(kind);
                return done();
            }
            let $ = res.$;
            $('.block_list .block_items h3 a').each(function () {
                let songListUrl = $(this).attr('href');
                kind.songListSet.push({
                    songListUrl
                });
            });
            logger.info(kind, 'got songList ' + $('.block_list .block_items h3 a').length);
            getList(kind, 0);
            done();
        }
    });
}


function getList(kind, idx) {
    if (kind.data.length > 500 || idx >= kind.songListSet.length) {
        logger.info('list ready to get detail ', kind.data.length);
        let rst = kind.data.map(song => getXmDetail(kind, song)).join('\n') + '\n';
        fs.appendFileSync(rstFile, rst);
        return;
    }
    let songList = kind.songListSet[idx];
    let url = 'https:' + songList.songListUrl;
    crawler.queue({
        uri: url,
        headers: headers,
        priority: 3,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getList error', err || res.body, url);
                getList(kind, idx);
                return done();
            }
            if (res.request.uri.href.match(/passport\.xiami\.com/)) {
                logger.error('ip forbidden');
                getList(kind, idx);
                return done();
            }
            let $ = res.$;
            let data = [];
            $('.quote_song_list .totle_up').each(function () {
                let as = $('.song_name a', this);
                if (as.length < 2) return true;
                let id;
                let name;
                let uname;
                let user;
                for (let i = 0; i < as.length; i++) {
                    if ($(as[i]).attr('href') && $(as[i]).attr('href').match(/\/song\//)) {
                        id = $(as[i]).attr('href').replace(/\?spm=.*/, '');
                        name = $(as[i]).attr('title').replace(/[,\n]/g, '');
                    } else if ($(as[i]).attr('href') && $(as[i]).attr('href').match(/artist/)) {
                        user = $(as[i]).attr('href');
                        uname = $(as[i]).text().replace(/[,\n]/g, '');
                    }
                }
                if (id) {
                    data.push({
                        id, name, user, uname
                    });
                }
            });
            let max = data.length > 50 ? 50 : data.length;
            for (let i = 0; i < max; i++) {
                let uniqId = data[i].id;
                if (!musicSet.has(uniqId)) {
                    kind.data.push(data[i]);
                    musicSet.add(uniqId);
                }
            }
            logger.info(idx, ' got 50 songs ', kind.data.length);
            idx++;
            getList(kind, idx);
            done();
        }
    });
}

function getXmGenreList(kind) {
    let url = kind.url + '/page/' + kind.page;
    crawler.queue({
        uri: url,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getXmGenreList error', err || res.body, url);
                getXmGenreList(kind);
                return done();
            }
            if (res.request.uri.href.match(/passport\.xiami\.com/)) {
                logger.error('ip forbidden');
                getXmGenreList(kind);
                return done();
            }
            let $ = res.$;
            $('.songwrapper.song .info').each(function () {
                let as = $('p > a', this);
                let id = $('p strong a', this).attr('href').replace(/\?spm=.*/, '');
                if (!id) return true;
                let name = $('p strong a', this).text().replace(/[,\n]+/g, '').trim();
                let uname;
                let user;
                for (let i = 0; i < as.length; i++) {
                    if ($(as[i]).attr('href') && $(as[i]).attr('href').match(/artist/)) {
                        user = $(as[i]).attr('href');
                        uname = $(as[i]).text().replace(/[,\n]/g, '');
                        break;
                    }
                }
                let song = {
                    id, name, user, uname
                }
                if (!musicSet.has(song.id)) {
                    kind.data.push(song);
                    musicSet.add(song.id);
                }
            });

            logger.info(kind.type1, kind.type2, kind.page, kind.data.length);

            if (kind.data.length > 500 || !$('.songwrapper.song .info').length) {
                logger.info(kind.type1, kind.type2, kind.page, kind.data.length, ' done ');
                let rst = kind.data.map(song => getXmDetail(kind, song)).join('\n') + '\n';
                fs.appendFileSync(rstFile, rst);
            } else {
                kind.page++;
                getXmGenreList(kind);
            }
            done();
        }
    });
}

function getXmChartList(kind) {
    let url = kind.url;
    crawler.queue({
        uri: url,
        priority: 1,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getXmChartList error', err || res.body, url);
                getXmChartList(kind);
                return done();
            }
            if (res.request.uri.href.match(/passport\.xiami\.com/)) {
                logger.error('ip forbidden');
                getXmChartList(kind);
                return done();
            }
            let $ = res.$;
            let rst = [];
            $('.songwrapper .songblock .info').each(function () {
                let song = {
                    id: $('p strong a', this).attr('href').replace(/\?spm=.*/, ''),
                    name: $('p strong a', this).text().replace(/[,\n]+/g, '').trim(),
                    user: $('p > a.artist', this).attr('href'),
                    uname: $('p > a.artist', this).text().replace(/[,\n]+/g, '').trim()
                }
                if (!musicSet.has(song.id)) {
                    rst.push(getXmDetail(kind, song));
                    musicSet.add(song.id);
                }
            });
            fs.appendFileSync(rstFile, rst.join('\n') + '\n');
            done();
        }
    });
}

function getXmDetail(line) {
    //return [kind.platform, kind.type1, kind.type2, song.name, song.id, song.uname, song.user].join();
    let url = 'https://www.xiami.com' + line[4];
    crawler.queue({
        uri: url,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getXmDetail error', err || res.body, url);
                getXmDetail(line);
                return done();
            }
            if (res.request.uri.href.match(/passport\.xiami\.com/)) {
                logger.error('ip forbidden');
                getXmDetail(line);
                return done();
            }
            let $ = res.$;
            let comments = $('.wall_list_count span').text();
            let share = $('.do_share em').text().replace(/[()]/g, '');
            left--;
            logger.info('left ' + left, line, share, comments);
            fs.appendFileSync(rstFile, line.join() + ',' + [comments, share].join() + '\n');
            done();
        }
    });
}

let lines = fs.readFileSync('xiami.seeds').toString().trim().split('\n');
left = lines.length;

lines.forEach(function (line) {
    line = line.split(',');
    getXmDetail(line);
});

let seeds = {
    虾米: {
        曲风: {
            '流行': 'https://www.xiami.com/search/collect?spm=a1z1s.3065917.6862697.3.hmrLho&key=%E6%B5%81%E8%A1%8C&order=weight&l=0',
            '摇滚': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.22.1jMtSP&key=%E6%91%87%E6%BB%9A',
            '民谣': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.32.Eqyp6N&key=%E6%B0%91%E8%B0%A3',
            '电子': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.27.Eqyp6N&key=%E7%94%B5%E5%AD%90',
            '爵士': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.29.Eqyp6N&key=%E7%88%B5%E5%A3%AB',
            '轻音乐': 'https://www.xiami.com/genre/songs/gid/12?spm=a1z1s.3057857.0.0.JJ0hEr',
            '嘻哈（说唱）': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.26.Eqyp6N&key=%E5%98%BB%E5%93%88',
            '动漫ACG': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.28.Eqyp6N&key=ACG',
            '布鲁斯': 'https://www.xiami.com/genre/songs/gid/4?spm=a1z1s.3057857.0.0.xHBXHK',
            '金属': 'https://www.xiami.com/genre/songs/gid/18?spm=a1z1s.3057857.0.0.bTdbwA',
            '世界音乐': 'https://www.xiami.com/genre/songs/gid/7?spm=a1z1s.3057857.0.0.Nv6HTA',
            '新世纪': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.25.Eqyp6N&key=%E6%96%B0%E4%B8%96%E7%BA%AA',
            '舞台/银幕/娱乐': 'https://www.xiami.com/genre/songs/gid/14?spm=a1z1s.3057857.0.0.xZ8C9T',
            '乡村': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.31.Eqyp6N&key=%E4%B9%A1%E6%9D%91',
            '雷鬼': 'https://www.xiami.com/genre/songs/gid/6?spm=a1z1s.3057857.0.0.DY6YsS',
            '古典': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.33.Eqyp6N&key=%E5%8F%A4%E5%85%B8',
            '唱作人': 'https://www.xiami.com/genre/songs/gid/15?spm=a1z1s.3057857.0.0.t09kMn',
            '拉丁': 'https://www.xiami.com/genre/songs/gid/8?spm=a1z1s.3057857.0.0.2m0dat',
            '中国特色': 'https://www.xiami.com/genre/songs/gid/19?spm=a1z1s.3057857.0.0.iEY2WH',
            '实验': 'https://www.xiami.com/genre/songs/gid/11?spm=a1z1s.3057857.0.0.sHsoUZ',
            '纯音': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.23.Eqyp6N&key=%E7%BA%AF%E9%9F%B3',
            'OST': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.24.Eqyp6N&key=OST',
            '中国风': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.34.Eqyp6N&key=%E4%B8%AD%E5%9B%BD%E9%A3%8E',
            'R&B节奏布鲁斯': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.30.Eqyp6N&key=R&B'
        },
        情绪: {
            '安静': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.35.Eqyp6N&key=%E5%AE%89%E9%9D%99',
            '清新': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.36.Eqyp6N&key=%E6%B8%85%E6%96%B0',
            '治愈': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.37.Eqyp6N&key=%E6%B2%BB%E6%84%88',
            '伤感': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.38.Eqyp6N&key=%E4%BC%A4%E6%84%9F',
            '温暖': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.39.Eqyp6N&key=%E6%B8%A9%E6%9A%96',
            '感动': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.40.Eqyp6N&key=%E6%84%9F%E5%8A%A8',
            '慵懒': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.41.Eqyp6N&key=%E6%85%B5%E6%87%92',
            '快乐': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.42.Eqyp6N&key=%E5%BF%AB%E4%B9%90',
            '幸福': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.43.Eqyp6N&key=%E5%B9%B8%E7%A6%8F',
            '励志': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.44.Eqyp6N&key=%E5%8A%B1%E5%BF%97',
            '唯美': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.45.Eqyp6N&key=%E5%94%AF%E7%BE%8E',
            '忧郁': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.46.Eqyp6N&key=%E5%BF%A7%E9%83%81',
            '回忆': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.47.Eqyp6N&key=%E5%9B%9E%E5%BF%86',
            '寂寞': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.48.Eqyp6N&key=%E5%AF%82%E5%AF%9E'
        },
        场景: {
            '早安': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.49.Eqyp6N&key=%E6%97%A9%E5%AE%89',
            '在路上': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.50.Eqyp6N&key=%E5%9C%A8%E8%B7%AF%E4%B8%8A',
            '阅读': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.53.Eqyp6N&key=%E9%98%85%E8%AF%BB',
            '午后': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.54.Eqyp6N&key=%E5%8D%88%E5%90%8E',
            '咖啡': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.55.Eqyp6N&key=%E5%92%96%E5%95%A1',
            '旅行': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.56.Eqyp6N&key=%E6%97%85%E8%A1%8C',
            '夜店': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.57.Eqyp6N&key=%E5%A4%9C%E5%BA%97',
            '健身': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.60.Eqyp6N&key=%E5%81%A5%E8%BA%AB',
            '晚安': 'https://www.xiami.com/search/collect?spm=a1z1s.2943601.6856185.62.Eqyp6N&key=%E6%99%9A%E5%AE%89'
        },
        排行榜: {
            '音乐榜': 'https://www.xiami.com/chart/data?c=103&type=0&page=1&limit=100',
            '新歌榜': 'https://www.xiami.com/chart/data?c=102&type=0&page=1&limit=100',
            '原创榜': 'https://www.xiami.com/chart/data?c=104&type=0&page=1&limit=100'
        }
    }
}

// Object.keys(seeds).forEach(platform => {
//     Object.keys(seeds[platform]).forEach(type1 => {
//         Object.keys(seeds[platform][type1]).forEach(type2 => {
//             let page = 1;
//             let data = [];
//             let songListSet = [];
//             let url = seeds[platform][type1][type2];
//             let kind = {
//                 platform, type1, type2, url, page, songListSet, data
//             };
//             if (url.match(/chart/)) {
//                 getXmChartList(kind);
//             } else if (url.match(/search/)) {
//                 getXmSearchList(kind);
//             } else {
//                 kind.url = url.replace(/\?spm=.*/, '');
//                 getXmGenreList(kind);
//             }
//         });
//     });
// });
