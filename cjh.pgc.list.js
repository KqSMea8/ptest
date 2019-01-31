fs = require('fs')
Crawler = require('crawler')

seed = '20190107220455072'
crawler = new Crawler({ rateLimit: 5000 })
crawler.on('drain', function (params) {
    console.log(Object.keys(results).length)
    fs.appendFileSync('pgc.seed', Object.keys(results).map(key=>{
        return key+','+results[key].replace(/[,]/g,'');
    }).join('\n'))
})
results = {

}

getList(seed)

function getList(pageId) {
    crawler.queue({
        uri: 'https://chejiahao.autohome.com.cn/Default/IndexMore?infotype=0&pageId=' + pageId + '&pageIdentity=1',
        callback: function (err, res, done) {
            if (err || res.statusCode != 200) {
                console.log(res.options.uri, err || res.statusCode)
                getList(pageId);
                return done()
            }
            //console.log(res.body)
            let $ = res.$;
            let lastId = '';
            $('div[pageId]').each(function () {
                //console.log($(this))
                let href = $('a', this).first().attr('href');
                let text = $('.title', this).first().text();
                lastId = $(this).attr('pageid');
                results[href] = text;
                console.log(lastId, href, text)
            });
            if (Object.keys(results).length < 1000) {
                getList(lastId);
            }
            return done()
        }
    })
}

function name(params) {

}
