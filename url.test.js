
let Crawler = require('crawler');
let cheerio = require('cheerio');
let moment = require('moment');
let Entities = require('html-entities').XmlEntities;
var iconv = require("iconv-lite");

let entities = new Entities();
let crawler = new Crawler({ retries: 0 });
let url3 = 'https://weibo.com/a/aj/transform/loadingmoreunlogin?category=1760&page='
let destroyZWS = new RegExp(String.fromCharCode(8203), "g");

let uri2 = 'https://mp.weixin.qq.com/s?__biz=MjM5NzI3NDg4MA==&mid=2658513754&idx=1&sn=cc555b0376bbeae916f34b2c18aecfee&chksm=bd5d67358a2aee23800308d9156dc17d23fbd85df31a13ddc57b59049ebc6d31b331062bd090&mpshare=1&scene=1&srcid=0612y8cxth7eJ1rdOwptDbKq&key=cdf22feb1258e9e342cb6d68d520d515969c5dd29b164f78b1c303b532bf867983007fccd5c9f961c98338bb6729a040b59a996056ee2040196c89392a10dff24c71ca40fc8b0292588dd21980a1a1f9&ascene=0&uin=Nzg1MDAwMTM2&devicetype=iMac+MacBookPro12%2C1+OSX+OSX+10.13.4+build(17E199)&version=12020610&nettype=WIFI&fontScale=100&pass_ticket=K%2FuDffOnemjMavc7sYDa2H0zt8Tz%2BuMBP4lvvKKx8rBsEKbJSVwUZ7JXoAN7JvqJ'

crawler.queue({
  uri: 'http://127.0.0.1:9527',
  method: 'POST',
  form: { a: 1, b: 2 },
  callback: () => {

  }
})

function testweixin2() {
  crawler.queue({
    uri: uri2,
    gzip: false,
    priority: 1,
    callback: (err, res, done) => {

      let $ = res.$;



      //console.log(JSON.stringify(article.body))


      let items = [];

      $('.rich_media_content > p').each(function () {
        let d = $(this).text().trim();
        if (d == '') {
          items.push({
            type: 'segment'
          })
        } else {
          items.push({
            type: 'text',
            data: d.replace(/[;\s]+/g, '')
          })
        }
      })
      console.log(JSON.stringify(transform(items)))

      let doc = transform(items);
      require('fs').appendFileSync('./tmp.weixin.rst', JSON.stringify(doc) + '\n');
      // for(let i=0;i<10;i++){
      //   doc.url = doc.url+i;
      //   require('fs').appendFileSync('./tmp.weixin.rst', JSON.stringify(doc)+'\n');
      // }
      done();
    }
  });
}



function transform(items) {


  let list_img_url = [];
  let content = {
    type: 1,
    items: items,
    video_num: 0,
    image_num: 0
  };

  let doc = {
    'category': 5,
    'channel_url': uri2,
    'description': '',
    'display_type': 1,
    'display_url': uri2,
    'feedid': '',
    'is_original': 1,
    'logid': 0,
    'mthid': '',
    'mutable': 1,
    'need_gips': 0,// t�?
    'source_id': 80003,
    'news_level': 'use_text',
    'passport_id': '80004',
    'product': 'midway',
    'public_time': Math.floor(moment('2018-06-12 14:30:00') / 1000),
    'site_name': name,
    'stream_type': 'news',
    'subtitle': '',
    'topic_tag': [],
    'title': ('终于见了！金正恩特朗普首次会晤，都说了啥�?').trim().replace(/[;\s]+/g, ''),
    'url': uri2,
    'use_topic_tag': 0
  };
  doc.author = [{
    name: name,
    src: ''
  }];
  doc.author_img = {
    'original': {
      'height': 0,
      'src': '',
      'width': 0
    }
  };
  doc.ext_info = {};
  doc.content = content;

  doc.list_img_url = list_img_url;

  return doc;
}


