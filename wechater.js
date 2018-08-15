let fs = require('fs');
let URL = require('url');
let QR = require('qr-image');
let cheerio = require('cheerio');
let Cralwer = require('crawler');

let uuid;
let SyncKey;
let BaseRequest;
let pass_ticket;
let UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3485.0 Safari/537.36';
let cralwer = new Cralwer({ retries: 0, jquery: false });
let headers1 = { 'Referer': 'https://wx.qq.com/', 'User-Agent': UA };
let headers2 = { 'User-Agent': UA, 'Origin': 'https://wx.qq.com', 'Referer': 'https://wx.qq.com/', 'Content-Type': 'application/json;charset=UTF-8' };

getUUID();

function getUUID() {
    cralwer.queue({
        uri: 'https://login.wx.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=zh_CN&_=' + (+new Date()),
        headers: headers1,
        callback: (err, res, done) => {
            if (err || res.statusCode != 200) {
                console.log('getUUID error: ', err || res.statusCode);
                getUUID();
                return done();
            }
            uuid = (res && res.body || '').match(/uuid = "(.*)"/)[1];
            console.log('got uuid: ' + uuid);
            createQR();
            done();
        }
    });
}

function createQR() {
    let body = 'https://login.weixin.qq.com/l/' + uuid;
    let qrPng = QR.image(body, { type: 'png' });
    qrPng.pipe(fs.createWriteStream(uuid + '.png'));
    qrPng.on('end', function () {
        console.log('createQR success');
        checkLoginStatus();
    });
    qrPng.on('error', function () {
        console.error('createQR error');
    });
}

function checkLoginStatus() {
    let ts = new Date();
    cralwer.queue({
        uri: 'https://login.wx.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid=' + uuid + '&tip=0&r=' + (~ts) + '&_=' + ts,
        headers: headers1,
        callback: function (err, res, done) {
            if (!res || !res.body) {
                console.log('checkLoginStatus error: ', err || (res.statusCode != 200) || res.body)
                checkLoginStatus(uuid);
                return done();
            }
            if (res.body.match(/window\.code=201/)) {
                console.log('checkLoginStatus 201: ');
                checkLoginStatus(uuid);
                return done();
            }
            console.log('checkLoginStatus success');
            let next = res.body.match(/redirect_uri="(.*)"/)[1];
            let query = URL.parse(next, true).query;
            getCookie(query, next);
            done();
        }
    });
}

function getCookie(params, next) {
    cralwer.queue({
        uri: next + '&fun=new&version=v2',
        headers: headers1,
        callback: function (err, res, done) {
            console.log(res.options.uri)
            if (!res || !res.body || !res.body.match(/<ret>0/)) {
                console.log('getCookie error: ', err || (res.statusCode != 200) || res.body);
                getCookie(params);
                return done();
            }
            let $ = cheerio.load(res.body);
            params.skey = $('skey').text().trim();
            params.wxsid = $('wxsid').text().trim();
            params.wxuin = $('wxuin').text().trim();
            pass_ticket = $('pass_ticket').text().trim();
            console.log('getCookie success', params)
            wxInit(params);
            done()
        }
    })
}

function wxInit(params) {
    let url = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=' + (~new Date()) + '&pass_ticket=' + encodeURIComponent(pass_ticket);
    BaseRequest = {
        DeviceID: getDeviceID(),
        Sid: params.wxsid,
        Skey: params.skey,
        Uin: params.wxuin
    };
    cralwer.queue({
        uri: url,
        method: 'POST',
        headers: headers2,
        body: JSON.stringify({ BaseRequest }),
        callback: (err, res, done) => {
            let data;
            try {
                data = JSON.parse(res.body);
                SyncKey = data.SyncKey;
                console.log('init SYNCKEY', SyncKey)
            } catch (e) {
                console.log('wxInit error: ', e, err || (res.statusCode != 200) || res.body);
            }
            console.log('wxInit success: ');
            checkNews();
            done()
        }
    })
}

function checkNews() {
    setInterval(getNews, 5000);
}

function getNews() {
    let rr = ~new Date();
    console.log('start to get news')
    BaseRequest.DeviceID = getDeviceID();
    cralwer.queue({
        uri: 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsync?sid=' + BaseRequest.Sid + '&skey=' + BaseRequest.Skey + '&lang=zh_CN&pass_ticket=' + encodeURI(pass_ticket),
        method: 'POST',
        headers: headers2,
        body: JSON.stringify({ BaseRequest, SyncKey, rr }),
        callback: (err, res, done) => {
            let data;
            try {
                data = JSON.parse(res.body);
                //console.log(res.body)
                SyncKey = data.SyncKey;
                //console.log('getnews',SyncKey)
            } catch (e) {
                console.log('getNews error: ', e, err || (res.statusCode != 200) || res.body);
            }
            console.log('getNews success ');
            let msgList = data.AddMsgList;
            for (let msg of msgList) {
                console.log(JSON.stringify(msg));
            }
            done()
        }
    })
}

function getDeviceID() {
    return "e" + ("" + Math.random().toFixed(15)).substring(2, 17);
}

function getImage(msgId) {
    cralwer.queue({
        uri: 'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxgetmsgimg?&MsgID=' + msgId + '&skey=' + BaseRequest.Skey,
        headers: {
            Cookie: 'webwx_data_ticket='
        },
        callback: function () {

        }
    })
}
