fs = require('fs')
request = require('request')

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
    'Referer': 'http://www.bjnews.com.cn/video/2018/07/05/493855.html',
    'Host': 'v.bjnews.com.cn'
}

url = 'http://v.bjnews.com.cn/2018/07/05/056909362528.mp4';
request({ url: url, headers: headers }).pipe(fs.createWriteStream('do.mp4'))

crawler.queue({
    uri: 'http://v.douyin.com/JBdAFv/',
    callback: function (err, res, done) {
        console.log(res.request.uri.query)
    }
})
