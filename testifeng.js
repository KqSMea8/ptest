let Crawler = require('crawler');
let MongoClient = require('mongodb').MongoClient;
let logger = require('../util/logger.js').getlogger({
    prgname: 'ifeng.local',
    datePattern: 'YYYY-MM-DD-HH'
});

let cities = hotCity();
let crawler = new Crawler({ jquery: false, retries: 0, rateLimite: 5000 });
let mongo = null, proxy = '', channelNum = 1, mongoCnt = 0, requestCnt = 1;
let mongoUrl = 'mongodb://wifi:zenmen@10.19.83.217:27017/ifeng';
mongoUrl = 'mongodb://localhost:27017/ifeng';

start();

function start() {
    crawler.on('schedule', (options) => {
        if (options.uri==115645) {
            console.log(options)
            process.exit()
        }
        //options.proxy = proxy;
        options.limiter = Math.floor(Math.random() * channelNum);
    });

    crawler.on('drain', () => {
        logger.info('all request done')
        requestCnt = 0;
        //mongoDone();
    })
    MongoClient.connect(mongoUrl).then((conn) => {
        mongo = conn;
        mongo.collection('detail_local').createIndex({ documentId: 1 });
        mongo.collection('news_local').createIndex({ documentId: 1 });
        getCity();
    })
}

function getCity() {
    crawler.queue({
        uri: 'http://api.irecommend.ifeng.com/citylist.php',
        callback: (err, res, done) => {
            try {
                let cities = JSON.parse(res.body).list;
                for (let key in cities) {
                    let cityArr = cities[key];
                    for (let city of cityArr) {
                        if (checkCity(city.name)) {
                            city.page = 1;
                            getList(city);
                        }
                    }
                }
                logger.info('step1: get cities success!');
            } catch (e) {
                if (err) {
                    logger.error('network error', err);
                    getCity();
                } else if (res.statusCode != 200) {
                    logger.error('statusCode error', res.statusCode, res.body);
                } else {
                    logger.error('unknown error', res.options.uri, e);
                }
            }
            done();
        }
    })
}

function checkCity(name) {
    let rst = false;
    for (let city of cities) {
        if (name.indexOf(city) > -1) {
            rst = true;
            break;
        }
    }
    return rst;
}

function getList(city) {
    crawler.queue({
        uri: 'http://api.irecommend.ifeng.com/local.php?choicename=' + encodeURI(city.name) + '&choicetype=' + city.type + '&page=' + city.page + '&gv=6.0.6&av=6.0.6&uid=862679030675688',
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' },
        callback: (err, res, done) => {
            try {
                let artiles = JSON.parse(res.body).data.list;
                let items = artiles.item;
                let totalPage = artiles.totalPage;
                for (let item of items) {
                    getDetail(city, item);
                }
                if (city.page == 1) {
                    for (let i = 2; i <= totalPage; i++) {
                        let citycp = JSON.parse(JSON.stringify(city));
                        citycp.page = i;
                        getList(citycp);
                    }
                }
                if (items.length) {
                    insertList(items);
                }
                logger.info('get List success', city);
            } catch (e) {
                if (err) {
                    logger.error('network error', err);
                    getList(city)
                } else if (res.statusCode != 200) {
                    logger.error('statusCode error', res.statusCode, res.body);
                } else {
                    logger.error('unknown error', res.options.uri, e);
                }
            }
            done();
        }
    })

}

function getDetail(city, item) {
    if(item.link.url==115645)
       console.log(item)
    crawler.queue({
        uri: item.link.url,
        priority: 2,
        city,
        item,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' },
        callback: (err, res, done) => {
            let detail;
            try {
                detail = JSON.parse(res.body);
            } catch (e) {
                if (err) {
                    logger.error('network error', err);
                    getDetail(city, item);
                } else if (res.statusCode != 200) {
                    logger.error('statusCode error', res.statusCode, res.body);
                } else {
                    logger.error('not json error', res.options.uri);
                }
            }
            detail.documentId = detail.body.staticId;
            insertDetail(detail);
            done();
        }
    })
}

function insertDetail(detail) {
    mongoCnt++;
    mongo.collection('detail_local').insert(detail).then(() => {
        mongoCnt--;
        mongoDone()
    })
}

function insertList(news) {
    mongoCnt++;
    let batch = mongo.collection('news_local').initializeUnorderedBulkOp();
    for (let n of news) {
        batch.insert(n);
    }
    batch.execute().then(() => {
        mongoCnt--;
        mongoDone();
    });
}

function mongoDone() {
    if (!mongoCnt && !requestCnt) {
        logger.info('all insert done');
        mongo.close();
    }
}


function hotCity() {
    return ['北京',
        '上海',
        '广州',
        '深圳',
        '天津',
        '成都',
        '杭州',
        '武汉',
        '重庆',
        '南京',
        '苏州',
        '西安',
        '长沙',
        '沈阳',
        '青岛',
        '大连',
        '东莞',
        '宁波',
        '厦门',
        '福州',
        '无锡',
        '合肥',
        '昆明',
        '哈尔滨',
        '济南',
        '佛山',
        '长春',
        '温州',
        '石家庄',
        '南宁',
        '常州',
        '泉州',
        '南昌',
        '贵阳',
        '太原',
        '烟台',
        '嘉兴',
        '南通',
        '金华',
        '珠海',
        '惠州',
        '徐州',
        '海口',
        '乌鲁木齐',
        '绍兴',
        '中山',
        '台州',
        '兰州',
        '郑州']
}
