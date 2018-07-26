
let fs = require('fs');
let Crawler = require('crawler');
let logger = require('./logger.js').getRotateLog({
    prgname: 'qianqian.bgm',
    datePattern: 'YYYY-MM-DD'
});

let musicSet = new Set();
let rstFile = 'qianqian.bgm.final.csv';
let crawler = new Crawler({
    retries: 0,
    rateLimit: 1000
});
let headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
}
let left = 0;
function getQqTagList(kind, page) {
    let url = 'http://music.taihe.com/tag/' + encodeURIComponent(kind.type2) + '?start=' + (page - 1) * 20 + '&size=20&third_type=0';
    crawler.queue({
        uri: url,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getQqTagList error', err || res.body, url);
                getQqTagList(kind);
                return done();
            }
            let $ = res.$;
            $('li[data-songitem]').each(function () {
                let data = $(this).attr('data-songitem').replace(/&quot;/g, '"');
                let user = $('.author_list a', this).first().attr('href');
                data = JSON.parse(data);

                getQqDetail(kind, {
                    id: data.songItem.sid,
                    name: data.songItem.sname,
                    user: user,
                    uname: data.songItem.author
                });

                // if (!musicSet.has(data.songItem.sid)) {
                //     getQqDetail(kind, {
                //         id: data.songItem.sid,
                //         name: data.songItem.sname,
                //         user: user,
                //         uname: data.songItem.author
                //     });
                //     musicSet.add(data.songItem.sid);
                // }
            });

            if (page === 1) {
                let totalNums = + $('.total .nums').text();
                logger.info(totalNums, 1, url)
                totalNums = totalNums > 500 ? 500 : totalNums;
                totalNums = Math.ceil(totalNums / 20);
                logger.info(totalNums, 2)
                for (let i = 2; i <= totalNums; i++) {
                    getQqTagList(kind, i);
                }
            }
            done();
        }
    });
}


function getQqDetail(line) {
    //fs.appendFileSync(rstFile, [kind.platform, kind.type1, kind.type2, song.name, song.id, song.uname, song.user].join() + '\n');
    //return;
    let url = 'http://music.taihe.com/data/tingapi/v1/restserver/ting?method=baidu.ting.song.baseInfo&songid=' + line[4] + '&from=web';
    crawler.queue({
        uri: url,
        priority: 1,
        jquery: false,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                logger.error('getQqDetail error', err || res.body, url,line);
                getQqDetail(line);
                return done();
            }
            let data = JSON.parse(res.body).content;
            if(!data){
                logger.error(line,url,res.body)
                process.exit();
            }
            let share = data.share_num;
            let comments = data.comment_num;
            left++;
            logger.info('got detail ' + left, line, share, comments);
            fs.appendFileSync(rstFile, line.join() + ',' + [comments, share].join() + '\n');
            done();
        }
    });
}

