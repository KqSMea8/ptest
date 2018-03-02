let fs = require('fs');
let moment = require('moment');

let userFile = '', endDate = '';
let recordsFileName = ['jdRecordsFile.csv', 'tmRecordFile.csv'];////do not disrupt the order
//params above change everytime and need to be filled before starting program

let statusSet = initStatus();
let types = ['all', 'both', 'filterVirtual'];

let startDate = '2010-01-01';
let platforms = ['jd', 'tm'],
    jdUserSet = {}, tmUserSet = {},
    recIdAttr = ['dealTime', 'orderId'],
    userSet = { 0: jdUserSet, 1: tmUserSet },
    recsName = { 0: 'jdRecs', 1: 'tmRecs' };

let userAttrisValueSet = [{}, {}, {}, {}, {}];
let userAttris = ['age', 'city', 'edu', 'income', 'gender'];
let userFileHead = 'id,tmSuccess,jdSuccess,city,gender,age,edu,netAge,income,tmId,jdId'.split(',');

let recordAttris = [
    'orderId,price,paidWay,status,dealTime,saler,productNumber,productName,productId,productUrl,loginName,cate'.split(','),
    'orderId,price,postageFee,status,payInfo,dealTime,productNumber,productName,skuId,productUrl,productPrice,productRealPrice,productQuantity,shopName,shopUrl,loginName,cate'.split(',')
];
let timeUnitNum = process.argv[2], getTimeUnit;
let target = ['userNum', 'cost', 'buyFrequence', 'cateNum'];

init();

calUsers(0, 0);
calUsers(0, 1);
calUsers(0, 2);
calUsers(1, 0);
calUsers(1, 1);
calUsers(1, 2);

function calUsers(pfIdx, type) {
    let userIds0;
    if (type == 0) {
        userIds0 = getAllUsers(pfIdx);
    } else if (type == 1) {
        userIds0 = getBothUsers(pfIdx);
    } else {
        userIds0 = getFilterVirtualUsers(pfIdx);
    }
    let [timeUnits0, retention0] = calUserRetention(userIds0, pfIdx);

    let title = '\ufeff' + timeUnits0[0];
    for (let i = 1; i < timeUnits0.length; i++) {
        title = title + ',' + timeUnits0[i];
    }
    title = title + '\n';
    calTarget(title, timeUnits0, retention0, pfIdx, type);
    breakdown(title, timeUnits0, retention0, pfIdx, type);
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

function calTarget(title, tus, ret, pfIdx, type, flag, attriName, attriValue) {
    let content = target.map(() => title);
    let files = target.map(tar => platforms[pfIdx] + '_' + flag + '_' + types[type] + '_' + tar + '.csv');
    if (attriName !== undefined) {
        files = target.map(tar => platforms[pfIdx] + '_' + flag + '_' + types[type] + '_' + tar + '_' + attriName + '_' + attriValue + '.csv');
    }
    for (let i = 0; i < tus.length; i++) {
        let rst = target.map(() => tus[i]);
        for (let j = 0; j < tus.length; j++) {
            let ids = Object.keys(ret[i + '_' + j]);
            if (flag == 'breakdown') {
                ids = ids.filter(uid => {
                    return userSet[pfIdx][uid][attriName] == attriValue;
                });
            }
            let statRst = stat(ids, tus[j], pfIdx);
            target.forEach((name, idx) => {
                rst[idx] = rst[idx] + ',' + statRst[name];
            });
        }
        rst = rst.map(str => srt + '\n');
        content = content.map((ori, idx) => ori + rst[idx]);
    }
    content.forEach((rstStr, idx) => {
        fs.appendFileSync(files[idx], rstStr);
    });
}

function breakdown(title, tus, ret, pfIdx, type) {
    for (let l = 0; l < userAttris.length; l++) {
        let values = userAttrisValueSet[l];
        for (let v = 0; v < values.length; v++) {
            calTarget(title, tus, ret, pfIdx, type, 'breakdown', userAttris[l], values[v]);
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
    userAttrisValueSet = userAttrisValueSet.map(valueSet => Object.keys(valueSet));
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
        userAttrisValueSet[i][user[userAttris[i]]] = 1;
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
    let status = getStatus(platform, rec.status);
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

function initStatus() {
    let jdstatus = {
        已完成: 'Successful',
        出票成功: 'Successful',
        等待收货: 'Successful',
        充值成功: 'Successful',
        '已完成</br>(充值成功)': 'Successful',
        正在出库: 'Successful',
        商品出库: 'Successful',
        等待处理: 'Successful',
        等待厂商处理: 'Successful',
        正在处理: 'Successful',
        缴费成功: 'Successful',
        请上门自提: 'Successful',
        等待付款: 'Successful',
        '部分充值成功 退款成功': 'Successful',
        卡密提取成功: 'Successful',
        等待审核: 'Successful',
        抢票中: 'Successful',
        已取消: 'Cancelled',
        订单取消: 'Cancelled',
        抢票已取消: 'Cancelled',
        出票失败: 'Failed',
        未抢中: 'Failed',
        已关闭: 'Failed',
        '充值失败，退款成功': 'Refunded',
        商品退库: 'Refunded',
        退款完成: 'Refunded',
        配送退货: 'Refunded',
        失败退款: 'Refunded',
    }

    let tmstatus = {

        交易成功: 'Successful',
        出票成功: 'Successful',
        物流派件中: 'Successful',
        物流运输中: 'Successful',
        快件已签收: 'Successful',
        买家已付款: 'Successful',
        订票成功: 'Successful',
        卖家已发货: 'Successful',
        预定成功: 'Successful',
        已发奖: 'Successful',
        快件已揽收: 'Successful',
        已入住: 'Successful',
        提交需求成功: 'Successful',
        审核通过: 'Successful',
        商家已确认: 'Successful',
        部分发货: 'Successful',
        线下支付: 'Successful',
        卖家已确认: 'Successful',
        拼团成功: 'Successful',
        充值成功: 'Successful',
        等待买家付款: 'Successful',
        待付款: 'Successful',
        已提交: 'Successful',
        已取消: 'Cancelled',
        交易关闭: 'Failed',
        订票失败: 'Failed',
        失效: 'Failed',
        投保失败: 'Failed',
        '超时未付款，订单已关闭': 'Failed',
        申请已关闭: 'Failed',
        未中奖: 'Failed',
        审核未通过: 'Failed',
        未付款: 'Failed',
        已退款: 'Refunded',
        '影院出票失败，已退款': 'Refunded'
    }
    let rst = { 0: jdstatus, 1: tmstatus };
    return rst;
}

function getStatus(pfIdx, originStatus) {
    return statusSet[pfIdx][originStatus];
}