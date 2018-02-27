
let fs = require('fs');
let moment = require("moment");
let Byline = require("line-by-line");

let dat = process.argv[2];

start(dat);

function start(date) {

    let files = getFileNames();
    let keyList = {}, honorList, stat;
    console.log('start cal week : ' + date);
    init();
    files.forEach(readGxbFile);
    finish7days();
    console.log('all done');

    function init() {
        honorList = { "王": 8, "公": 7, "候": 6, "伯": 5, "子": 4, "男": 3, "勋": 2, "普通": 1 }
        stat = {
            roomIn: {}, contbs: {},
            roomLevel: {
                "1": { count: 0, income: 0 }, "2": { count: 0, income: 0 }, "3": { count: 0, income: 0 },
                "4": { count: 0, income: 0 }, "5": { count: 0, income: 0 }
            },
            contbLevel: {
                "1": { count: 0, consume: 0 }, "2": { count: 0, consume: 0 }, "3": { count: 0, consume: 0 },
                "4": { count: 0, consume: 0 }, "5": { count: 0, consume: 0 }, "6": { count: 0, consume: 0 }, "7": { count: 0, consume: 0 }
            },
            honorStat: Object.keys(honorList).reduce(function (prev, cur) {
                prev[cur] = { uCnt: 0, anchorCnt: 0, consume: 0 };
                return prev;
            }, {})
        }
    }

    function getFileNames() {
        let files = [];
        for (let i = 0; i < 7; i++) {
            files.push('/home/bda/Data/yy/yy_gxb_sid_' + moment(date).subtract(i, "days").format("YYYY-MM-DD") + '.csv');
        }
        return files;
    }

    function getHonor(old, newh) {
        if (honorList[old] < honorList[newh]) return newh;
        return old;
    }


    function formatStats(stats, dir) {
        let rec = [];
        Object.keys(stats.roomLevel).forEach(function (lvl) {
            rec.push(lvl + "\t" + stats.roomLevel[lvl].count + "\t" + stats.roomLevel[lvl].income);
        });
        rec.push("-----");
        Object.keys(stats.honorStat).forEach(function (honor) {
            rec.push(honor + "\t" + stats.honorStat[honor].uCnt + "\t" + stats.honorStat[honor].consume + "\t" + stats.honorStat[honor].anchorCnt);
        });
        rec.push("-----");
        Object.keys(stats.contbLevel).forEach(function (lvl) {
            rec.push(lvl + "\t" + stats.contbLevel[lvl].count + "\t" + stats.contbLevel[lvl].consume);
        });
        let formatFile = dir + "yy_format_" + date + ".csv";
        fs.writeFileSync(formatFile, rec.join('\n') + '\n');
    }


    function readGxbFile(file) {
        console.log('read file: ' + file);
        if (!fs.existsSync(file)) return;

        let uniqSet = {};
        fs.readFileSync(file).toString().trim().split('\n').forEach(function (sline) {
            if (!sline.trim()) return;
            let line = dbstr(sline);
            let flist = line.trim().split(',');
            if (flist.length != 12) return;
            let uid = flist[2], sid = flist[10], honor = flist[6], consume = flist[4];
            uniqSet[sid + '_' + uid] = { sid, uid, consume, honor };
        })
        dealwith(Object.keys(uniqSet).map(function (key) { return uniqSet[key]; }));
    }


    function dealwith(results) {
        for (let i = 0; i < results.length; i++) {
            let rec = results[i];
            let key = rec.sid + "_" + rec.uid;
            if (keyList[key]) continue;
            keyList[key] = 1;
            let consume = rec.consume / 1000;
            if (!stat.roomIn.hasOwnProperty(rec.sid)) { stat.roomIn[rec.sid] = 0; }
            stat.roomIn[rec.sid] += consume;
            if (!stat.contbs.hasOwnProperty(rec.uid)) { stat.contbs[rec.uid] = { consume: 0, anchor: 0, honor: "普通" }; }
            stat.contbs[rec.uid].consume += consume;
            stat.contbs[rec.uid].anchor++;
            stat.contbs[rec.uid].honor = getHonor(stat.contbs[rec.uid].honor, rec.honor);
        }
    }

    function finish7days() {
        let dir = "../../result/video/";
        let roomfile = dir + "yy_room_" + date + ".csv";
        fs.writeFileSync(roomfile, "\ufeff");
        Object.keys(stat.roomIn).forEach(function (roomid) {
            fs.appendFileSync(roomfile, roomid + "," + stat.roomIn[roomid] + "\n");
            let wIncome = stat.roomIn[roomid];
            let rLevel = getRoomLevel(wIncome * 4);
            stat.roomLevel[rLevel].count++;
            stat.roomLevel[rLevel].income += wIncome;
        });

        let ufile = dir + "yy_contributor_" + date + ".csv";
        fs.writeFileSync(ufile, "\ufeff");
        Object.keys(stat.contbs).forEach(function (uid) {
            let honor = stat.contbs[uid].honor;
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
}
function dbstr(str) {
    let nodotstr = str.replace(/['"\\]/g, ' ');
    return nodotstr.replace(/\s+/g, ' ');
}


function getRoomLevel(income) {
    let kIn = income / 1000;
    if (kIn < 50) {
        return "1";
    } else if (kIn < 100) {
        return "2";
    } else if (kIn < 500) {
        return "3";
    } else if (kIn < 1000) {
        return "4";
    } else {
        return "5";
    }
}
function getContbLevel(consume) {
    let kcon = consume / 1000;
    if (kcon < 5) {
        return "1";
    } else if (kcon < 10) {
        return "2";
    } else if (kcon < 50) {
        return "3";
    } else if (kcon < 100) {
        return "4";
    } else if (kcon < 500) {
        return "5";
    } else if (kcon < 1000) {
        return "6";
    } else {
        return "7";
    }
}