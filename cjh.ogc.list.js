fs = require('fs')
Crawler = require('crawler')


crawler = new Crawler({ rateLimit: 5000 })
crawler.on('drain', function () {
    console.log(Object.keys(results).length)
    fs.appendFileSync('ogc.seed', Object.keys(results).map(key => {
        info = results[key];
        return key + ',' + info.text.replace(/[,]/g, '') + ',' + info.eye + ',' + info.infor;
    }).join('\n'))
})
results = {

}

getList(1)

function getList(page) {
    crawler.queue({
        uri: 'https://www.autohome.com.cn/all/' + page + '/',

        callback: function (err, res, done) {
            if (err || res.statusCode != 200) {
                console.log(res.options.uri, err || res.statusCode)
                getList(page);
                return done()
            }
            //console.log(res.body)
            let $ = res.$;
            $('#Ul1 > li').each(function () {
                let href = $('a', this).first().attr('href');
                let text = $('h3', this).first().text();
                let eye = $('.fn-right em', this).first().text();
                let infor = $('.fn-right em[data-class]', this).text();
                results[href] = {
                    text, eye, infor
                }
            })

            if (Object.keys(results).length < 1000) {
                page++;
                getList(page);
            }
            return done()
        }
    })
}