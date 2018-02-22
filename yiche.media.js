let fs = require('fs');
let Crawler = require('crawler');

let step = 1, ids = {};
let crawler = new Crawler({ retries: 0, maxConnections: 5 });
crawler.on('drain', () => {
    console.log('all done!' + step);
    step++;
    if (step === 2) {
        Object.keys(ids).forEach(getFan);
    } else if (step === 3) {
        Object.keys(ids).forEach(getArticle);
    } else {
        writeFile();
    }
});

getList(1);

function getList(page) {
    crawler.queue({
        uri: 'http://hao.yiche.com/author/GetRecommendListByType?type=4&pageindex=' + page + '&pagesize=20',
        callback: (err, res, done) => {
            if (err) {
                console.error(err);
                getList(page);
                return done();
            }
            if (res.statusCode != 200) {
                console.error(res.statusCode, res.body);
                getList(page);
                return done();
            }
            console.log(res.options.uri);
            let $ = res.$;

            if (!$ || !$('li').length) {
                console.log('reach buttom: ', page);
            } else {
                getList(page + 1);
                console.log('got page ' + page + ": " + $('li').length)
                $('li').each(function () {
                    let url = $('.v-img a', this).attr('href').match(/zuozhe\/(\d+)/)[1];
                    let name = $('.name-box a', this).text();
                    ids[url] = { name };
                });
            }
            return done();
        }
    })
}

function getFan(id) {
    crawler.queue({
        uri: 'http://i.yiche.com/u' + id + '/',
        callback: (err, res, done) => {
            if (err) {
                console.error(err);
                getFan(id);
                return done();
            }
            if (res.statusCode != 200) {
                console.error(res.statusCode, res.body);
                getFan(id);
                return done();
            }
            let $ = res.$;
            ids[id]['关注'] = $('.ta_guanzhu .one dt').text();
            ids[id]['粉丝'] = $('.ta_guanzhu .two dt').text();
            console.log('got fan:', ids[id]);
            done();
        }
    })
}

function getArticle(id) {
    crawler.queue({
        uri: 'http://h5.ycapp.yiche.com/MediaHome/GetMediaWorksList?userId=' + id + '&pageSize=20&pageIndex=1',
        jquery: false,
        callback: (err, res, done) => {
            if (err) {
                console.error(err);
                getArticle(id);
                return done();
            }
            if (res.statusCode != 200) {
                console.error(res.statusCode, res.body);
                getArticle(id);
                return done();
            }
            try {
                var articles = JSON.parse(res.body).data.data.totalCount;
            } catch (e) {
                console.error('parse error', e);
                console.error(res.body, res.options.uri);
                process.exit();
            }
            ids[id]['文章'] = articles;
            console.log('got article:', ids[id])
            done();
        }
    })
}

function writeFile() {
    Object.keys(ids).forEach(id => {
        fs.appendFileSync('./yiche.media.csv', [id, ids[id].name, ids[id]['关注'], ids[id]['粉丝'], ids[id]['文章']].map(it => (it + '').replace(/[,"'\s]+/g, ' ')).join() + '\n');
    })
}