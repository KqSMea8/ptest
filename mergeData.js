let moment = require('moment');

let today1, today2, kvsMap;

function merge(mongo, platform) {
    let query = { 'date': { $gte: today1 } }, idName = 'docid';
    if (platform == '凤凰') {
        query = {
            'body.cTime': { $gte: today2 },
            'body.wwwurl': { $exists: true }
        };
        idName = 'documentId';
    }
    mongo.collection('final_out').createIndex({ docid: 1 });
    mongo.collection('final_out').createIndex({ ts: 1 });
    mongo.collection('detail_local').find(query).toArray().then(docs => {
        let unique = {};
        docs.forEach(doc => {
            unique[doc[idName]] = doc;
        });
        docs = Object.keys(unique).map(id => mergeData(unique[id], platform));
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
        mongo.close();
    })
}

function mergeData(doc, platform) {
    let rst = {
        content_type: 'news',
        userName: platform,
        comment_count: 0
    }, kvs = kvsMap[platform];
    Object.keys(kvs).forEach(key => {
        let value = kvs[key];
        let newValue = eval("doc." + value);
        rst[key] = newValue;
    });
    if (platform == '一点资讯') {
        rst.bodyImgs = rst.bodyImgs.map(img => {
            return {
                url: 'http://i1.go2yd.com/image.php?url=' + img
            };
        });
    } else {
        rst.publishtime = rst.publishtime.replace(/\//g, '-');
    }
    rst.images = rst.bodyImgs.slice(0, 3);
    return rst;
}

function init() {

    today1 = moment().format('YYYY-MM-DD');
    today2 = moment().format('YYYY/MM/DD');
    kvsMap = {
        '凤凰': {
            "bodyImgs": 'body.img',
            "docid": "documentId",
            "body": "body.text",
            "real_url": "body.wwwurl",
            "title": "body.title",
            "publishtime": "body.cTime",
            "publisher": "body.source",
            "ts": "ts",
            "category": "city"
        }
        ,
        '一点资讯': {
            "bodyImgs": 'image_urls',
            "docid": "docid",
            "body": "content",
            "real_url": "url",
            "title": "title",
            "publishtime": "date",
            "publisher": "source",
            "ts": "ts",
            "category": "city"
        }
    }
}

exports.merge = merge;
