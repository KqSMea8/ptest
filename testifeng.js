let Crawler = require('crawler');
let MongoClient = require('mongodb').MongoClient;
let logger = require('./tool/logger.js').getlogger({
    logdir: './log/',
    prgname: 'ifeng.local',
    datePattern: 'YYYY-MM-DD-HH'
});

let cities = hotCity();
let mongo = null, mongoCnt = 0, requestCnt = 1;
let crawler = new Crawler({ jquery: false, retries: 0, maxConnections: 5 });
let mongoUrl = 'mongodb://localhost:27017/ifeng';

start();

function start() {
    crawler.on('drain', () => {
        logger.info('all request done')
        requestCnt = 0;
    })
    MongoClient.connect(mongoUrl).then((conn) => {
        mongo = conn;
        mongo.collection('detail_local').createIndex({ documentId: 1 });
        mongo.collection('news_local').createIndex({ documentId: 1 });
        for (let city of cities) {
            city.page = 1;
            getList(city);
        }
    })
}

function getList(city) {
    crawler.queue({
        uri: 'http://api.irecommend.ifeng.com/local.php?choicename=' + encodeURI(city.name) + '&choicetype=' + city.type + '&page=' + city.page + '&gv=6.0.6&av=6.0.6&uid=862679030675688',
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36' },
        priority: 4,
        callback: (err, res, done) => {
            try {
                let artiles = JSON.parse(res.body).data.list;
                let items = artiles.item;
                let totalPage = artiles.totalPage;
                for (let item of items) {
                    item.city = city.name;
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
                logger.info('get List success', city.name, city.page, totalPage);
            } catch (e) {
                if (err) {
                    logger.error('network error', err + '');
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
    if (!item.link.url.match(/http:\/\/api/)) {
        logger.error('not legal url', JSON.stringify(item));
        return;
    }
    crawler.queue({
        uri: item.link.url,
        priority: 2,
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
                return done();
            }
            if (!detail || !detail.body) {
                logger.error('has no data', res.options.uri);
                return done();
            }
            detail.documentId = detail.body.staticId;
            insertDetail(detail);
            logger.info('get detail success', item.link.url)
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
    return [{
        name: '北京',
        type: 'city',
        id: 'loc_bj'
    },
    {
        name: '重庆',
        type: 'city',
        id: 'loc_cq',
        imcp_id: 'CITY_CHONGQING,FOCUSCITY_CHONGQING'
    },
    {
        name: '成都',
        type: 'city',
        id: 'loc_cd',
        imcp_id: 'CITY_CHENGDU,FOCUSCITY_CHENGDU'
    },
    {
        name: '长沙',
        type: 'city',
        id: 'loc_cs'
    },
    {
        name: '长春',
        type: 'city',
        id: 'loc_cc'
    },
    {
        name: '常州',
        type: 'city',
        id: 'loc_cz',
        imcp_id: 'CITY_CHANGZHOU,FOCUSCITY_CHANGHZOU'
    },
    { name: '大连', type: 'city', id: 'loc_dl' },
    {
        name: '东莞',
        type: 'city',
        id: 'loc_dg',
        imcp_id: 'CITY_DONGGUAN,FOCUSCITY_DONGGUAN'
    },
    { name: '福州', type: 'city', id: 'loc_fz' },
    {
        name: '佛山',
        type: 'city',
        id: 'loc_fs',
        imcp_id: 'CITY_FOSHAN,FOCUSCITY_FOSHAN'
    },
    {
        name: '广州',
        type: 'city',
        id: 'loc_gz',
        imcp_id: 'CITY_GUANGZHOU,FOCUSCITY_GUANGZHOU'
    },
    { name: '贵阳', type: 'city', id: 'loc_gy' },
    {
        name: '杭州',
        type: 'city',
        id: 'loc_hz',
        imcp_id: 'CITY_HANGZHOU,FOCUSCITY_HANGZHOU'
    },
    {
        name: '哈尔滨',
        type: 'city',
        id: 'loc_herb',
        imcp_id: 'CITY_HAERBIN,FOCUSCITY_HAERBIN'
    },
    {
        name: '海口',
        type: 'city',
        id: 'loc_haik',
        imcp_id: 'CITY_HAIKOU,FOCUSCITY_HAIKOU'
    },
    {
        name: '合肥',
        type: 'city',
        id: 'loc_hf',
        imcp_id: 'CITY_HEFEI,FOCUSCITY_HEFEI'
    },
    {
        name: '惠州',
        type: 'city',
        id: 'loc_huiz',
        imcp_id: 'CITY_HUIZHOU,FOCUSCITY_HUIZHOU'
    },
    {
        name: '济南',
        type: 'city',
        id: 'loc_jn',
        imcp_id: 'CITY_JINAN,FOCUSCITY_JINAN'
    },
    {
        name: '嘉兴',
        type: 'city',
        id: 'loc_jxing',
        imcp_id: 'CITY_JIAXING,FOCUSCITY_JIAXING'
    },
    {
        name: '金华',
        type: 'city',
        id: 'loc_jh',
        imcp_id: 'CITY_JINHUA,FOCUSCITY_JINHUA'
    },
    { name: '昆明', type: 'city', id: 'loc_km' },
    { name: '兰州', type: 'city', id: 'loc_lz' },
    {
        name: '南京',
        type: 'city',
        id: 'loc_nj',
        imcp_id: 'CITY_NANJING,FOCUSCITY_NANJING'
    },
    {
        name: '南昌',
        type: 'city',
        id: 'loc_nc',
        imcp_id: 'CITY_NANCHANG,FOCUSCITY_NANCHANG'
    },
    {
        name: '宁波',
        type: 'city',
        id: 'loc_nbo',
        imcp_id: 'CITY_NINGBO,FOCUSCITY_NINGBO'
    },
    {
        name: '南通',
        type: 'city',
        id: 'loc_nt',
        imcp_id: 'CITY_NANTONG,FOCUSCITY_NANTONG'
    },
    { name: '南宁', type: 'city', id: 'loc_nn' },
    {
        name: '青岛',
        type: 'city',
        id: 'loc_qd',
        imcp_id: 'CITY_QINGDAO,FOCUSCITY_QINGDAO'
    },
    { name: '泉州', type: 'city', id: 'loc_qz' },
    { name: '上海', type: 'city', id: 'loc_sh' },
    {
        name: '深圳',
        type: 'city',
        id: 'loc_sz',
        imcp_id: 'CITY_SHENZHEN,FOCUSCITY_SHENZHEN'
    },
    { name: '沈阳', type: 'city', id: 'loc_sheny' },
    {
        name: '石家庄',
        type: 'city',
        id: 'loc_sjz',
        imcp_id: 'CITY_SHIJZ,FOCUSCITY_SHIJZ'
    },
    {
        name: '苏州',
        type: 'city',
        id: 'loc_szhou',
        imcp_id: 'CITY_SUZHOU2,FOCUSCITY_SUZHOU2'
    },
    {
        name: '绍兴',
        type: 'city',
        id: 'loc_sxing',
        imcp_id: 'CITY_SHAOXING,FOCUSCITY_SHAOXING'
    },
    { name: '天津', type: 'city', id: 'loc_tj' },
    { name: '太原', type: 'city', id: 'loc_ty' },
    {
        name: '台州',
        type: 'city',
        id: 'loc_tzhou',
        imcp_id: 'CITY_TAIZHOU1,FOCUSCITY_TAIZHOU1'
    },
    { name: '武汉', type: 'city', id: 'loc_wh' },
    {
        name: '温州',
        type: 'city',
        id: 'loc_wz',
        imcp_id: 'CITY_WENZHOU,FOCUSCITY_WENZHOU'
    },
    { name: '乌鲁木齐', type: 'city', id: 'loc_wlmq' },
    {
        name: '无锡',
        type: 'city',
        id: 'loc_wx',
        imcp_id: 'CITY_WUXI,FOCUSCITY_WUXI'
    },
    { name: '厦门', type: 'city', id: 'loc_sm' },
    {
        name: '西安',
        type: 'city',
        id: 'loc_xian',
        imcp_id: 'CITY_XIAN,FOCUSCITY_XIAN'
    },
    {
        name: '徐州',
        type: 'city',
        id: 'loc_xz',
        imcp_id: 'CITY_XUZHOU1,FOCUSCITY_XUZHOU1'
    },
    {
        name: '烟台',
        type: 'city',
        id: 'loc_yt',
        imcp_id: 'CITY_TANTAI,FOCUSCITY_TANTAI'
    },
    {
        name: '郑州',
        type: 'city',
        id: 'loc_zz',
        imcp_id: 'CITY_ZHENGZHOU,FOCUSCITY_ZHENGZHOU'
    },
    {
        name: '中山',
        type: 'city',
        id: 'loc_zs',
        imcp_id: 'CITY_ZHONGSHAN,FOCUSCITY_ZHONGSHAN'
    },
    {
        name: '珠海',
        type: 'city',
        id: 'loc_zh',
        imcp_id: 'CITY_ZHUHAI,FOCUSCITY_ZHUHAI'
    }];

}