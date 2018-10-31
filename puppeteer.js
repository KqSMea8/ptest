let fs = require('fs');
let cheerio = require('cheerio');
let puppeteer = require('puppeteer');

urls = fs.readFileSync('urls.txt').toString().trim().split('\n');
len = urls.length
start()

async function start() {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    for (let url of urls) {
        let ret = await getUserId(url.trim(), page);
        fs.appendFileSync('ret.url', ret + '\n');
        len--;
        console.log(len)
    }
    await browser.close();
}
async function getUserId(url, page) {
    if (!url.match(/xiaohongshu/)) {
        return " "
    }
    await page.goto(url);
    await page.waitFor(4000);
    ret = await page.content();
    let $ = cheerio.load(ret);
    let userId = $('.author-info').first().attr('href');
    return userId;
}