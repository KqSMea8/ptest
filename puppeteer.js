const puppeteer = require('puppeteer');
fs = require('fs')
url = 'https://www.xiaohongshu.com/discovery/item/5bd57ddf07ef1c76a2a21214';


(async () => {
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url);
await page.waitFor(4000);

await page.screenshot({path: 'example.png'});
ret = await page.content()

await fs.writeFile('tmp', ret)
await browser.close();
})();
