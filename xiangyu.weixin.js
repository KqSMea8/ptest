var prgname = 'xiangyu.weixin';

var fs = require('fs');
var Crawler = require('crawler');

fs.writeFileSync('./xiangyu.beijing.csv', "\ufeff城市,标题,小区,厅室,商圈,类型,价格,面积\n");

var crawler = new Crawler({
	maxConnections: 2,
	forceUTF8: true,
	userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36"
});

for (let i = 1; i < 800; i++) {
	getPage(i);
}

function getPage(page) {
	let url = 'http://m2.1zu.com/houseForPc/getHouserListByAjax?pageNum=' + page + '&rentType=&inDistrict=&businessCircleId=&minPrice=&maxPrice=&houseType=&orderByType=&searchStr=&flag=0&commissionDiscountFlag=&shortRental=';
	crawler.queue({
		uri: url,
		callback: (err, res, done) => {
			try {
				let list = JSON.parse(res.body).data;
				console.log(page + ' got total ' + list.length);
				for (let i = 0; i < list.length; i++) {
					fs.appendFileSync('./xiangyu.beijing.csv', ['北京', list[i].inDistrictName, list[i].projectName, list[i].fewRoom + '室' + list[i].fewHall + '厅', list[i].circle, list[i].rentType, list[i].rentPrice, list[i].space].map(function(item) {
						return (item + '').trim().replace(/[,"\r\n]/g, ' ');
					}).join() + '\n');
				}
			} catch (e) {
				if (err || res.statusCode != 200) {
					getPage(page);
				} else {
					console.log('got new error ', res.body, e)
				}
			}
			done();
		}
	})
}
