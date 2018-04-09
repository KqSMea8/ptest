let moment = require('moment');
let Crawler = require('crawler');
let MongoClient = require('mongodb').MongoClient;
let logger = require('../util/logger.js').getlogger({
    logdir: '../log/',
    prgname: 'yidian.local',
    datePattern: 'YYYY-MM-DD-HH'
});

let cities = getCity(), cityIdx = cities.length - 48;
let sessionid = 'JSESSIONID=ucF0u88t6hg-MighmkxBGw';
let curTs = moment(moment() - 86400000).format('YYYY-MM-DD HH:mm:ss');
let crawler = new Crawler({ jquery: false, retries: 0, rateLimit: 5000 });
let mongo = null, channelNum = 1, mongoCnt = 0, requestCnt = 1;
let mongoUrl = 'mongodb://wifi:zenmen@10.19.83.217:27017/ifeng';
mongoUrl = 'mongodb://wifi:zenmen@127.0.0.1:27018/admin';
mongoUrl = 'mongodb://127.0.0.1:27017/admin';

start();

function start() {
    crawler.on('schedule', (options) => {
        options.limiter = Math.floor(Math.random() * channelNum);
    });
    crawler.on('drain', () => {
        logger.info('all request done');
        requestCnt = 0;
    })
    MongoClient.connect(mongoUrl).then((conn) => {
        mongo = conn.db('yidian');
        mongo.tmpConn = conn;
        mongo.collection('detail_local').createIndex({ docid: 1 });
        switchCity();
    })
}

function switchCity() {
    if (cityIdx < 0) return;
    let city = cities[cityIdx];
    crawler.queue({
        uri: 'https://a1.go2yd.com/Website/user/switch-location?platform=1&cv=4.6.3.1&location=' + encodeURI(city.name) + '&fromid=' + city.fromid + '&channel_id=21229324277',
        headers: {
            'cookie': sessionid,
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; FRD-AL00 Build/HUAWEIFRD-AL00)'
        },
        callback: (err, res, done) => {
            try {
                let rst = JSON.parse(res.body);
                if (rst.status == 'success') {
                    logger.info('switch city success,cityIdx: ' + cityIdx, city);
                    cityIdx--;
                    getList(city, []);
                } else {
                    logger.info('switch city error', city);
                    let tmp = cities[cityIdx];
                    cities[cityIdx] = cities[cityIdx - 1];
                    cities[cityIdx - 1] = tmp;
                    switchCity();
                }
            } catch (e) {
                if (err) {
                    logger.error('network error', err);
                    getList(city);
                } else if (res.statusCode != 200) {
                    logger.error('statusCode error', res.statusCode, res.body);
                } else {
                    logger.error('switch city | unknown error', city, e, res.body);
                }
            }
            done();
        }
    })
}

function getList(city, docList) {
    let idxs = getIdxs(city.page);
    crawler.queue({
        method: 'POST',
        uri: 'https://a1.go2yd.com/Website/channel/news-list-for-channel?searchentry=channel_navibar&reqid=&eventid=&infinite=true&distribution=app.hicloud.com&refresh=0&appid=yidian&cstart=' + idxs.cstart + '&platform=1&cv=4.6.3.1&cend=' + idxs.cend + '&fields=docid&fields=date&fields=image&fields=image_urls&fields=like&fields=source&fields=title&fields=url&fields=comment_count&fields=up&fields=down&version=020700&ad_version=010947&channel_id=21229324277&group_fromid=g181&net=wifi',
        headers: {
            'cookie': sessionid,
            'content-type': 'application/json',
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; FRD-AL00 Build/HUAWEIFRD-AL00)'
        },
        callback: (err, res, done) => {
            try {
                let items = JSON.parse(res.body).result;
                if (items && items.length) {
                    logger.info('got list, length: ' + items.length, city);
                    logger.info(city.name + " " + city.page + ' got total length: ' + items.length)
                    items = items.filter(doc => {
                        if (!doc.date) return false;
                        if (doc.air_quality) return false;
                        if (doc.itemid == 'weather') return false;
                        if (doc.itemid == 'refresh_position') return false;
                        return true;
                    }).map(doc => {
                        doc.city = city.name;
                        return doc;
                    });
                    logger.info(city.name + " " + city.page + ' filter total length: ' + items.length)
                    let rst = items.filter(item => item.date >= curTs);
                    logger.info(city.name + " " + city.page + ' total length: ' + rst.length)
                    logger.info(docList.length, rst.length + docList.length)
                    docList = docList.concat(rst);
                    if (rst.length == 0) {
                        logger.info('get all news, start get detail:' + docList.length);
                        getDetail(city, docList, docList.length - 1);
                    } else {
                        city.page = city.page + 1;
                        getList(city, docList);
                    }
                } else {
                    logger.info('no list data:', city, res.body)
                    getDetail(city, docList, docList.length - 1);
                }
            } catch (e) {
                if (err) {
                    logger.error('network error', err);
                    getList(city, docList);
                } else if (res.statusCode != 200) {
                    logger.error('statusCode error', res.statusCode, res.body);
                } else {
                    logger.error('get list | unknown error', city, e, res.body);
                }
            }
            done();
        }
    })
}