function testsogou() {
  crawler.queue({
    uri: 'http://weixin.sogou.com/weixin?type=1&s_from=input&query=Java%E5%B8%AE%E5%B8%AE&ie=utf8&_sug_=n&_sug_type_=',
    headers: {
      'Cookie': '   SNUID=F0A6345C8085ECCE49689B6581EBA221; SUV=000251E7DCB526715B0D082ECCA7E405;',
      'Referer': 'http://weixin.sogou.com/'
    },
    callback: (err, res, done) => {
      if (err || res.statusCode !== 200) {
        console.error(err || res.statusCode);
        return done();
      }
      let $ = res.$;
      if (res.body.match(/访问过于频繁/)) {
        console.error(new Date() + ' 访问过于频繁');
        return done();
      }
      console.log('succ')
    }
  });
}

function testweixin() {
  crawler.queue({
    uri: 'http://weixin.sogou.com/weixin?type=1&s_from=input&query=%E5%BC%80&ie=utf8',
    callback: (err, res, done) => {
      console.log(typeof res.statusCode)
    }
  })

}
function testUrl() {
  let news = {

    "id": "https://weibo.com/5044281310/GgWek5SyJ",
    "time": "2018-05-16 18:31:00",

    "user": "澎湃新闻",
    "userPic": "https://tva3.sinaimg.cn/crop.0.0.299.299.50/005vnhZYgw1ehsl3xhv75j308c08cq32.jpg",
    "video": null,
    "body": [
      {
        "type": "text",
        "data": "年仅6个月的男婴小宇（化名）白白胖胖，特别爱笑，笑起来左脸会露出大大的酒窝。然而，短短两个月内，他已被父亲遗弃了两次。第二次遗弃后，父亲还玩起了“失踪”。此前有报道称，这名父亲为未婚生子，其父母不同意婚事，孩子母亲也走了，这成了遗弃的原因。澎湃尚未从警方处证实这一说法，但这名父亲遗弃小宇后有着更为直白的解释：“我不会带，也没钱，连换尿布、喂奶都不会。”目前，警方正积极联系和劝说小宇的父亲领回孩子，如果劝说无效，警方将根据相关法律采取措施�?? °上海6个月男婴遭两次遗弃以医院为家，父亲：..."
      }
    ],
    "imgs": {
      "005vnhZYgy1frdbrstyyyj30go0m8tvw": {
        "src": "https://wx2.sinaimg.cn/mw690/005vnhZYgy1frdbrstyyyj30go0m8tvw.jpg",
        "id": "005vnhZYgy1frdbrstyyyj30go0m8tvw",
        "type": "jpg",
        "thumb": "https://wx2.sinaimg.cn/thumb150/005vnhZYgy1frdbrstyyyj30go0m8tvw.jpg"
      },
      "005vnhZYgy1frdbrwru8vj30go0ci4b6": {
        "src": "https://wx4.sinaimg.cn/mw690/005vnhZYgy1frdbrwru8vj30go0ci4b6.jpg",
        "id": "005vnhZYgy1frdbrwru8vj30go0ci4b6",
        "type": "jpg",
        "thumb": "https://wx4.sinaimg.cn/thumb150/005vnhZYgy1frdbrwru8vj30go0ci4b6.jpg"
      },
      "005vnhZYgy1frdbs0xe6jj30go0cidtl": {
        "src": "https://wx2.sinaimg.cn/mw690/005vnhZYgy1frdbs0xe6jj30go0cidtl.jpg",
        "id": "005vnhZYgy1frdbs0xe6jj30go0cidtl",
        "type": "jpg",
        "thumb": "https://wx2.sinaimg.cn/thumb150/005vnhZYgy1frdbs0xe6jj30go0cidtl.jpg"
      }
    },
    "text": "年仅6个月的男婴小宇（化名）白白胖胖，特别爱笑，笑起来左脸会露出大大的酒窝。然而，短短两个月内，他已被父亲遗弃了两次。第二次遗弃后，父亲还玩起了“失踪”。此前有报道称，这名父亲为未婚生子，其父母不同意婚事，孩子母亲也走了，这成了遗弃的原因。澎湃尚未从警方处证实这一说法，但这名父亲遗弃小宇后有着更为直白的解释：“我不会带，也没钱，连换尿布、喂奶都不会。”目前，警方正积极联系和劝说小宇的父亲领回孩子，如果劝说无效，警方将根据相关法律采取措施。°上�??6个月男婴遭两次遗弃以医院为家，父亲：...",
    "title": "上海6个月男婴遭两次遗弃以医院为家，父亲：不会带，也没�??"
  }

  let post = { doc: news.id + '\t' + (news.title ? news.title : '') + '\t' + news.text };
  let postStr = JSON.stringify(post);


  crawler.queue({
    uri: 'http://bj01.nlpc.baidu.com/nlpc_topictagger_1001?username=liaozhongru&app=nlpc_201710171908337213',
    method: 'POST',
    incomingEncoding: 'GBK',
    body: postStr,
    callback: (err, res, done) => {
      console.log(res.body)
    }
  })

}


