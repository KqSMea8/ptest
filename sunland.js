let fs = require('fs');
let Crawler = require('crawler');
let logger = require('./tool/logger.js').getlogger({
    prgname: 'sunland', datePattern: 'YYYY-MM-DD'
});

let crawler, cates;

start();

function start() {
    crawler = new Crawler({ retries: 0, maxConnections: 5 });
    crawler.on('drain', () => {
        logger.info('all done');
    });
    cates = [
        { name: '经济类', id: '0' }, { name: '法学类', id: '1' },
        { name: '工学类', id: '2' }, { name: '教育学类', id: '3' },
        { name: '文学类', id: '4' }, { name: '理学类', id: '5' },
        { name: '医学类', id: '6' }, { name: '农学类', id: '7' },
        { name: '历史学类', id: '8' }, { name: '哲学类', id: '9' },
        { name: '管理类', id: '10' }
    ];
    cates.forEach(getMajor);
}

function getMajor(cate) {
    crawler.queue({
        uri: 'http://search.zikao.eol.cn/special_more.php?special_sort=' + cate.id,
        callback: (err, res, done) => {
            if (err) {
                logger.error(err);
                getMajor(cate);
                return done();
            } else if (res.statusCode != 200) {
                logger.error(res.statusCode, res.body);
                getMajor(cate);
                return done();
            }
            let $ = res.$;
            logger.info(cate, 'got major: ' + $('#zy_list > a').length);
            $('#zy_list > a').each(function (idx, ele) {
                let catecp = JSON.parse(JSON.stringify(cate));
                catecp.majorName = $(this).text().match(/(.*)(\(.*\))/)[1];
                catecp.majorLevel = $(this).text().match(/(.*)\((.*)\)/)[2];
                catecp.majorUrl = 'http://search.zikao.eol.cn/' + $(this).attr('href');
                getDetail(catecp);
                //return false;
            });
            done();
        }
    });
}

function getDetail(major) {
    crawler.queue({
        uri: major.majorUrl,
        callback: (err, res, done) => {
            if (err) {
                logger.error(err);
                getDetail(major);
                return done();
            } else if (res.statusCode != 200) {
                logger.error(res.statusCode, res.body);
                getDetail(major);
                return done();
            }
            let $ = res.$;
            let scoreTr = $('table.tblue.lh_24 > tbody > tr').eq(3);
            let provinceTr = $('table.tblue.lh_24 tr').eq(5);
            major.score = $('a', scoreTr).eq(1).text();
            logger.info(major, 'got province: ' + $('a', provinceTr).length);
            $('a', provinceTr).each(function () {
                let majorcp = JSON.parse(JSON.stringify(major));
                majorcp.provinceName = $(this).text();
                majorcp.provinceUrl = 'http://search.zikao.eol.cn' + $(this).attr('href');
                getCollege(majorcp);
                //return false;
            });
            done();
        }
    });
}

function getCollege(province) {
    crawler.queue({
        uri: province.provinceUrl,
        callback: (err, res, done) => {
            if (err) {
                logger.error(err);
                getCollege(province);
                return done();
            } else if (res.statusCode != 200) {
                logger.error(res.statusCode, res.body);
                getCollege(province);
                return done();
            }
            let $ = res.$;
            let score = $('table.lh_30.tblue tr').eq(1).children('td').eq(3).text();
            let college = $('table.lh_30.tblue tr').eq(0).children('td').eq(3).text();
            logger.info(province, 'got college:', score, college);
            done();
            fs.appendFileSync('sunland.csv', [province.provinceName, college, province.majorName, province.majorLevel, province.name, province.score, score, province.provinceUrl, province.majorUrl].map(it => (it + '').replace(/[,'"\s]+/g, ' ')).join() + '\n');
        }
    });
}