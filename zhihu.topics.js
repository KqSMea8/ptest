let Crawler = require('crawler');
let cheerio = require('cheerio');

let crawler = new Crawler({ jquery: false });

let form = { method: 'next', params: JSON.stringify({ "topic_id": 833, "offset": 60, "hash_id": "8dacaab9dc9ab268881a0cffdc2425a2" }) };

crawler.queue({
    uri: 'https://www.zhihu.com/node/TopicsPlazzaListV2',
    method: 'POST',
    headers: {
        'X-Requested-With': ' XMLHttpRequest',
        'Host': 'www.zhihu.com',
        'Origin': ' https://www.zhihu.com',
        'X-Xsrftoken': '95b6acb9-dae0-4bc4-996d-4bfa98afa55c',
        Cookie: 'q_c1=223770340bd34056a26644dcc41a5c64|1524204690000|1524204690000; aliyungf_tc=AQAAAMzIK3vMhQEAUamHPRJy4gjHfetp; _xsrf=95b6acb9-dae0-4bc4-996d-4bfa98afa55c; _zap=721da029-786c-4e68-a7ea-bbcc6edd7ac7; d_c0="AADg_krrfg2PTpFjs8jdJwqycH-k7Est-x8=|1524635696"; l_n_c=1; l_cap_id="NzFiODUzOWQzM2RjNDE5NjgwZGI1MDY0MjIxMGUzYWI=|1524723805|8ee893452892d47a7b5d59af282340aa34528862"; r_cap_id="NzEzMGFjMjE1NWMzNDgwZDllYjUwMjYyZTViYzYwNDA=|1524723805|f85e021e1e1f99d069ba211b47418d9d29b5f69c"; cap_id="NWQ5ODQ2NzI3MmRlNGMzYzk3ZjljMGRjZDA5OWNkOTE=|1524723805|7e486c3897d05775d6d097b7d2429e416074dd72"; n_c=1; capsion_ticket="2|1:0|10:1524724315|14:capsion_ticket|44:ZjM0YWIwZmI4MjNiNDBkMGE4ODk0MzFjNzQwMTBmYTI=|f2b68e06255f9136ff04f56e337f0fa22708e0097d907e3830c8344a60350439"; z_c0="2|1:0|10:1524724330|4:z_c0|92:Mi4xdjZRQkFBQUFBQUFBQU9ELVN1dC1EU1lBQUFCZ0FsVk5hc0RPV3dEenVDemV4cXVJdjdNZVNSd0JGWDNkOGx1R3Z3|5a5620470582fa3afe97a27e0355fd67bea92653d67237fb09abddc6abbb0809"; __utma=51854390.667942021.1524724356.1524724356.1524724356.1; __utmb=51854390.0.10.1524724356; __utmc=51854390; __utmz=51854390.1524724356.1.1.utmcsr=zhihu.com|utmccn=(referral)|utmcmd=referral|utmcct=/people/qing-quan/following/topics; __utmv=51854390.100-1|2=registration_date=20110908=1^3=entry_date=20110908=1',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Referer: 'https://www.zhihu.com/topics',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36'
    },
    form: (form),
    callback: (err, res, done) => {
        console.log(res.body)

        console.log(unescape(res.body.replace(/\\u/g, '%u')))
    }
})