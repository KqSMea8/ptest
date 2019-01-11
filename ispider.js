let fs = require('fs');
let crypto = require('crypto');
let puppeteer = require('puppeteer');

module.exports = class Ispider {
    constructor(options) {
        this.exists = {}
        this.leftUrls = 0;
        this.seedFile = options.seed;
        this.fileSeparator = options.separator || ",";
        this.urlIndex = options.column || 0;
        this.htmlStoreDir = options.resultDir;
        this.checkRes = options.checkRes || defaultCheck;
        this.rateLimit = options.rateLimit || 4000;
    }

    init() {
        if (!fs.existsSync(this.htmlStoreDir)) {
            fs.mkdirSync(this.htmlStoreDir);
        }
        fs.readdirSync(this.htmlStoreDir).forEach(file => {
            this.exists[file] = 1;
        });
        console.log('exist urls:' + Object.keys(this.exists).length);
        let lines = fs.readFileSync(this.seedFile).toString().trim().split('\n');
        this.urls = lines.map(i => i.split(this.fileSeparator)[this.urlIndex].trim()).filter(url => {
            return !this.exists[getMd5Name(url)];
        });
        this.leftUrls = this.urls.length;
    }

    async startRequest() {
        let browser = await puppeteer.launch();
        let page = await browser.newPage();
        for (let url of this.urls) {
            await visit(url, page);
            this.leftUrls--;
            console.log('left urls:' + this.leftUrls);
        }
        await browser.close();
    }

    async visit(url, page) {
        console.log('ready to visit:', url);
        let ret = '';
        try {
            await page.goto(url);
            await page.waitFor(parseInt(Math.random() * 400 + this.rateLimit));
            ret = await page.content();
        } catch (error) {
            console.error(url + ' error occured', error);
            return;
        }
        if (this.checkRes(ret)) {
            fs.writeFileSync(this.htmlStoreDir + '/' + getMd5Name(url), ret);
        }
    }
}

function getMd5Name(seed) {
    let md5 = crypto.createHash('md5');
    return md5.update(seed).digest('hex');
}

function defaultCheck(html) {
    console.log('html checking function');
}