let prgname = 'tmall.recharge';

let fs = require('fs');
let moment = require('moment');
let webdriver = require('selenium-webdriver');
let logger = require('../src/tool/logger.js').getlogger({
	logdir: '../log/',
	prgname: prgname,
	datePattern: 'YYYY-MM-DD'
});
let time = 15 * 1000;
let By = webdriver.By;
let shops = getShopUrl();
let startPoint = 'https://tjyl.tmall.com';
let today = moment().format('YYYY-MM-DD');
let dir = './html/' + moment().format('YYYYMMDD') + '/';
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}
let driver = new webdriver.Builder().forBrowser('chrome').build();
driver.manage().window().maximize();

setStartPoint();
login();

function setStartPoint() {

	//dir = '/data/tmall/html/20171202/';
	//today = '2017-12-02';
	startPoint = 'https://v8hfcz.tmall.com';
	let surl = startPoint.match(/(https:.*\.tmall.com)/)[1];
	console.log(surl)
	while (shops.length) {
		if (shops[shops.length - 1].url === surl) {
			console.log('find target start point', shops[shops.length - 1])
			shops[shops.length - 1].url = startPoint;
			break;
		} else {
			shops.pop();
		}
	}
}

function login() {

	driver.get("https://login.tmall.com/").then(() => {
		logger.info(new Date())
		setTimeout(start, 20 * 1000);
	});
}

function start() {
	if (!shops.length) {
		logger.info('all shops done!')
		driver.close();
		return;
	}

	let shop = shops.pop();
	try {
		let tmpurl = '';
		if (shop.url.match(/search.htm/)) {
			tmpurl = shop.url;
		} else {
			tmpurl = shop.url + '/search.htm?search=y';
		}
		driver.get(tmpurl).then(function () {

			//判断验证码元素是否出现
			setTimeout(getProducts, time, shop);
		})
	} catch (e) {
		logger.error(e, shop);
		start();
	}
}

function getProducts(shop) {
	driver.getPageSource().then(function (innerHTML) {
		saveHtml(shop, innerHTML);

		/* 			driver.findElements(By.css('a.ui-page-s-next')).then(function (elements) {
						if (elements.length) {
							shop.page++;
							elements[elements.length - 1].click().then(() => {
								setTimeout(getProducts, time, shop);
							})
						} else {
							start();
						}
					}) */
		driver.findElements(By.css('div.pagination a')).then(function (elements) {
			if (!elements.length) {
				logger.info(shop, 'can not find pagination,but html has saved');
				setTimeout(start, time);
				return;
			}
			console.log(elements.length)
			elements[elements.length - 1].getAttribute('class').then(rst => {
				if (rst == 'disable') {
					start();
					return;
				}
				shop.page++;
				elements[elements.length - 1].click().then(() => {
					setTimeout(getProducts, time, shop);
				})
			})
		});
	})
}

function getShopUrl() {

	let result = [];
	fs.readFileSync(require('path').resolve(__dirname, '../appdata/tmall.shop')).toString().trim().split('\n').map(item => {
		result.push({
			id: item.split(',')[0],
			url: item.split(',')[1],
			page: 1
		})
	})
	return result;
}

function saveHtml(shop, html) {
	logger.info(moment().format('YYYY-MM-DD HH:mm:ss'), 'save page ', shop)
	let filename = shop.url.match(/\/\/(.*com)/)[1] + '.p' + shop.page + '.html' + today;
	fs.appendFileSync(dir + filename, html);
}
