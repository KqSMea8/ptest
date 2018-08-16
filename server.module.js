var fs = require('fs');
var ejs = require('ejs');
var http = require("http");

var pageSize = 20;
var storePath = './result/';
var sortIdx = { 'xhs': [], 'meipai': [], 'douyin': [] };
var allVideos = { 'xhs': {}, 'meipai': {}, 'douyin': {} };
var headers, headersFilter;
var routerSet = {
    'view': [view, rendView],
    'mark': [mark, rendMark],
    'list': [list, rendList],
    'down': [down, rendDown]
};

init();

var server = http.createServer(function (req, res) {
    if (req.url.match(/favicon/))
        return;
    let [router, options] = routerParse(req.url);
    if (router === 'none') {
        res.end(JSON.stringify({
            status: 404
        }));
        return;
    }
    let funcs = routerSet[router];
    let rst = funcs[0](options);
    response(rst, funcs[1], res);
});

server.listen(8527);

function routerParse(url) {
    let rst = url.match(/list\/(.*)\?page=(.*)/);
    if (rst) {
        return ['list', {
            platform: rst[1],
            page: Number(rst[2])
        }];
    }
    rst = url.match(/mark\/(.*)\?id=(.*)/);
    if (rst) {
        return ['mark', {
            platform: rst[1],
            id: rst[2]
        }];
    }
    rst = url.match(/view\/(.*)/);
    if (rst) {
        return [
            'view', {
                url: rst[1]
            }
        ]
    }
    return ['none', null];
}

function response(rst, rend, res) {
    let ret = rend(rst);
    if (ret.type == 'html') {
        res.writeHead(200, { 'Content-Type': 'html' });
        res.write(ret.body);
        res.end();
        return;
    }
    if (ret.type === 'video') {
        res.writeHead(200, {
            'Content-Type': 'video/mp4'
        })
        let filePath = './video/' + (ret.url ? ret.url : 'xhs_5b6a61cb07ef1c6a9dc6d123_1533886555846.mp4');
        console.log(filePath);
        let stream = fs.createReadStream(filePath);
        stream.on('end', function (params) {
            res.end();
        });
        stream.pipe(res);
        return;
    }
    res.end(JSON.stringify(ret.body));
}

function view(options) {
    let id = options.url.split('_')[1];
    let info = fs.readdirSync('./video').filter(file => file.match(id))[0];
    return info;
}

function rendView(params) {
    return {
        type: 'video',
        url: params
    }
}

function mark(options) {
    let filePath = getVideoFilePath(options.id, options.platform);
    let newFilePath = '';
    //fs.renameSync(filePath, newFilePath);
}

function getVideoFilePath(id, platform) {
}

function rendMark(options) {
    return {
        type: 'json',
        body: {
            success: true
        }
    }
}

function list(options) {
    let totalP = pageTotal(options.platform);
    if (options.page > totalP) {
        options.page = 1;
    } else if (options.page < 1) {
        options.page = totalP;
    }
    let start = (options.page - 1) * pageSize;
    let end = options.page * pageSize - 1;
    let rst = sortIdx[options.platform].slice(start, end).map(id => {
        return allVideos[options.platform][id];
    });
    return {
        head: headers[options.platform],
        headFilter: headersFilter[options.platform],
        data: rst,
        page: options.page,
        platform: options.platform,
        total: totalP,
        next: '/list/' + options.platform + '?page=' + ((options.page + 1) > totalP ? 1 : (options.page + 1)),
        last: '/list/' + options.platform + '?page=' + ((options.page - 1) < 1 ? totalP : (options.page - 1))
    };
}

function rendList(options) {
    let str = fs.readFileSync('./list.ejs').toString();
    let html = ejs.render(str, { options });
    return {
        type: 'html',
        body: html
    };
}

function down(options) {
}

function rendDown(options) {
}

function init() {
    headers = {
        'xhs': ['topicCategory', 'topicAddress', 'topicUrl', 'id', 'videoTitle', 'videoLikeNum', 'videoAuthor', 'videoDownUrl', 'date'],
        'meipai': [],
        'douyin': []
    };
    headersFilter = {
        'xhs': [1, 1, 0, 0, 1, 1, 0, 0, 0],
        'meipai': [],
        'douyin': []
    }
    Object.keys(headersFilter).forEach(platform => {
        let flags = headersFilter[platform];
        headersFilter[platform] = {};
        for (let index = 0; index < flags.length; index++) {
            headersFilter[platform][headers[platform][index]] = flags[index];
        }
    });
    fs.readdirSync(storePath).forEach(file => {
        let rst = parseFileName(file);
        if (!rst.platform)
            return;
        fs.readFileSync(storePath + file).toString().trim().split('\n').forEach(line => {
            let seed = line.split(',');
            let head = headers[rst.platform];
            let video = {};
            for (let i = 0; i < head.length; i++) {
                video[head[i]] = seed[i];
            }
            getViewUrl(video, rst.platform);
            allVideos[rst.platform][video.id] = video;
        });
    });
    Object.keys(allVideos).forEach(plat => {
        sortIdx[plat] = Object.keys(allVideos[plat]);
    });
}

function parseFileName(seedFile) {
    let info = seedFile.match(/(.*)\.video\.(.*)\.csv/);
    return {
        platform: info[1],
        idx: info[2]
    }
}

function pageTotal(platform) {
    return Math.ceil(sortIdx[platform].length / pageSize);
}

function getViewUrl(video, platform) {
    if (platform === 'xhs') {
        video.viewUrl = '/view/' + platform + '_' + video.id + '_' + video.date + '.mp4';
    }
}