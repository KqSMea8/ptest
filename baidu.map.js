const fs = require('fs');
const moment = require('moment');
const logger = require('winston');
const Crawler = require('crawler');

resultFile = `baidu.map.csv`;
crawler = new Crawler({
    rateLimit: 1000,
    jquery: false,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
});
fs.writeFileSync(resultFile, '\ufeff城市,关键字,店名,店铺ID,地址,电话,tags\n');
kws = process.argv[2].split(',');

crawler.queue({
    uri: 'https://webmap0.bdimg.com/wolfman/static/common/pkg/init-pkg_1ab7c36.js',
    callback: (err, result, done) => {
        if (err) {
            logger.error(err);
            return done();
        }
        let match = result.body.match(/"(中国[^"]+)"/);
        if (!match) return done();
        match[1].split(',').forEach(cityCodeTxt => {
            let [city, code] = cityCodeTxt.split('|');
            if (Number(code) <= 32) return;
            kws.forEach(kw => {
                let gene = { city, code, kw, pageNo: 0 };
                list(gene);
            });
        });
        done();
    }
});

function list(gene) {
    crawler.queue({
        uri: `http://map.baidu.com/?newmap=1&reqflag=pcmap&biz=1&from=webmap&da_par=direct&pcevaname=pc4.1&qt=con&c=${gene.code}&wd=${encodeURIComponent(gene.kw)}&wd2=&pn=${gene.pageNo}&nn=${gene.pageNo * 10}&db=0&sug=0&addr=0&&da_src=pcmappg.poi.page&on_gel=1&src=7&gr=3&l=11&tn=B_NORMAL_MAP&u_loc=12965217,4826576&ie=utf-8&b=()&t=${new Date().getTime()}`,
        gene: gene,
        callback: function (err, result, done) {
            if (err) {
                logger.error(err);
                list(result.options.uri);
                return done();
            }
            let gene = result.options.gene;
            let resultObj = JSON.parse(result.body);
            if (!resultObj.content) {
                logger.warn(`List: ${gene.kw} - ${gene.city} - ${gene.pageNo + 1} 页 - 0 个`);
                return done();
            }
            logger.info(`List: ${gene.kw} - ${gene.city} - ${gene.pageNo + 1} 页 - ${resultObj.content.length} 个`);
            resultObj.content.forEach(obj => {
                let row = [
                    gene.city,
                    gene.kw,
                    obj.name,
                    obj.uid,
                    obj.addr,
                    obj.tel || 'N/A',
                    obj.std_tag
                ].map(item => (item += '').trim().replace(/[\s,"]+/g, ' ')).join();
                fs.appendFileSync(resultFile, row + '\n');
            });
            if ((gene.pageNo + 1) * 10 < resultObj.result.total) {
                gene.pageNo += 1;
                list(gene);
            }
            done();
        }
    });
}