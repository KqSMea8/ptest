fs = require('fs')
Crawler = require('crawler')

crawler = new Crawler({ rateLimit: 1000, jquery: false, retries: 0 })

fs.readFileSync('./address.uniq').toString().trim().split('\n').forEach(function (line) {
    getAddress(line)
})



function getAddress(line) {
    crawler.queue({
        uri: 'https://www.iesdouyin.com/aweme/v1/poi/detail/?poi_id=' + line + '&aid=1128',
        callback: function (err, res, done) {
            if (err || res.statusCode != 200) {
                getAddress(line)
                return done()
            }
            data = JSON.parse(res.body).poi_info;
            poi_name = data.poi_name;
            province = data.address_info.province;
            city = data.address_info.city;
            district = data.address_info.district;
            fs.appendFileSync('./address.detail', [line, province, city, district, poi_name].join() + '\n')
            done()
        }
    })
}
