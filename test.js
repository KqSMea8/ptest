fs = require('fs')
request = require('request')
Crawler = require('crawler')
decodeWy = require('./decodeWy')
let crawler = new Crawler({
    retries: 0,
    rateLimit: 4000
});
let headers2 = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
}
headers = {
    'X-DevTools-Emulate-Network-Conditions-Client-Id': 'D992B705C7E5CFD52215AB1F5F998F79',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    //'Referer': 'http://www.bjnews.com.cn/video/2018/07/05/493855.html',
    //'Host': 'v.bjnews.com.cn'
}

//url = 'http://v.bjnews.com.cn/2018/07/05/056909362528.mp4';
//request({ url: url, headers: headers }).pipe(fs.createWriteStream('do.mp4'))

//url2='http://v3-dy-y.ixigua.com/2540e8b5d5d70376d2db3359ddeb7fd9/5b485924/video/m/220104829e6fe6141d4b1f4bd7c3dadb0ad115774f2000039bfc207aef8/'
//url2 = 'http://v3-dy-y.ixigua.com/5866775057e24531d976464f45c374ed/5b485cb4/video/m/220d8d5bf4871454803a0c5b57a683e6c0c1153d8f300005a2a04faca10/'
//request({ url: url2, headers: headers }).pipe(fs.createWriteStream('douyin.mp4'))

/*crawler.queue({
    uri: 'http://v.douyin.com/JBdAFv/',
    callback: function (err, res, done) {
        console.log(res.request.uri.query)
    }
})*/


// request({url:'https://aweme.snssdk.com/aweme/v1/playwm/?video_id=dab0ca5d57974d7a816d27fe448cbee2&line=0',headers:headers},function(err,res){

// console.log(res.request.uri)


// request({ url: res.request.uri.href, headers: headers }).pipe(fs.createWriteStream('douyin.mp4'))

// })