let seeds = {
    千千: {
        场景: {
            '校园': 'http://music.taihe.com/tag/%E6%A0%A1%E5%9B%AD',
            '旅行': 'http://music.taihe.com/tag/%E6%97%85%E8%A1%8C',
            '背景音乐': 'http://music.taihe.com/tag/%E8%83%8C%E6%99%AF%E9%9F%B3%E4%B9%90',
            '午后': 'http://music.taihe.com/tag/%E5%8D%88%E5%90%8E',
            '酒吧': 'http://music.taihe.com/tag/%E9%85%92%E5%90%A7',
            '咖啡厅': 'http://music.taihe.com/tag/%E5%92%96%E5%95%A1%E5%8E%85'
        },
        曲风: {
            '摇滚': 'http://music.taihe.com/tag/%E6%91%87%E6%BB%9A',
            '古典': 'http://music.taihe.com/tag/%E5%8F%A4%E5%85%B8%E9%9F%B3%E4%B9%90',
            '节奏布鲁斯': 'http://music.taihe.com/tag/%E8%8A%82%E5%A5%8F%E5%B8%83%E9%B2%81%E6%96%AF',
            '乡村': 'http://music.taihe.com/tag/%E4%B9%A1%E6%9D%91',
            '民谣': 'http://music.taihe.com/tag/%E6%B0%91%E8%B0%A3',
            '电子': 'http://music.taihe.com/tag/%E7%94%B5%E5%AD%90',
            '爵士': 'http://music.taihe.com/tag/%E7%88%B5%E5%A3%AB',
            '流行': 'http://music.taihe.com/tag/%E6%B5%81%E8%A1%8C',
            '布鲁斯': 'http://music.taihe.com/tag/%E5%B8%83%E9%B2%81%E6%96%AF',
            '世界音乐': 'http://music.taihe.com/tag/%E4%B8%96%E7%95%8C%E9%9F%B3%E4%B9%90',
            '新世纪': 'http://music.taihe.com/tag/%E6%96%B0%E4%B8%96%E7%BA%AA',
            '雷鬼': 'http://music.taihe.com/tag/%E9%9B%B7%E9%AC%BC',
            '金属': 'http://music.taihe.com/tag/%E9%87%91%E5%B1%9E'
        },
        风格: {
            '小清新': 'http://music.taihe.com/tag/%E5%B0%8F%E6%B8%85%E6%96%B0',
            'DJ舞曲': 'http://music.taihe.com/tag/DJ%20%E8%88%9E%E6%9B%B2',
            '纯净': 'http://music.taihe.com/tag/%E7%BA%AF%E5%87%80',
            '唯美': 'http://music.taihe.com/tag/%E5%94%AF%E7%BE%8E',
            '轻音乐': 'http://music.taihe.com/tag/%E8%BD%BB%E9%9F%B3%E4%B9%90',
            '舒缓': 'http://music.taihe.com/tag/%E8%88%92%E7%BC%93',
            '劲爆': 'http://music.taihe.com/tag/%E5%8A%B2%E7%88%86',
            '慢摇': 'http://music.taihe.com/tag/%E6%85%A2%E6%91%87',
            '民歌': 'http://music.taihe.com/tag/%E6%B0%91%E6%AD%8C',
            '青春': 'http://music.taihe.com/tag/%E9%9D%92%E6%98%A5',
            '好听': 'http://music.taihe.com/tag/%E5%A5%BD%E5%90%AC'
        },

        心情: {
            '伤感': 'http://music.taihe.com/tag/%E4%BC%A4%E6%84%9F',
            '激情': 'http://music.taihe.com/tag/%E6%BF%80%E6%83%85',
            '安静': 'http://music.taihe.com/tag/%E5%AE%89%E9%9D%99',
            '舒服': 'http://music.taihe.com/tag/%E8%88%92%E6%9C%8D',
            '甜蜜': 'http://music.taihe.com/tag/%E7%94%9C%E8%9C%9C',
            '励志': 'http://music.taihe.com/tag/%E5%8A%B1%E5%BF%97',
            '寂寞': 'http://music.taihe.com/tag/%E5%AF%82%E5%AF%9E',
            '想念': 'http://music.taihe.com/tag/%E6%83%B3%E5%BF%B5',
            '浪漫': 'http://music.taihe.com/tag/%E6%B5%AA%E6%BC%AB',
            '怀念': 'http://music.taihe.com/tag/%E6%80%80%E5%BF%B5',
            '喜悦': 'http://music.taihe.com/tag/%E5%96%9C%E6%82%A6',
            '深情': 'http://music.taihe.com/tag/%E6%B7%B1%E6%83%85',
            '美好': 'http://music.taihe.com/tag/%E7%BE%8E%E5%A5%BD',
            '怀旧': 'http://music.taihe.com/tag/%E6%80%80%E6%97%A7',
            '轻松': 'http://music.taihe.com/tag/%E8%BD%BB%E6%9D%BE'
        },
        主题: {
            '情歌': 'http://music.taihe.com/tag/%E6%83%85%E6%AD%8C',
            '古风': 'http://music.taihe.com/tag/%E5%8F%A4%E9%A3%8E',
            '网络歌曲': 'http://music.taihe.com/tag/%E7%BD%91%E7%BB%9C%E6%AD%8C%E6%9B%B2',
            '中国风': 'http://music.taihe.com/tag/%E4%B8%AD%E5%9B%BD%E9%A3%8E'
        }
    }

}

let hasDone = new Set();
fs.writeFileSync('qianqian.csv', '\ufeffplatform,type1,type2,songName,songId,authorName,authorId,comments,shares\n');
fs.readFileSync('qianqian.bgm.final.csv').toString().trim().split('\n').forEach(function (line) {
    if(line.split(',').length>9){
        logger.error('find error 1',line)
    }else{

        hasDone.add(line.split(',')[4]);
        fs.appendFileSync('qianqian.csv',line+'\n');
    }

})

fs.readFileSync('qianqian.bu').toString().trim().split('\n').forEach(function (line) {

    if (line.split(',').length != 7) {
        logger.error('find error 2', line)
    }else{

        line = line.split(',');
    
        if (hasDone.has(line[4])) return;
        getQqDetail(line);
    }

})

// Object.keys(seeds).forEach(platform => {
//     Object.keys(seeds[platform]).forEach(type1 => {
//         Object.keys(seeds[platform][type1]).forEach(type2 => {
//             let url = seeds[platform][type1][type2];
//             let kind = {
//                 platform, type1, type2, url
//             };
//             getQqTagList(kind, 1);
//         });
//     });
// });

//'https://music.163.com/#/discover/playlist/?order=hot&cat=%E6%B5%81%E8%A1%8C&limit=35&offset=70'