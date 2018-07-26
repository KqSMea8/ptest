
let fs = require('fs');
let Crawler = require('crawler');
let logger = require('./logger.js').getRotateLog({
    prgname: 'netease.bgm',
    datePattern: 'YYYY-MM-DD'
});

let musicSet = new Set();
let rstFile = 'netease.bgm.csv';
let decodeWy = require('./decodeWy.js');
let crawler = new Crawler({
    retries: 0,
    rateLimit: 1000
});
let headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
}

function getWyCatList(kind) {
    let url = 'https://music.163.com/discover/playlist/?order=hot&cat=' + encodeURIComponent(kind.type2) + '&limit=35&offset=' + (kind.page - 1) * 35;
    crawler.queue({
        uri: url,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getWyCatList error', err || res.body, url);
                getWyCatList(kind);
                return done();
            }
            let $ = res.$;
            $('#m-pl-container > li').each(function () {
                let songListUrl = $('p > a', this).attr('href');
                let songListName = $('p > a', this).attr('title').replace(/[,\n]+/g, '').trim();
                kind.songListSet.push({
                    songListUrl, songListName
                });
            });
            logger.info(kind, 'got songList ' + $('#m-pl-container > li').length, url);
            getList(kind, 0);
            done();
        }
    });
}

function getList(kind, idx) {
    if (kind.data.length > 500 || idx >= kind.songListSet.length) {
        logger.info('list ready to get detail ', kind.data.length);
        let rst = kind.data.map(song => getWyDetail(kind, song)).join('\n') + '\n';
        fs.appendFileSync(rstFile, rst);
        return;
    }
    let songList = kind.songListSet[idx];
    let url = 'https://music.163.com' + songList.songListUrl;
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
            let $ = res.$;
            let str = $('#song-list-pre-data').text().trim();
            let id = $('.m-info.f-cb').attr('id');
            let key = $('.j-img').attr('data-key');
            let data = decodeWy(str, id, key);
            let max = data.length > 50 ? 50 : data.length;
            for (let i = 0; i < max; i++) {
                let uniqId = kind.platform + '|' + data[i].id;
                if (!musicSet.has(uniqId)) {
                    kind.data.push({
                        id: data[i].id,
                        name: data[i].name.replace(/[,\n]/g, ''),
                        user: data[i].ar[0].id,
                        uname: data[i].ar[0].name.replace(/[,\n]/g, '')
                    });
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

function getWyTopList(kind) {
    let url = kind.url;
    crawler.queue({
        uri: url,
        priority: 2,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getWyTopList error', err || res.body, url);
                getWyTopList(kind);
                return done();
            }
            let $ = res.$;
            let data = JSON.parse($('#song-list-pre-data').text());
            logger.info('top got songs ', data.length);
            for (let item of data) {
                let uniqId = kind.platform + '|' + item.id;
                if (!musicSet.has(uniqId)) {
                    getWyDetail(kind, {
                        name: item.name.replace(/[,\n]/g, ''),
                        id: item.id,
                        uname: item.artists[0].name.replace(/[,\n]/g, ''),
                        user: item.artists[0].id
                    });
                    musicSet.add(uniqId);
                }
            }
            done();
        }
    });
}


function getWyDetail(kind, song) {
    return [kind.platform, kind.type1, kind.type2, song.name, song.id, song.uname, song.user].join();
    let url = 'http://music.163.com/api/v1/resource/comments/R_SO_4_' + song.id;
    crawler.queue({
        uri: url,
        headers: headers,
        priority: 1,
        jquery: false,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getWyDetail error', err || res.body, url);
                getWyDetail(kind);
                return done();
            }
            let comments = JSON.parse(res.body).total;
            let share = 'N/A';
            logger.info('got one detail ', song, comments);
            fs.appendFileSync(rstFile, [kind.platform, kind.type1, kind.type2, song.name, song.id, song.uname, song.user, comments, share].join() + '\n');
            done();
        }
    });
}

