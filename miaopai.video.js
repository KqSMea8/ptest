let cheerio = require('cheerio')
let moment = require('moment');
let Crawler = require('crawler');
let MongoClient = require('mongodb').MongoClient;

let mongoUrl = 'mongodb://127.0.0.1:27017/miaopai_video',
    mongoConn, userSet = {}, insertBuffer = [], flags = ['fans', 'follow'];
let crawler = new Crawler({
    jquery: false, rateLimit: 2000, retries: 0, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
});
start();

function start() {
    MongoClient.connect(mongoUrl).then((conn) => {
        mongoConn = conn;
        mongoConn.collection('user').createIndex({ uid: 1 });
        return mongoConn.collection('user').find({}, { ts: 0, _id: 0 }).toArray();
    }).then(users => {
        //users = [{ uid: 'paike_cxjpi6og2c', suid: 'tQ6BWHLEmxIJhB5j' }];
        for (let user of users) {
            userSet[user.uid] = user;
            getInfo(user);
        }
    })
}

function getInfo(user) {
    flags.forEach(flag => {
        if (!user[flag]) getFlag(user, 1, flag);
    })
}

function getFlag(user, page, flag) {
    crawler.queue({
        uri: 'https://www.miaopai.com/gu/' + flag + '?page=' + page + '&suid=' + user.suid,
        priority: 3,
        callback: (err, res, done) => {
            cb(user, page, flag, err, res, done)
        }
    })
}

function cb(user, page, flag, err, res, done) {
    if (err) {
        console.log(err)
        getFlag(user, page);
        return done();
    }
    if (res.statusCode != 200) {
        console.log(res.statusCode, res.body, res.options.uri);
        process.exit()
        getFlag(user, page);
        return done();
    }
    let msg;
    try {
        msg = JSON.parse(res.body).msg;
    } catch (e) {
        console.log('json parse error', res.body, res.options.uri);
        process.exit();
        return done();
    }
    let $ = cheerio.load(msg || '');
    let newUsers = [];
    $('.box_top').each(function () {
        let uid = $('a', this).first().attr('href').match(/com\/u\/(.*)/)[1];
        let suid = $('button.small_guanzhu.gz', this).attr('suid');
        newUsers.push({ uid, suid });
    });
    console.log('got Users:', user.uid, flag, page, newUsers.length)
    for (newUser of newUsers) {
        if (userSet[newUser.uid]) continue;
        userSet[newUser.uid] = newUser;
        insertUser(newUser);
        getInfo(newUser);
    }
    if (newUsers.length >= 16) {
        getFlag(user, page + 1, flag);
    } else {
        userSet[user.uid][flag] = new Date();
        insertUser(user);
        console.log(user.uid, flag, ' reach bottom');
    }
    done();
}

function insertUser(user) {
    insertBuffer.push(user);
    if (insertBuffer.length < 100) return;
    let batch = mongoConn.collection('user').initializeUnorderedBulkOp();
    for (let iuser of insertBuffer) {
        batch.find({ uid: iuser.uid }).upsert().updateOne({
            $set: {
                fans: iuser.fans,
                follow: iuser.follow,
                suid: iuser.suid
            },
            $setOnInsert: { ts: new Date() }
        });
    }
    insertBuffer = [];
    batch.execute().then(() => {
        console.log('insert 2000');
    });
}
