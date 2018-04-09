let Crawler = require('crawler');
let fs = require('fs')
let cheerio = require('cheerio')
let crawler = new Crawler({ jquery: false, retries: 0, maxConnections: 20 });
let dynamic_proxy_user = "HC67566AX92R3BPD"
let dynamic_proxy_password = "2D41929BE6F32E6C"
let proxy = "http://" + dynamic_proxy_user + ":" + dynamic_proxy_password + "@http-dyn.abuyun.com:9020";
let total = 0, step = 1;

start()

function start() {
    crawler.on('drain', () => {
        step++;
        if (step == 2) {
            detailStart()
        }else {
            console.log('all done')
        }
    })
    listStart()
}

function listStart() {
    ['电影', '电视剧', '综艺'].forEach(cate => {
        getList(cate, 0);
    })
}

function detailStart() {
    fs.readFileSync('douban.txt').toString().trim().split('\n').forEach(line => {
        line = line.split('|')
        total++;
        let item = {
            id: line[0],
            cate: line[1],
            url: line[2],
            rate: line[3]
        }
        getDetail(item)
    })
}


function getList(cate, start) {
    crawler.queue({
        uri: 'https://movie.douban.com/j/new_search_subjects?sort=T&tags=' + encodeURI(cate) + '&start=' + start,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' },
        proxy: proxy,
        callback: (err, res, done) => {
            if (err || res.statusCode != 200) {
                console.log(err || res.statusCode)
                getList(cate, start)
                return done()
            }
            let data = JSON.parse(res.body).data
            console.log(cate, start, data.length)
            for (one of data) {
                fs.appendFileSync('douban.txt', [one.id, cate, one.url, one.rate].join('|') + '\n')
            }
            if (data.length > 15) {
                getList(cate, start + data.length)
            }
            done()
        }
    })
}

function getDetail(item) {
    crawler.queue({
        uri: item.url,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' },
        proxy: proxy,
        callback: (err, res, done) => {
            if (err || res.statusCode != 200) {
                console.log(err || res.statusCode)
                getDetail(item)
                return done()
            }
            console.log('total left: ', total--)
            let $ = cheerio.load(res.body);
            let name = $('#content > h1').text().replace(/[\r\n\s]+/g, '');
            let rst = $('#info').text();
            let kvs = rst.split('\n').map(kv => {
                return kv.split(':')
            }).filter(kv => {
                return kv.length == 2
            }).map(kv => {
                return kv.map(i => i.replace(/[\r\s\n]+/g, '').trim())
            });
            let doc = { id: item.id, cate: item.cate, name: name, rate: item.rate }
            for (kv of kvs) {
                doc[kv[0]] = kv[1];
            }
            fs.appendFileSync('douban.final.txt', JSON.stringify(doc) + '\n')
            done()
        }
    })
}