function testrequest() {
  request = require('request')
  fs = require('fs');
  request('http://www.baidu.com', (err, res, body) => {
    //fs.appendFileSync('response.txt',JSON.stringify(res))
    console.log(body)
  })
  request('http://www.baidu.com').pipe(fs.createWriteStream('response.txt'))
}

function getSize(file) {
  let $ = cheerio.load('<div class="WB_text W_f14" node-type="feed_list_content" nick-name="解说小楼">      sky生日 < img class= "W_img_face" render = "ext" src = "//img.t.sinajs.cn/t4/appstyle/expression/ext/normal/22/2018new_erha_org.png" title = "[二哈]" alt = "[二哈]" type = "face" > ，大聚会啦！谁能认全 < a suda - uatrack="key=tblog_card&amp;value=click_title:4240386739977198:1034-video:1034%3Aa741a6a6fe023f7dbbdf142cf9c30eb5:weibodetail:2721185633:4240386739977198:2721185633" title = "解说小楼的秒拍视�??" href = "http://t.cn/R393Agq" alt = "http://t.cn/R393Agq" action - type="feed_list_url" target = "_blank" > <i class="W_ficon ficon_cd_video">L</i>解说小楼的秒拍视�??</a > ​​​�?                                            </div >')
  $('.WB_text.W_f14 a').remove();
  let contents = $('.WB_text.W_f14').text().trim();
  let body = [];

  let contentArray = $('.WB_text.W_f14').contents();
  console.log(contentArray)
  for (let i = 0; i < contentArray.length; i++) {
    let node = contentArray[i];
    if (node.type == 'text') {

      var destroyZWS = new RegExp(String.fromCharCode(8203), "g");
      node.data = node.data.replace(destroyZWS, "").trim();
      if (!node.data.trim()) {
        console.log('empty data', node.data)
        continue;
      }
      if ((body.length - 1) > 0 && body[body.length - 1].type == 'text') {
        body[body.length - 1].data = body[body.length - 1].data + ' ' + node.data.trim();
      } else {
        body.push({ type: 'text', data: (node.data) })
      }
    }
    else if (node.name == 'br') {
      if ((body.length - 1) > 0 && body[body.length - 1].type == 'segment') continue;
      body.push({ type: 'segment' })
    }
  }
  console.log(body)
}


function str2utf8(str) {
  return eval('\'' + encodeURI(str).replace(/%/gm, '\\x') + '\'');
}

function charFilter(str) {
  var fileType = "";
  //非可见字符asc,多个就可以用数组
  var ascNum = 173;
  for (var i = 0; i < temp.length; i++) {
    if (str.charCodeAt(i) != ascNum) {
      fileType += str.charAt(i);
    }
  }
  return fileType;
}
//testdb();

function testdb() {
  crawler.queue({
    uri: 'https://www.douban.com/group/topic/116760372/add_comment',
    method: "POST",
    headers: {
      'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryBT33eSwapv2YHVYi',
      Cookie: 'bid=OhoxoaHtKag; __yadk_uid=JoqgtkXzwH5XXGAm52gsiFwgD3FpyDNa; ll="108288"; ct=y; __utmz=30149280.1525431941.3.2.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; ps=y; ue="anewman@126.com"; push_doumail_num=0; __utmv=30149280.5925; ap=1; push_noty_num=0; __utmc=30149280; dbcl2="59256182:A60VUylm17E"; ck=w9TT; _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1525833903%2C%22https%3A%2F%2Fwww.baidu.com%2Flink%3Furl%3D98sKFyfyBVgNkWR_rqvg5-PhZBpEDQEFvtrYKBtiZpZ-51bXc5PabZ-QmNvtZ3XH2gNI0hZcdM0DQiDhOlPNCK%26wd%3D%26eqid%3Debc3d39c00021d40000000035aec3e7e%22%5D; _pk_ses.100001.8cb4=*; __utma=30149280.1281106667.1524799892.1525830882.1525833907.13; __utmt=1; _pk_id.100001.8cb4=5860cff14a560a4e.1524799892.13.1525834698.1525831361.; __utmb=30149280.48.5.1525834699336',
      Host: 'www.douban.com',
      Origin: 'https://www.douban.com',
      Referer: 'https://www.douban.com/group/topic/116760372/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36(KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'

    },
    form: { rv_comment: 'ziding1' },
    callback: function () {

    }
  })

}

