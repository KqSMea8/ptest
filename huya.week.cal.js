let fs = require('fs');
let moment = require("moment");
let Byline = require("line-by-line");

let _prgname = "huya";
let dat = process.argv[2];

start(dat, function () {
    console.log('all done!');
});

function start(date, callback) {
    console.log('start cal week : ' + date);
    let roomList = {};
    let files = getFileNames(date);
    let [honorList, lvlHonorList, stat] = init();

    readGxbFile(files[0]).then(() => {
        return readGxbFile(files[1])
    }).then(() => {
        return readGxbFile(files[2])
    }).then(() => {
        return readGxbFile(files[3])
    }).then(() => {
        return readGxbFile(files[4])
    }).then(() => {
        return readGxbFile(files[5])
    }).then(() => {
        return readGxbFile(files[6])
    }).then(() => {
        finish7days();
        callback();
    });

    function getHighHonor(old, newh) {
        if (honorList[old] < honorList[newh]) return newh;
        return old;
    }
    function getHonor(level) {
        if (level >= -1 && level <= 6) return lvlHonorList[level];
        return null;
    }
    function finish7days() {
        dir = "../../result/video/";
        let roomfile = dir + _prgname + "_room_" + date + ".csv";
        fs.writeFileSync(roomfile, "\ufeff");
        Object.keys(stat.roomIn).forEach(function (roomid) {
            fs.appendFileSync(roomfile, roomid + "," + stat.roomIn[roomid] + "\n");
            let wIncome = stat.roomIn[roomid];
            let rLevel = getRoomLevel(wIncome * 4);
            stat.roomLevel[rLevel].count++;
            stat.roomLevel[rLevel].income += wIncome;
        });

        let ufile = dir + _prgname + "_contributor_" + date + ".csv";
        fs.writeFileSync(ufile, "\ufeff");
        Object.keys(stat.contbs).forEach(function (uid) {
            let honor = stat.contbs[uid].honorLvl;
            let consume = stat.contbs[uid].consume;
            let anchor = stat.contbs[uid].anchor;
            fs.appendFileSync(ufile, uid + "," + consume + "," + anchor + "," + honor + "\n");
            stat.honorStat[honor].uCnt++;
            stat.honorStat[honor].consume += consume;
            stat.honorStat[honor].anchorCnt += anchor;
            let cLevel = getContbLevel(consume * 4);
            stat.contbLevel[cLevel].count++;
            stat.contbLevel[cLevel].consume += consume;
        });
        formatStats(stat, dir);
    }

    function formatStats(stats, dir) {
        let rec = [];
        Object.keys(stats.roomLevel).forEach(function (lvl) {
            rec.push(lvl + "\t" + stats.roomLevel[lvl].count + "\t" + stats.roomLevel[lvl].income);
        });
        rec.push("-----");
        Object.keys(stats.honorStat).forEach(function (honor) {
            rec.push(getHonor(honor) + "\t" + stats.honorStat[honor].uCnt + "\t" + stats.honorStat[honor].consume + "\t" + stats.honorStat[honor].anchorCnt);
        });
        rec.push("-----");
        Object.keys(stats.contbLevel).forEach(function (lvl) {
            rec.push(lvl + "\t" + stats.contbLevel[lvl].count + "\t" + stats.contbLevel[lvl].consume);
        });
        let formatFile = dir + _prgname + "_format_" + date + ".csv";
        fs.writeFileSync(formatFile, rec.join('\n') + '\n');
    }

    function readGxbFile(file) {

        return new Promise((resolve, reject) => {
            console.log('read file: ' + file);
            if (!fs.existsSync(file)) return resolve();
            let keyList = {};

            let reader = new Byline(file);
            reader.on("line", function (sline) {
                if (!sline) return;
                let line = dbstr(sline);
                let flist = line.trim().split(',');
                if (flist.length != 14) return;
                let nobleLevel = flist[12], gxId = flist[8], score = flist[10], url = flist[0];
                keyList[url + '_' + gxId] = { nobleLevel, gxId, score, url };

            });
            reader.on("end", function () {
                dealwith(Object.keys(keyList).map(function (key) { return keyList[key]; }));
                resolve();
            });
        });
    }

    function dealwith(results) {
        let nRoomList = {};
        for (let i = 0; i < results.length; i++) {
            let rec = results[i];
            if (roomList[rec.url]) continue;
            nRoomList[rec.url] = 1;
            let consume = rec.score / 1000;
            if (!stat.roomIn.hasOwnProperty(rec.url)) { stat.roomIn[rec.url] = 0; }
            stat.roomIn[rec.url] += consume;
            if (!stat.contbs.hasOwnProperty(rec.gxId)) { stat.contbs[rec.gxId] = { consume: 0, anchor: 0, honorLvl: -1 }; }
            stat.contbs[rec.gxId].consume += consume;
            stat.contbs[rec.gxId].anchor++;
            if (stat.contbs[rec.gxId].honorLvl < rec.nobleLevel) stat.contbs[rec.gxId].honorLvl = rec.nobleLevel;
        }
        Object.keys(nRoomList).forEach(function (url) { roomList[url] = 1; });
    }
}


