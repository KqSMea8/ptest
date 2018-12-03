let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;

let mongodb;
let docs = [];
file = process.argv[2];
fs.readFileSync(file).toString().trim().split('\n').forEach(function (line) {
    let info = line.split('\t');
    let doc = {};
    doc['pid'] = info[0].trim();
    doc['pname'] = info[1].trim();
    doc['password'] = info[2].trim();
    doc['xhsid'] = undefined;
    doc['xhsname'] = undefined;
    doc['xhsimg'] = undefined;
    docs.push(doc);
});

start();

async function start() {
    conn = await MongoClient.connect('mongodb://127.0.0.1:27017/xhs');
    mongodb = conn.db('xhs');
    mongodb.collection('user').createIndex({ pid: 1 });
    mongodb.collection('user').createIndex({ xhsid: 1 });
    mongodb.collection('user').createIndex({ xhsname: 1 });
    await bulk(docs, 100, dealwith)
    console.log('all done')
}

async function bulk(tasks, batch, handle) {
    let step = Math.ceil(tasks.length / batch);
    console.log(tasks.length, batch, step);
    for (let i = 1; i <= step; i++) {
        let tmp_tasks = tasks.slice((i - 1) * batch, i * batch);
        console.log((i - 1) * batch, i * batch);
        await handle(tmp_tasks);
    }
}

function dealwith(docs) {
    let bulk = mongodb.collection('user').initializeUnorderedBulkOp();
    docs.forEach(doc => bulk.find({ pid: doc.pid }).upsert().update({ $setOnInsert: doc }));
    return bulk.execute();
}