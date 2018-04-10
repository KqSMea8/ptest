let fs = require('fs');
let Crawler = require('crawler');

let url = 'http://hr-api.info.100tal.com/api/ding/share/push/position/?code=acba7533eb5f1011beda7f77da840db2&per_page=20&page=';
let jobs = [];
let crawler = new Crawler({
	rateLimit:3000,
	userAgent: ' Mozilla/5.0 (Linux; Android 7.0; FRD-AL00 Build/HUAWEIFRD-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Mobile Safari/537.36'
});

function getList(page) {
	crawler.queue({
		uri: url,
		headers:{
			Host:'hr-api.info.100tal.com',
			'Content-Type': 'application/json;charset=utf-8',
			referer: 'http://neitui.info.100tal.com/share_list/?code=acba7533eb5f1011beda7f77da840db2&from=singlemessage&isappinstalled=0',
		},
		callback: (err, res, done) => {
			let json = JSON.parse(res.body);
			let data = json.data.data;
			console.log('page: ' + page + ' got length: ' + data.length);

			jobs = jobs.concat(data);
			let cur = (page - 1) * 20 + data.length;
			if (cur < json.data.total) {
				page++;
				getList(page);
			} else {
				getDetail();
			}
			done();
		}
	})
}

function getDetail() {
	if (!jobs.length) return;
	let job = jobs.pop();
	crawler.queue({
		uri: 'http://hr-api.info.100tal.com/api/ding/share/push/position/' + job.id + '/?code=acba7533eb5f1011beda7f77da840db2',
		headers:{
			Host:'hr-api.info.100tal.com',
			'Content-Type': 'application/json;charset=utf-8'
		},
		callback: (err, res, done) => {
			let json = JSON.parse(res.body).data.job;
			fs.appendFileSync('../../result/xes.recruit.csv',[].join()+'\n');
			getDetail();
			done();
		}
	})
}
