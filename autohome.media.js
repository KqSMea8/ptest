let fs = require('fs');
let Crawler = require('crawler');

let crawler = new Crawler({ retries: 0 });
crawler.on('drain', () => {
    console.log('all done!');
});

getList(1);

function getList(page) {
    crawler.queue({
        uri: 'https://chejiahao.autohome.com.cn/Authors/AuthorListMore?orderType=3&page=' + page + '&userCategory=13',
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
            let $ = res.$;

            if (!$ || !$('.list-box').length) {
                console.log('reach buttom: ', page);
            } else {
                getList(page + 1);
                console.log('got page ' + page + ": " + $('.list-box').length)
                $('.list-box').each(function () {
                    let url = $('a', this).attr('href');
                    let name = $('.list-title', this).text();
                    let fans = $('.list-num span.num', this).eq(0).text();
                    let articles = $('.list-num span.num', this).eq(1).text();
                    fs.appendFileSync('./autohome.media.csv', [url, name, fans, articles].map(it => (it + '').replace(/[,"'\s]+/g, ' ')).join() + '\n');
                });
            }
            return done();
        }
    })
}