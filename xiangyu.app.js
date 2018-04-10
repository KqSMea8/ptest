var fs = require("fs");
var Crawler = require("crawler");

var crawler = new Crawler({
	maxConnections: 3,
	forceUTF8: true,
	jquery: false,
	userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36"
});

for (let i = 1; i < 800; i++) {
	getPage(i);
}

function getPage(page) {
	crawler.queue({
		uri: "http://gj2.1zu.com/api/mobileAPI/appTenantAction/houseList?token=",
		headers: {
			"Content-Type": "application/json"
		},
		form: {
			pageNum: page + "",
			version: "3.3.1",
			deviceType: "Pixel",
			deviceID: "351615080888019"
		},
		callback: (err, res, done) => {
			try {
				let list = JSON.parse(res.body).data;
				console.log(page + ' got total ' + list.length);
				for (let i = 0; i < list.length; i++) {
					let room = list[i];
					let rec = ['北京', room.id, room.vacantId, room.houseId, room.roomName, room.inDistrictName, room.circle, room.projectName, room.fewRoom + '室' + room.fewHall + '厅', room.rentPrice, room.space];
					fs.appendFileSync('./xiangyu.app.csv', rec.map(item => ('' + item).replace(/,+|\s+|'+|"+/g, ' ').trim()).join() + '\n')
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
	});
}
