let fs = require('fs');
let cheerio = require('cheerio');
let puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const iPhone = devices['iPhone 6'];
let exists = {}
let seedFile = 'newurl.column2';
fs.readdirSync('~/Html/xiaohongshu').forEach(file => {
    exists[file] = 1;
});
console.log('exists :', Object.keys(exists).length);
urls = fs.readFileSync(seedFile).toString().trim().split('\n').map(i => i.trim()).filter(url => {
    let id = url.match(/discovery\/item\/(.*)/)[1]
    return !exists[id];
});

len = urls.length

opt = {
    'name': 'Galaxy S5', //设备名
    'userAgent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36', //UA
    'viewport': {
        'width': 360,//屏幕宽度
        'height': 640,//屏幕高度
        'deviceScaleFactor': 3,//缩放比例
        'isMobile': true,//是否是移动设备
        'hasTouch': true,//是否支持touch事件
        'isLandscape': false//是否横屏
    }
}

start()

async function start() {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    //await page.emulate(iPhone);
    for (let url of urls) {
        await getUserId(url.trim(), page);
        len--;
        console.log(len)
    }
    await browser.close();
}
async function getUserId(url, page) {
    console.log('ready to go ', url);
    let id = url.match(/discovery\/item\/(.*)/)[1]
    let ret = '';
    try {
        await page.goto(url);
        let gap = parseInt(Math.random() * 4000 + 4000);
        console.log('gap time:',gap)
        await page.waitFor(gap);
        ret = await page.content();
    } catch (error) {
        console.error(error);
        return;
    }
    let $ = cheerio.load(ret);
    let nickname = $('.name-detail').text().trim().replace(/[\s",]+/g, ' ');
    let avatar = $('.author-item a .left .left-img img').attr('src') + '';
    if (avatar.match(/(https.*avatar\/.*)@/)) {
        avatar = avatar.match(/(https.*avatar\/.*)@/)[1]
    }
    let userId = $('.author-info').attr('href') + '';
    userId = userId.match(/user\/profile\/(.*)/);
    userId = userId && userId[1];
    console.log(url, nickname, avatar, userId)
    fs.writeFileSync('~/Html/xiaohongshu/' + id, ret);
}
