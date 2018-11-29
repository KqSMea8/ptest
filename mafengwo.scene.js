let fs = require('fs');
let Crawler = require('crawler');
let cheerio = require('cheerio');

let crawler = new Crawler({ rateLimit: 4000, jquery: false });
let UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36';
let countries = readSeed('mafengwo.seed');
console.log('country num', countries.length);
for (country of countries) {
    queryCountry(country);
}

function readSeed(seed) {
    return fs.readFileSync(seed).toString().trim().split('\n').map(info => {
        info = info.split(',');
        return {
            enname: info[0].trim(),
            name: info[1].trim(),
            id: info[2].trim(),
            page: 1
        }
    });
}

function queryCountry(country) {
    console.log('ready request', country);
    crawler.queue({
        method: 'POST',
        uri: 'http://www.mafengwo.cn/mdd/base/list/pagedata_citylist',
        headers: {
            'Host': 'www.mafengwo.cn',
            'Origin': 'http://www.mafengwo.cn',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'http://www.mafengwo.cn/mdd/citylist/' + country.id + '.html',
            'User-Agent': UA
        },
        form: {
            'mddid': country.id,
            'page': country.page
        },
        callback: function (err, res, done) {
            if (err) {
                console.log(err, country);
                queryCountry(country);
                return done();
            }

            let data = JSON.parse(res.body);
            let domList = cheerio.load(data.list);
            let domPage = cheerio.load(data.page);
            domList('li.item').each(function () {
                let city = { page: 1 };
                city['id'] = domList('div.img > a', this).attr('data-id').trim();
                city['name'] = domList('div.img div.title', this).contents().first().text().replace(/[\n,]/g, '').trim();
                city['enname'] = domList('div.img div.title p.enname', this).text().replace(/[\n,]/g, '').trim();
                queryCity(country, city);
            });
            let totalPage = domPage('.count').text().match(/(\d+)/)[1];
            if (country.page < Number(totalPage)) {
                country.page++;
                queryCountry(country);
            }
            return done();
        }
    });
}

function queryCity(country, city) {
    console.log('ready request city', city);
    crawler.queue({
        priority: 3,
        method: 'POST',
        uri: 'http://www.mafengwo.cn/ajax/router.php',
        headers: {
            'Host': 'www.mafengwo.cn',
            'Origin': 'http://www.mafengwo.cn',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'http://www.mafengwo.cn/jd/' + city.id + '/gonglve.html',
            'User-Agent': UA
        },
        form: {
            'iTagId': '0',
            'iMddid': city.id,
            'iPage': city.page,
            'sAct': 'KMdd_StructWebAjax|GetPoisByTag'
        },
        callback: function (err, res, done) {
            if (err) {
                console.log(err, country, city);
                queryCity(country, city);
                return done();
            }
            let data = JSON.parse(res.body);
            let domList = cheerio.load(data.data.list);
            let domPage = cheerio.load(data.data.page);

            domList('li').each(function () {
                let scene = {};
                scene['url'] = 'http://www.mafengwo.cn' + domList('a', this).first().attr('href');
                scene['title'] = domList('a', this).first().attr('title').replace(/[\n,]/g, '').trim();
                scene['name'] = domList('h3', this).text().replace(/[\n,]/g, '').trim();
                queryScene(country, city, scene);
            });

            let totalPage = domPage('.count span').first().text().trim()
            if (city.page < Number(totalPage)) {
                city.page++;
                queryCity(country, city);
            }
            return done();
        }
    });
}

function queryScene(country, city, scene) {
    fs.appendFileSync('mfw.scene', [country.name, country.enname, country.id, city.name, city.enname, city.id, scene.title, scene.name, scene.url].join() + '\n');
}