function testzdy(proxy) {
  crawler.queue({
    //uri: 'http://ip.zdaye.com/dayProxy/ip/88167.html',
    uri: 'http://weixin.sogou.com/',
    headers: {
      'Referer': ' http://ip.zdaye.com/dayProxy.html',
      'User-Agent': ' Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
    },
    proxy: proxy,
    callback: (err, res) => {
      console.log(res.body)
    }
  })
}

function testwb() {
  crawler.queue({
    uri: 'https://weibo.com/ttarticle/p/show?id=2309404245081812003247',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3416.0 Safari/537.36',
      //Cookie: 'SINAGLOBAL=4445553899187.058.1524550133186; un=anewman@126.com; TC-Ugrow-G0=370f21725a3b0b57d0baaf8dd6f16a18; login_sid_t=d0314f4f456cedba4da797beda8266ff; cross_origin_proto=SSL; TC-V5-G0=ffc89a27ffa5c92ffdaf08972449df02; _s_tentry=passport.weibo.com; Apache=7724478764894.423.1525242223154; ULV=1525242223162:3:1:1:7724478764894.423.1525242223154:1524622248368; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5QO8pwShfyODTd1cLYAV6r5JpX5K2hUgL.Fo24eKz4eKMEe0e2dJLoIEXLxK-L12BL1K-LxKMLB.2LB-qLxKqLBoBL1h2LxKML1K.LB.BLxKBLB.2L1K2t; ALF=1556778230; SSOLoginState=1525242230; SCF=Ao0fqhveczeocz02oYuOrxwJMMUJvlJ-fT-syBfuYGvoh9dhbGQyPY0dXEhwo8cAKj4jeSKEXpsHK8Pd2GCU-S4.; SUB=_2A2537SkmDeRhGedH6lAY8SnOyD-IHXVUmx3urDV8PUNbmtAKLVKgkW9NUM5BwobLasQuoECC4w8R-h_x2FDZsiG4; SUHB=03o0WeNSOvU201; wvr=6; TC-Page-G0=1ac1bd7677fc7b61611a0c3a9b6aa0b4; YF-Page-G0=074bd03ae4e08433ef66c71c2777fd84; YF-V5-G0=bcfc495b47c1efc5be5998b37da5d0e4'
      cookie: 'UM_distinctid=162f13c091e77-0cc79091d8bda7-33657106-fa000-162f13c091fbc5; un=anewman@126.com; TC-Page-G0=4e714161a27175839f5a8e7411c8b98c; login_sid_t=6c51b545a7bbc2353b84dbadd812fd96; cross_origin_proto=SSL; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5QO8pwShfyODTd1cLYAV6r5JpX5K2hUgL.Fo24eKz4eKMEe0e2dJLoIEXLxK-L12BL1K-LxKMLB.2LB-qLxKqLBoBL1h2LxKML1K.LB.BLxKBLB.2L1K2t; ALF=1559201488; SSOLoginState=1527665488; SCF=Ao0fqhveczeocz02oYuOrxwJMMUJvlJ-fT-syBfuYGvodyYiIONiX6SxSOR99IM29hy0R43oE2eAPr62MTFAKVs.; SUB=_2A252CiMADeRhGedH6lAY8SnOyD-IHXVVfhPIrDV8PUNbmtAKLWzbkW9NUM5BwmcLtP0YnTMjuQaLL1Gvt4fYYnXG; SUHB=0jB5DfGPOHY3f3; wvr=6; WBStorage=5548c0baa42e6f3d'
    },
    callback: (err, res, done) => {
      console.log(res.body)
    }
  })
}

