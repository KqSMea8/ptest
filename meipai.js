let fs = require('fs');
let Crawler = require('crawler');
let decodeMp = require('./decodeMp');

let rstFile = 'meipai.url.csv';
let crawler = new Crawler({
    retries: 0,
    rateLimit: 500
});

let dynamic_proxy_user = "HBO175BO42T24R8D";
let dynamic_proxy_password = "BE6735E1D6A41931";
let proxy = "http://" + dynamic_proxy_user + ":" + dynamic_proxy_password + "@http-dyn.abuyun.com:9020";
let headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36' };

crawler.on('schedule', options => {
    options.proxy = proxy;
    options.limiter = Math.ceil(Math.random() * 15);
});

let lines = fs.readFileSync('meipai.seeds').toString().trim().split('\n');

//getDetail('http://www.meipai.com/media/966321086')

//

//getDetail('http://www.meipai.com/media/988716628')

lines.forEach(function (line) {
    getDetail(line);
});


function getDetail(line) {
    crawler.queue({
        uri: line,
        headers: headers,
        callback: function (err, res, done) {
            if (err || res.statusCode !== 200) {
                if (res.body && res.body.match(/您访问的地址找不到/)) {
                    console.error('can not find ', res.options.uri);
                    return done();
                }
                console.error('getDetail: ', err || res.body);
                getDetail(line);
                return done();
            }
            let $ = res.$;
            let realUrl = $('[property="og:video:url"]').attr('content').trim();
            console.log(realUrl)
            a = decodeMp(realUrl);
            if (a[a.length - 1] == '@') { a = a.substring(0, a.length - 1) }
            console.log(a, a.match(/t=(\d+)/)[1].length)
            let guessUrl = realUrl.replace(/_H.*/, '.mp4');
            fs.appendFileSync(rstFile, line + ',' + a + ',' + guessUrl + '\n');
            done();
        }
    });
}