function dbstr(str) {
    var nodotstr = str.replace(/['"\\]/g, ' ');
    return nodotstr.replace(/\s+/g, ' ');
}

function init() {
    honorList = {
        "帝": 6, "王": 5, "爵": 4, "领": 3, "骑": 2, "剑": 1, "普通": -1
    };
    lvlHonorList = Object.keys(honorList).reduce(function (prev, cur) {
        prev[honorList[cur]] = cur; return prev;
    }, {});
    stat = {
        roomIn: {}, contbs: {},
        roomLevel: {
            "1": { count: 0, income: 0 }, "2": { count: 0, income: 0 }, "3": { count: 0, income: 0 },
            "4": { count: 0, income: 0 }, "5": { count: 0, income: 0 }, "6": { count: 0, income: 0 }
        },
        contbLevel: {
            "1": { count: 0, consume: 0 }, "2": { count: 0, consume: 0 }, "3": { count: 0, consume: 0 },
            "4": { count: 0, consume: 0 }, "5": { count: 0, consume: 0 }, "6": { count: 0, consume: 0 },
            "7": { count: 0, consume: 0 }, "8": { count: 0, consume: 0 }, "9": { count: 0, consume: 0 }
        },
        honorStat: Object.keys(lvlHonorList).reduce(function (prev, cur) {
            prev[cur] = { uCnt: 0, anchorCnt: 0, consume: 0 };
            return prev;
        }, {})
    };
    return [honorList, lvlHonorList, stat];
}

function getFileNames(date) {
    let files = [];
    for (let i = 0; i < 7; i++) {
        files.push('/home/bda/Data/huya/huya_gxb_' + moment(date).subtract(i, "days").format("YYYY-MM-DD") + '.csv');
    }
    return files;
}

function getRoomLevel(income) {
    var kIn = income / 1000;
    if (kIn < 1) {
        return "1";
    } else if (kIn < 50) {
        return "2";
    } else if (kIn < 100) {
        return "3";
    } else if (kIn < 500) {
        return "4";
    } else if (kIn < 1000) {
        return "5";
    } else {
        return "6";
    }
}
function getContbLevel(consume) {
    var kcon = consume / 1000;
    if (kcon < 0.5) {
        return "1";
    } else if (kcon < 1) {
        return "2";
    } else if (kcon < 5) {
        return "3";
    } else if (kcon < 10) {
        return "4";
    } else if (kcon < 50) {
        return "5";
    } else if (kcon < 100) {
        return "6";
    } else if (kcon < 500) {
        return "7";
    } else if (kcon < 1000) {
        return "8";
    } else {
        return "9";
    }
}