let Crawler = require('crawler');
let request = require('request');
let fs = require('fs')
let cates = getCate();
let crawler = new Crawler({ rateLimit: 2000, retries: 0 });
let Entities = require('html-entities').XmlEntities;

let entities = new Entities();
start();


function start() {
	cates.forEach(cate => {
		getList({
			name: cate[0],
			id: cate[1],
			page: 1
		});
	})
}

function getList(cate) {
	let url = 'http://weixin.sogou.com/pcindex/pc/' + cate.id + '/' + cate.page + '.html';

	crawler.queue({
		uri: url,
		callback: (err, res, done) => {
			let $ = res.$;
			$('li').each(function () {
				let img = $('.img-box a img', this).attr('src');
				let url = $('.img-box a', this).attr('href');
				let userId = $('.txt-box .s-p a.account', this).attr('href');
				let userName = $('.txt-box .s-p a.account', this).text();
				let title = $('.txt-box h3 a', this).text();
				let summary = $('.txt-box p.txt-info', this).text();
				getDetail({ img, url, userId, userName, title, summary })
				//console.log({ img, url, userId, userName, title, summary });
			})
			done()
		}
	})
}

function getDetail(item) {
	crawler.queue({
		uri: item.url,
		gzip: false,
		priority: 1,

		callback: (err, res, done) => {
			console.log('detail ')
			let $ = res.$;
			console.log(entities.decode($('.rich_media_content ').html()).trim())
			process.exit()

		}
	});
}

function getCate() {
	return [
		["热门", "pc_0"],
		["搞笑", "pc_1"],
		["养生堂", "pc_2"],
		["私房话", "pc_3"],
		["八卦精", "pc_4"],
		["科技咖", "pc_5"],
		["财经迷", "pc_6"],
		["汽车控", "pc_7"],
		["生活家", "pc_8"],
		["时尚圈", "pc_9"],
		["育儿", "pc_10"],
		["旅游", "pc_11"],
		["职场", "pc_12"],
		["美食", "pc_13"],
		["历史", "pc_14"],
		["教育", "pc_15"],
		["星座", "pc_16"],
		["体育", "pc_17"],
		["军事", "pc_18"],
		["游戏", "pc_19"],
		["萌宠", "pc_20"]
	];
}