function testjk() {
  crawler.queue({
    uri: 'https://app.jike.ruguoapp.com/1.0/messages/history',
    method: "POST",
    form: { "topic": "556688fae4b00c57d9dd46ee", "limit": 20, "loadMoreKey": '5ace99bbfa8de400161c028d' },
    headers: {
      "Content-Type": " application/json",
      "Host": " app.jike.ruguoapp.com",
      "Origin": " https://web.okjike.com",
      "platform": "web",
      //"x-jike-app-auth-jwt":"abcdefghijklmn",
      //"x-jike-app-auth-jwt":'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW1vdGVfYWRkciI6IjYxLjEzNS4xNjkuODEiLCJhcHBfdXNlcl9pbmZvIjp7InVzZXJJZCI6MjY0OTU3MDMsImlzTG9naW5Vc2VyIjp0cnVlLCJpZCI6IjVhZGZlNjY2NzkyZTUwMDAxNzk0OWZjZSIsIl9pZCI6IjVhZGZlNjY2NzkyZTUwMDAxNzk0OWZjZSIsInByZWZlcmVuY2VzIjp7ImRlYnVnTG9nT24iOmZhbHNlLCJ1bmRpc2NvdmVyYWJsZUJ5UGhvbmVOdW1iZXIiOmZhbHNlLCJmb2xsb3dlZE5vdGlmaWNhdGlvbk9uIjp0cnVlLCJhdXRvUGxheVZpZGVvIjp0cnVlLCJyZXBvc3RXaXRoQ29tbWVudCI6dHJ1ZSwic2F2ZURhdGFVc2FnZU1vZGUiOmZhbHNlLCJzdWJzY3JpYmVXZWF0aGVyRm9yZWNhc3QiOnRydWUsInRvcGljUHVzaFNldHRpbmdzIjoiQVNLIiwidG9waWNUYWdHdWlkZU9uIjp0cnVlLCJzeW5jQ29tbWVudFRvUGVyc29uYWxBY3Rpdml0eSI6dHJ1ZSwicHJpdmF0ZVRvcGljU3Vic2NyaWJlIjpmYWxzZSwiZGFpbHlOb3RpZmljYXRpb25PbiI6dHJ1ZSwiZW52IjoicHJvZCJ9LCJ1c2VybmFtZSI6ImVmZjA3ZWI1LTViNmQtNGM5ZC1hY2UyLTFlNTEwMmQ1MGVjNiIsImJhblN0YXR1cyI6MH0sImV4cGlyZXNfYXQiOiIxNTI1ODQwMTY3LjAxIn0.WZydwIX-NkMUpJVK4dKlOGsHJ9-3VppZlribriCJmLc',
      "x-jike-app-auth-jwt": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW1vdGVfYWRkciI6IjYxLjEzNS4xNjkuODEiLCJhcHBfdXNlcl9pbmZvIjp7InVzZXJJZCI6MjY0OTU3MDMsImlzTG9naW5Vc2VyIjp0cnVlLCJpZCI6IjVhZGZlNjY2NzkyZTUwMDAxNzk0OWZjZSIsIl9pZCI6IjVhZGZlNjY2NzkyZTUwMDAxNzk0OWZjZSIsInByZWZlcmVuY2VzIjp7ImRlYnVnTG9nT24iOmZhbHNlLCJ1bmRpc2NvdmVyYWJsZUJ5UGhvbmVOdW1iZXIiOmZhbHNlLCJmb2xsb3dlZE5vdGlmaWNhdGlvbk9uIjp0cnVlLCJhdXRvUGxheVZpZGVvIjp0cnVlLCJyZXBvc3RXaXRoQ29tbWVudCI6dHJ1ZSwic2F2ZURhdGFVc2FnZU1vZGUiOmZhbHNlLCJzdWJzY3JpYmVXZWF0aGVyRm9yZWNhc3QiOnRydWUsInRvcGljUHVzaFNldHRpbmdzIjoiQVNLIiwidG9waWNUYWdHdWlkZU9uIjp0cnVlLCJzeW5jQ29tbWVudFRvUGVyc29uYWxBY3Rpdml0eSI6dHJ1ZSwicHJpdmF0ZVRvcGljU3Vic2NyaWJlIjpmYWxzZSwiZGFpbHlOb3RpZmljYXRpb25PbiI6dHJ1ZSwiZW52IjoicHJvZCJ9LCJ1c2VybmFtZSI6ImVmZjA3ZWI1LTViNmQtNGM5ZC1hY2UyLTFlNTEwMmQ1MGVjNiIsImJhblN0YXR1cyI6MH0sImV4cGlyZXNfYXQiOiIxNTI1ODM1MzQ0LjA1MSJ9.1kULIrFR7ST5Gt_p94FrQzrzFw28tMUv3nfvYv6xRRk',
      "Referer": " https://web.okjike.com/topic/556688fae4b00c57d9dd46ee/official",
      "User-Agent": " Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36"
    },
    callback: (err, res, done) => {
      console.log(res.body)
    }
  })
}

