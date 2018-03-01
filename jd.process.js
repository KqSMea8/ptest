let fs = require('fs');
let moment = require('moment');
let Status = require('./status.js');

let userFile = '', endDate = '';
let recordsFileName = ['jdRecordsFile.csv', 'tmRecordFile.csv'];
let platforms = ['jd', 'tm'], startDate = '2010-01-01', recIdAttr = ['dealTime', 'orderId'];
let userAttris = ['age', 'city', 'edu', 'income', 'gender'];
let userAttrisValue = [{}, {}, {}, {}, {}];
let userFileHead = 'id,tmSuccess,jdSuccess,city,gender,age,edu,netAge,income,tmId,jdId'.split(',');
let recordAttris = [
    'orderId,price,paidWay,status,dealTime,saler,productNumber,productName,productId,productUrl,loginName,cate'.split(','),
    'orderId,price,postageFee,status,payInfo,dealTime,productNumber,productName,skuId,productUrl,productPrice,productRealPrice,productQuantity,shopName,shopUrl,loginName,cate'.split(',')
];

let params = process.argv.splice(2);
let timeUnitNum = params[2], getTimeUnit;
let jdUserSet = {}, tmUserSet = {},
    userSet = { 0: jdUserSet, 1: tmUserSet },
    recsName = { 0: 'jdRecs', 1: 'tmRecs' };

init();

let tmAllUsers = getTmAllUsers();
let tmBothUsers = getTmBothUsers();
let tmFilterVirtualUsers = getTmFilterVirtualUsers();
let [timeUnits, retention] = calUserRetention();

function overall(tus, ret, pfIdx) {
    for (let i = 0; i < tus.length; i++) {
        for (let j = 0; j < tus.length; j++) {
            let rst = stat(Object.keys(ret[i + '_' + j]), tus[j], pfIdx);
        }
    }
}

function breakdown(tus, ret, pfIdx) {
    for (let l = 0; l < userAttris.length; l++) {
        let values = userAttrisValue[l];
        for (let v = 0; v < values.length; v++) {
            for (let i = 0; i < tus.length; i++) {
                for (let j = 0; j < tus.length; j++) {
                    let ids = Object.keys(ret[i + '_' + j]).filter(uid => {
                        return userSet[pfIdx][uid][userAttris[l]] == values[v];
                    });
                    let rst = stat(ids, tus[j], pfIdx);
                }
            }
        }
    }
}

function stat(userIds, curTimeUnit, pfIdx) {
    let userNum = userIds.length, us = userSet[pfIdx];
    let cost = 0, buyFrequence = 0, cateNum = 0;
    userIds.forEach(id => {
        let tempCateSet = {};
        let recs = us[id][recsName[pfIdx]].filter(rec => rec.timeUnit == curTimeUnit);
        buyFrequence += recs.length;
        recs.forEach(rec => {
            cost += Number(rec.price);
            Object.keys(rec.cateSet).forEach(cateName => {
                tempCateSet[cateName] = 1;
            })
        });
        cateNum += Object.keys(tempCateSet).length;
    });
    return { userNum, cost, buyFrequence, cateNum };
}

function calUserRetention(userIds, pfIdx) {
    let allTimeUnits = {}, rst = {}, firstComeup = {}, currentComeup = {};
    userIds.forEach(uid => {
        uid[recsName[pfIdx]].sort((min, max) => min.timeUnit < max.timeUnit ? -1 : 1);
        uid[recsName[pfIdx]].forEach((rec, idx) => {
            if (idx == 0) {
                insert(uid, rec.timeUnit, firstComeup);
            }
            insert(uid, rec.timeUnit, currentComeup);
            allTimeUnits[rec.timeUnit] = 1;
        });
    });

    let tus = Object.keys(allTimeUnits).sort((min, max) => min < max ? -1 : 1);
    for (let i = 0; i < tus.length; i++) {
        for (let j = 0; j < tus.length; j++) {
            rst[i + '_' + j] = calRetention(i, j);
        }
    }
    return [allTimeUnits, rst];

    function calRetention(start, end) {
        if (start > end) return {};
        if (start == end) return firstComeup[tus[start]];
        if (start < end) {
            let firstUsers = firstComeup[tus[start]];
            let currentUsers = currentComeup[tus[end]];
            return Object.keys(firstUsers).filter(uid => currentUsers[uid]).reduce((pre, cur) => {
                pre[cur] = 1;
                return pre;
            }, {});
        }
    }

    function insert(uid, timeUnit, set) {
        if (!set[timeUnit]) {
            set[timeUnit] = {};
        }
        set[timeUnit][uid] = 1;
    }
}


