let fs = require('fs');
let cheerio = require('cheerio');
let crypto = require('crypto');
let puppeteer = require('puppeteer');

let exists = {}
let seedFile = 'ogc.seed';
fs.readdirSync('ogc/').forEach(file => {
    exists[file] = 1;
});
console.log('exists :', Object.keys(exists).length);
urls = fs.readFileSync(seedFile).toString().trim().split('\n').map(i => i.trim()).filter(url => {
    let id = 'http:'+url.split(',')[0].trim();

    return !exists[getMd5Name(id)];
});

len = urls.length

start()

async function start() {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    for (let url of urls) {
        await getUserId(url.trim(), page);
        len--;
        console.log(len)
    }
    await browser.close();
}
async function getUserId(url, page) {

    url = 'http:' + url.split(',')[0]
    console.log('ready to go ', url);
    let ret = '';
    try {
        await page.goto(url);
        let gap = parseInt(Math.random() * 400 + 3000);
        await page.waitFor(gap);
        ret = await page.content();
    } catch (error) {
        console.error(error);
        return;
    }
    $ = cheerio.load(ret)
    let authorUrl = $('.article-info .name a.name').first().attr('href')
    let authorName = $('.article-info .name a.name').first().text()
    let relaycnt = $('#article-reply-count').text()
    let collect = $('#favo-btn-bottomcollect').text()
    let praise = $('#praise-top-div').text();
    let step = $('#disagree-top-div').text();

    let marks = '';

    $('.article-mark div.marks > a').each(function () {
        marks = marks + '|' + $(this).text()
    })

    console.log('one result :', authorUrl, authorName, relaycnt, collect, praise, step, marks);
    fs.writeFileSync('ogc/' + getMd5Name(url), ret);
}


function getMd5Name(seed) {
    var md5 = crypto.createHash('md5');
    return md5.update(seed).digest('hex');
}