function getDetail(city, docList, idx) {
    if (idx < 0) {
        logger.info('all docs from ' + city.name + ' done,switch next city.');
        switchCity();
        return;
    }
    let doc = docList[idx];
    crawler.queue({
        uri: 'https://a1.go2yd.com/Website/contents/content?appid=yidian&platform=1&cv=4.6.3.1&version=020700&docid=' + doc.docid,
        callback: (err, res, done) => {
            try {
                let detail = JSON.parse(res.body).documents[0];
                logger.info('total length %d , get detail %d ', docList.length, idx)
                idx--;
                detail.ts = moment().format('YYYY-MM-DD HH:mm:ss');
                detail.city = city.name;
                insertDetail(detail);
                getDetail(city, docList, idx);
            } catch (e) {
                if (err) {
                    logger.error('network error', err);
                    getDetail(city, docList, idx);
                } else if (res.statusCode != 200) {
                    logger.error('statusCode error', res.statusCode, res.body);
                } else {
                    logger.error('get detail | unknown error', docList.length, idx, docList[idx], e, res.body, res.options.uri);
                }
            }
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

function mongoDone() {
    if (!mongoCnt && !requestCnt) {
        logger.info('all insert done');
        merge();
    }
}

function merge() {
    mongo.collection('detail_local').find({ 'date': { $gte: curTs } }).toArray().then(docs => {
        let unique = {};
        docs.forEach(doc => {
            unique[doc['docid']] = doc;
        });
        docs = Object.keys(unique).map(id => mergeData(unique[id]));
        return docs;
    }).then(docs => {
        let bulk = mongo.collection('final_out').initializeUnorderedBulkOp();
        docs.forEach(doc => {
            bulk.find({ docid: doc.docid }).upsert().update({
                $setOnInsert: doc
            })
        })
        return bulk.execute();
    }).then(() => {
        mongo.tmpConn.close();
    })
}

function mergeData(doc) {
    let rst = {
        content_type: 'news',
        userName: '一点资讯',
        comment_count: 0
    }, kvs = {
        "bodyImgs": 'image_urls',
        "docid": "docid",
        "body": "content",
        "real_url": "url",
        "title": "title",
        "publishtime": "date",
        "publisher": "source",
        "ts": "ts",
        "category": "city"
    };
    Object.keys(kvs).forEach(key => {
        let value = kvs[key];
        let newValue = eval("doc." + value);
        rst[key] = newValue;
    });
    rst.bodyImgs = rst.bodyImgs || [];
    rst.bodyImgs = rst.bodyImgs.map(img => {
        return { url: 'http://i1.go2yd.com/image.php?url=' + img };
    });
    rst.images = (rst.bodyImgs).slice(0, 3);
    rst.publishtime = Number(new Date(rst.publishtime));
    return rst;
}

function getIdxs(page) {
    return { cstart: (page - 1) * 15, cend: (page) * 15 };
}

function getCity() {
    return [{ name: '北京', fromid: 'u539' },
    { name: '上海', fromid: 'u636' },
    { name: '广州', fromid: 'u641' },
    { name: '深圳', fromid: 'u642' },
    { name: '天津', fromid: 't138' },
    { name: '成都', fromid: 'u644' },
    { name: '杭州', fromid: 'u648' },
    { name: '武汉', fromid: 'u542' },
    { name: '重庆', fromid: 'u595' },
    { name: '南京', fromid: 'u645' },
    { name: '苏州', fromid: 'u647' },
    { name: '西安', fromid: 'u646' },
    { name: '长沙', fromid: 'u786' },
    { name: '沈阳', fromid: 'u643' },
    { name: '青岛', fromid: 'u649' },
    { name: '大连', fromid: 'u935' },
    { name: '东莞', fromid: 'u849' },
    { name: '宁波', fromid: 'u762' },
    { name: '厦门', fromid: 'u680' },
    { name: '福州', fromid: 'u929' },
    { name: '无锡', fromid: 'u744' },
    { name: '合肥', fromid: 'u724' },
    { name: '昆明', fromid: 'u705' },
    { name: '哈尔滨', fromid: 'u781' },
    { name: '济南', fromid: 'u729' },
    { name: '佛山', fromid: 'u8617' },
    { name: '长春', fromid: 'u717' },
    { name: '温州', fromid: 'u763' },
    { name: '石家庄', fromid: 'u753' },
    { name: '南宁', fromid: 'u736' },
    { name: '常州', fromid: 'u8649' },
    { name: '泉州', fromid: 'u928' },
    { name: '南昌', fromid: 'u748' },
    { name: '贵阳', fromid: 'u8633' },
    { name: '太原', fromid: 'u845' },
    { name: '烟台', fromid: 'u730' },
    { name: '嘉兴', fromid: 'u761' },
    { name: '南通', fromid: 'u741' },
    { name: '金华', fromid: 'e301104' },
    { name: '珠海', fromid: 'u734' },
    { name: '惠州', fromid: 'u733' },
    { name: '徐州', fromid: 'u742' },
    { name: '海口', fromid: 'u765' },
    { name: '乌鲁木齐', fromid: 'u739' },
    { name: '绍兴', fromid: 'u8650' },
    { name: '中山', fromid: 'u8625' },
    { name: '台州', fromid: 'u8651' },
    { name: '兰州', fromid: 'u920' },
    { name: '郑州', fromid: 'u760' }].map(i => {
        i.page = 1;
        return i;
    });
}