let seeds = {
    网易: {
        曲风: {
            流行: 'https://music.163.com/discover/playlist/?cat=%E6%B5%81%E8%A1%8C',
            摇滚: 'https://music.163.com/discover/playlist/?cat=%E6%91%87%E6%BB%9A',
            民谣: 'https://music.163.com/discover/playlist/?cat=%E6%B0%91%E8%B0%A3',
            电子: 'https://music.163.com/discover/playlist/?cat=%E7%94%B5%E5%AD%90',
            舞曲: 'https://music.163.com/discover/playlist/?cat=%E8%88%9E%E6%9B%B2',
            说唱: 'https://music.163.com/discover/playlist/?cat=%E8%AF%B4%E5%94%B1',
            轻音乐: 'https://music.163.com/discover/playlist/?cat=%E8%BD%BB%E9%9F%B3%E4%B9%90',
            爵士: 'https://music.163.com/discover/playlist/?cat=%E7%88%B5%E5%A3%AB',
            乡村: 'https://music.163.com/discover/playlist/?cat=%E4%B9%A1%E6%9D%91',
            'R&B/Soul': 'https://music.163.com/discover/playlist/?cat=R%26B%2FSoul',
            古典: 'https://music.163.com/discover/playlist/?cat=%E5%8F%A4%E5%85%B8',
            民族: 'https://music.163.com/discover/playlist/?cat=%E6%B0%91%E6%97%8F',
            英伦: 'https://music.163.com/discover/playlist/?cat=%E8%8B%B1%E4%BC%A6',
            金属: 'https://music.163.com/discover/playlist/?cat=%E9%87%91%E5%B1%9E',
            朋克: 'https://music.163.com/discover/playlist/?cat=%E6%9C%8B%E5%85%8B',
            蓝调: 'https://music.163.com/discover/playlist/?cat=%E8%93%9D%E8%B0%83',
            雷鬼: 'https://music.163.com/discover/playlist/?cat=%E9%9B%B7%E9%AC%BC',
            世界音乐: 'https://music.163.com/discover/playlist/?cat=%E4%B8%96%E7%95%8C%E9%9F%B3%E4%B9%90',
            拉丁: 'https://music.163.com/discover/playlist/?cat=%E6%8B%89%E4%B8%81',
            '另类/独立': 'https://music.163.com/discover/playlist/?cat=%E5%8F%A6%E7%B1%BB%2F%E7%8B%AC%E7%AB%8B',
            'New Age': 'https://music.163.com/discover/playlist/?cat=New%20Age',
            古风: 'https://music.163.com/discover/playlist/?cat=%E5%8F%A4%E9%A3%8E',
            后摇: 'https://music.163.com/discover/playlist/?cat=%E5%90%8E%E6%91%87',
            'Bossa Nova': 'https://music.163.com/discover/playlist/?cat=Bossa%20Nova'
        },
        情绪: {
            '怀旧': 'https://music.163.com/discover/playlist/?cat=%E6%80%80%E6%97%A7',
            '清新': 'https://music.163.com/discover/playlist/?cat=%E6%B8%85%E6%96%B0',
            '浪漫': 'https://music.163.com/discover/playlist/?cat=%E6%B5%AA%E6%BC%AB',
            '性感': 'https://music.163.com/discover/playlist/?cat=%E6%80%A7%E6%84%9F',
            '伤感': 'https://music.163.com/discover/playlist/?cat=%E4%BC%A4%E6%84%9F',
            '治愈': 'https://music.163.com/discover/playlist/?cat=%E6%B2%BB%E6%84%88',
            '放松': 'https://music.163.com/discover/playlist/?cat=%E6%94%BE%E6%9D%BE',
            '孤独': 'https://music.163.com/discover/playlist/?cat=%E5%AD%A4%E7%8B%AC',
            '感动': 'https://music.163.com/discover/playlist/?cat=%E6%84%9F%E5%8A%A8',
            '兴奋': 'https://music.163.com/discover/playlist/?cat=%E5%85%B4%E5%A5%8B',
            '快乐': 'https://music.163.com/discover/playlist/?cat=%E5%BF%AB%E4%B9%90',
            '安静': 'https://music.163.com/discover/playlist/?cat=%E5%AE%89%E9%9D%99',
            '思念': 'https://music.163.com/discover/playlist/?cat=%E6%80%9D%E5%BF%B5'

        },
        场景: {
            '清晨': 'https://music.163.com/discover/playlist/?cat=%E6%B8%85%E6%99%A8',
            '夜晚': 'https://music.163.com/discover/playlist/?cat=%E5%A4%9C%E6%99%9A',
            '午休': 'https://music.163.com/discover/playlist/?cat=%E5%8D%88%E4%BC%91',
            '下午茶': 'https://music.163.com/discover/playlist/?cat=%E4%B8%8B%E5%8D%88%E8%8C%B6',
            '地铁': 'https://music.163.com/discover/playlist/?cat=%E5%9C%B0%E9%93%81',
            '驾车': 'https://music.163.com/discover/playlist/?cat=%E9%A9%BE%E8%BD%A6',
            '运动': 'https://music.163.com/discover/playlist/?cat=%E8%BF%90%E5%8A%A8',
            '旅行': 'https://music.163.com/discover/playlist/?cat=%E6%97%85%E8%A1%8C',
            '散步': 'https://music.163.com/discover/playlist/?cat=%E6%95%A3%E6%AD%A5',
            '酒吧': 'https://music.163.com/discover/playlist/?cat=%E9%85%92%E5%90%A7'

        }
    }
}

Object.keys(seeds).forEach(platform => {
    Object.keys(seeds[platform]).forEach(type1 => {
        Object.keys(seeds[platform][type1]).forEach(type2 => {
            let page = 1;
            let data = [];
            let songListSet = [];
            let url = seeds[platform][type1][type2];
            let kind = {
                platform, type1, type2, url, page, songListSet, data
            };
            if (url.match(/cat/)) {
                getWyCatList(kind);
            }
        });
    });
});