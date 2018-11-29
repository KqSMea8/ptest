

let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;

let mongodb;

MongoClient.connect('mongodb://127.0.0.1:27017/xhs').then(conn => {
    mongodb = conn.db('xhs');
    mongodb.collection('user').createIndex({ pid: 1 });
    mongodb.collection('user').createIndex({ xhsid: 1 });
    mongodb.collection('user').createIndex({ xhsname: 1 });
    let bulk = mongodb.collection('user').initializeUnorderedBulkOp();

    fs.readFileSync('exists.20000').toString().trim().split('\n').forEach(function (line) {


        let info = line.split('\t');
        let doc = {};
        doc['pid'] = info[0].trim();
        doc['pname'] = info[1].trim();
        doc['password'] = info[2].trim();
        doc['xhsid'] = undefined;
        doc['xhsname'] = undefined;
        doc['xhsimg'] = undefined;
        if (doc['xhsid']) {
        }

        bulk.find({
            pid: doc.pid
        }).upsert().update({ $setOnInsert: doc });

    });
    return bulk.execute();
}).then(rst=>{
    console.log('done',rst.length)
});