//getList(1)

function getList(page) {
  crawler.queue({
    uri: url3 + page,
    callback: (err, res, done) => {
      let $ = cheerio.load(JSON.parse(res.body).data);

      let items = [];
      $('.UG_list_b').each(function () {
        let url = $(this).attr('href');
        let id = url.match(/id=(\d+)/)[1];

        let piccut = $('.W_piccut_v > img', this).attr('src');
        let title = $('.list_title_b > a', this).text();

        let userPic = $('.subinfo_face img', this).attr('src');
        let userUrl = $('.subinfo_box > a', this).first().attr('href');
        let user = $('span.subinfo.S_txt2', this).first().text();
        let praised = $('.ficon_praised', this).next('em').text();
        let repeat = $('.ficon_repeat', this).next('em').text();
        let forward = $('.ficon_forward', this).next('em').text();

        items.push({ id, url, piccut, title, user, userUrl, userPic, praised, repeat, forward });
      });
      console.log($('.UG_list_b').length)
      genvisitor(items[0]);
      done();
    }
  })
}


function genvisitor(item) {
  crawler.queue({
    uri: 'https://passport.weibo.com/visitor/genvisitor',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Host': ' passport.weibo.com',
      'Origin': ' https://passport.weibo.com',
      'Referer': 'https://passport.weibo.com/visitor/visitor?entry=miniblog&a=enter&url=' + encodeURI(item.url) + '&domain=.weibo.com&ua=php-sso_sdk_client-0.6.28'
    },
    form: { cb: 'gen_callback', fp: { "os": "2", "browser": "Chrome68,0,3404,0", "fonts": "undefined", "screenInfo": "1280*800*24", "plugins": "Portable Document Format::internal-pdf-viewer::Chrome PDF Plugin|::mhjfbmdgcfjbbpaeojofohoefgiehjai::Chrome PDF Viewer|::internal-nacl-plugin::Native Client" } },
    callback: (err, res, done) => {

      let script = res.body.split('&&')[1];
      let start = script.indexOf('{');
      let end = script.lastIndexOf('}');
      let json = script.substring(start, end + 1);
      geneCookie(item, JSON.parse(json));
      done();
    }
  })
}

function geneCookie(item, guest) {

  var tid = guest.data.tid;
  var conficence = guest.data.confidence == undefined ? 100 : guest.data.confidence;
  var where = 3;

  let genCookieUrl = "https://passport.weibo.com/visitor/visitor?a=incarnate&t=" +
    encodeURIComponent(tid) + "&w=" + encodeURIComponent(where) + "&c=" + encodeURIComponent(conficence) +
    "&gc=&cb=cross_domain&from=weibo&_rand=" + Math.random()

  crawler.queue({
    uri: genCookieUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36'
    },
    callback: (err, res, done) => {

      let script = res.body.split('&&')[1];
      let start = script.indexOf('{');
      let end = script.lastIndexOf('}');
      let json = script.substring(start, end + 1);
      getDetail(item, JSON.parse(json));
      done();
    }
  })
}

function getDetail(item, cookie) {
  crawler.queue({
    uri: item.url,
    headers: {
      'Referer': 'https://passport.weibo.com/visitor/visitor?entry=miniblog&a=enter&url=' + encodeURI(item.url) + '&domain=.weibo.com&ua=php-sso_sdk_client-0.6.28',
      Cookie: 'SUB=' + cookie.data.sub + '; SUBP=' + cookie.data.subp,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36'
    },
    callback: function (err, res, done) {

      let $ = cheerio.load(res.body);
      item.content = entities.decode($('.WB_editor_iframe').html()).trim();
      item.time = $('span.time').text().replace(/发布�??/, '').trim();
      item.num = $('span.num').text().replace('阅读数：', '').trim();
      console.log(item)
      done();
    }
  })
}