function init() {
    if (timeUnitNum == 0) {
        getTimeUnit = (month => month > 6 ? 2 : 1);//halfyear
    } else {
        getTimeUnit = (month => Math.ceil(month / 3));//quarter
    }
    getUsers();
    getRecords(0);
    getRecords(1);
}

function getUsers() {
    fs.readFileSync(userFile).toString().trim().split('\n').map(line => {
        let user = {};
        line = line.trim().split(',');
        for (let i = 0; i < line.length; i++) {
            user[userFileHead[i]] = line[i];
        }
        preprocessUser(user);
        if (user.tmSuccess == '是') {
            tmUserSet[user.tmId] = user;
        }
        if (user.jdSuccess == '是') {
            jdUserSet[user.jdId] = user;
        }
    });
    userAttrisValue = userAttrisValue.map(valueSet => Object.keys(valueSet));
}

function preprocessUser(user) {
    user.agecp = user.age;
    user.incomecp = user.income;
    user.educp = user.edu;
    user.age = processAge(user.agecp);
    user.income = processInc(user.incomecp);
    user.edu = processEdu(user.educp);
    user.jdRecs = [];
    user.tmRecs = [];
    for (let i = 0; i < userAttris.length; i++) {
        userAttrisValue[i][user[userAttris[i]]] = 1;
    }
}

function getRecords(pfIdx) {
    let recSet = {};
    let pfAttris = recordAttris[pfIdx];
    fs.readFileSync(recordsFileName[pfIdx]).toString().trim().split('\n').forEach((line, idx) => {
        if (idx == 0) return;
        let rec = {};
        line = line.trim().split(',');
        for (let i = 0; i < line.length; i++) {
            rec[pfAttris[i]] = line[i];
        }
        let validRst = recValid(platforms[pfIdx], rec);
        if (!validRst) return;

        rec.timeUnit = validRst;
        let recId = rec[recIdAttr[pfIdx]];
        if (recSet[recId]) {
            recSet[recId].cateSet[rec.cate] = 1;
        } else {
            rec.cateSet = {};
            rec.cateSet[rec.cate] = 1;
            recSet[recId] = rec;
        }
    });

    Object.keys(recSet).forEach(recId => {
        let us = userSet[pfIdx];
        us[recSet[recId].loginName][recsName[pfIdx]].push(recSet[recId]);
    });
}


function getAllUsers(pfIdx) {
    return Object.keys(userSet[pfIdx]).filter(uid => userSet[pfIdx][uid][recsName[pfIdx]].length);
}

function getBothUsers(pfIdx) {
    let us = userSet[pfIdx];
    return Object.keys(us).filter(uid => us[uid][recsName[0]].length && us[uid][recsName[1]].length);
}

function getFilterVirtualUsers(pfIdx) {
    let us = userSet[pfIdx];
    return Object.keys(us).filter(uid => {
        let rst = false;
        let recs = us[uid][recsName[pfIdx]];
        for (let rec of recs) {
            let cateNames = Object.keys(rec.cateSet);
            if (cateNames.length > 1 || (cateNames.length == 1 && cateNames[0] != 'Virtual')) {
                rst = true;
                break;
            }
        }
        return rst;
    });
}

function recValid(platform, rec) {
    let status = Status.getStatus(platform, rec.status);
    if (status != 'Successful')
        return false;
    let dealTime = moment(rec.dealTime);
    let time = dealTime.format('YYYY-MM-DD');
    if (time < startDate || time >= endDate)
        return false;
    let year = dealTime.format('YYYY');
    let month = Number(dealTime.format('MM'));
    return year + '-' + getTimeUnit(month);
}

function processAge(age) {
    if (age == '19-22岁' || age == '23-29岁') {
        return '19-29岁';
    }
    return age;
}

function processEdu(edu) {
    if (edu.match(硕士 | 研究生 | 本科 | 大本)) return '本科及以上';
    return '本科以下';
}

function processInc(income) {
    if (income.match(/少于1000 |1000-3000| 3000-5000 | 5000-7000 | 7000-10000/))
        return '1w以下';
    if (income.match(10000 - 20000))
        return '1w-2w';
    return '2w以上';
}

function assign(obj, attris, data) {
    if (!(attris instanceof Array) || attris.length < 1) return;
    if (typeof obj != 'object') return;
    if (attris.length == 1) {
        obj[attris.shift()] = data;
        return;
    }
    let attri = attris.shift();
    if (typeof obj[attri] != 'object' || obj[attri] == null) {
        obj[attri] = {};
    }
    assign(obj[attri], attris, data);
}