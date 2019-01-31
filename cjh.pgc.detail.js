let fs = require('fs');
let cheerio = require('cheerio');
let crypto = require('crypto');
let puppeteer = require('puppeteer');

let exists = {}
let seedFile = 'pgc.seed';
fs.readdirSync('pgc/').forEach(file => {
    exists[file] = 1;
});
console.log('exists :', Object.keys(exists).length);
urls = fs.readFileSync(seedFile).toString().trim().split('\n').map(i => i.trim()).filter(url => {
    let id = 'https://chejiahao.autohome.com.cn'+url.split(',')[0].trim();

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

    url = 'https://chejiahao.autohome.com.cn' + url.split(',')[0]
    console.log('ready to go ', url);
    let ret = '';
    try {
        await page.goto(url);
        let gap = parseInt(Math.random() * 400 + 5000);
        await page.waitFor(gap);
        ret = await page.content();
    } catch (error) {
        console.error(error);
        return;
    }
    $ = cheerio.load(ret)

    let view='';

    $('.articleTag > span').each(function(params) {
        if($(this).text().match(/浏览/)){
            view = $(this).text();
        }
    })

    let relay = $('#replyCanyueCount').text()

    let zan = $('#likei .data-starcount').text()

    let marks = '';

    $('.tagBot > a').each(function () {
        marks = marks + '|' + $(this).text()
    })

    aurl = $('.mr > .name > a').attr('href')
    name = $('.mr > .name > a').text()
    cnt = $('.mr > .num').text()
    console.log('one result :', aurl, name, cnt, marks, zan, relay, view);
    fs.writeFileSync('pgc/' + getMd5Name(url), ret);
}


function getMd5Name(seed) {
    var md5 = crypto.createHash('md5');
    return md5.update(seed).digest('hex');
}