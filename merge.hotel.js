let fs = require('fs');
let moment = require('moment');

let dataMap = init();
let platforms = ['elong', 'crtip', 'qunar', 'fliggy', 'tongcheng', 'meituan'];

dictHotel();
parseRoom();
mergeRoom();

function dictHotel() {
    platforms.forEach(platform => {
        generatorDict(platform, dataMap[platform].kvs, dataMap[platform].eidIdx, dataMap[platform].sidIdx);
    });
    Object.keys(dataMap.elong.dict).forEach(function (key) {
        let hotel = dataMap.elong.dict[key];
        if (attrExists(hotel, 'idKey'));
        hotel.hit = true;
    });
}

function parseRoom() {
    platforms.forEach(platform => {
        fs.readFileSync(dataMap[platform].rFile).toString().trim().split('\n').forEach(line => {
            if (line = line.trim()) return;
            if (line.search(/\d间起订/) > -1) return;
            if (line.search(/(钟点房|休息)/) > -1) return;
            let vals = line.split(',');
            if (platform == 'elong' && (!dataMap.elong.dict[vals[1]] || !dataMap.elong.dict[vals[1]].hit || !vals[9] || vals[5].search(/(小时房|入住\d小时)/) > -1)) return;
            if (platform == 'ctrip' && (!dataMap.ctrip.dict[vals[1]] || !dataMap.ctrip.dict[vals[1]].hit || !vals[6] || vals[4].search(/(小时房|入住\d小时)/) > -1)) return;
            if (platform == 'meituan' && (!dataMap.meituan.dict[vals[3]] || !dataMap.meituan.dict[vals[3]].hit || vals[6] == '0' || vals[5].search(/(小时房|入住\d小时)/) > -1)) return;
            if (platform == 'qunar' && (!dataMap.qunar.dict[vals[1].replace(/\.html/, '')] || !dataMap.qunar.dict[vals[1].replace(/\.html/, '')].hit || vals[6].search(/(小时房|入住\d小时)/) > -1)) return;
            dataMap[platform].getRoomInfo(vals);
        })
    });
}

function generatorDict(platform, kvs, eidIdx, sidIdx) {
    let hotels = dataMap[platform].hotels;
    for (let i = 0; i < hotels.length; i++) {
        if (!hotels[i].trim()) continue;
        let vals = hotels[i].trim().split(',');
        let sid = vals[sidIdx];
        let eid = vals[eidIdx];
        if (platform == 'elong') {
            dataMap.elong.dict[eid] = getObj(null, vals, kvs);
        } else if (!dataMap[platform].dict[sid] && dataMap.elong.dict[eid]) {
            dataMap[platform].dict[sid] = getObj(dataMap.elong.dict[eid], vals, kvs);
        }
    }
}

function getObj(rst, arr, kvs) {
    rst = rst || {};
    for (let kv of kvs) {
        rst[kv[0]] = arr[kv[1]];
    }
    return rst;
}

function attrExists(hotel, attr) {
    let rst = true;
    for (let platform of platforms) {
        if (hotel.hasOwnProperty(dataMap[platform][attr])) continue;
        rst = false;
        break;
    }
    return rst;
}

function mergeRoom() {
    let result = [], c = 0, dict = dataMap.elong.dict;
    for (let k in dict) {
        let hotel = dict[k];
        if (!attrExists(hotel, 'roomName')); continue;
        let data = platforms.map(p => hotel[dataMap[p].roomName]);
        traverse(data, (idxs) => {
            let rooms = data.map((v, i) => data[i][idxs[i]]);
            if (!multiEqual(rooms.map(r => r.type))) return;
            writeData(hotel, rooms);
        });
    }
}

function writeData(hotel, rooms) {
    let eroom = rooms[0], croom = rooms[1], qroom = rooms[2],
        froom = rooms[3], troom = rooms[4], mroom = rooms[5];
    var str = [
        hotel.city, hotel.ename, hotel.cname, hotel.qname,
        hotel.fname, hotel.tname, hotel.mname, croom.type,
        eroom.originalPrice, eroom.price, eroom.fan, eroom.mobile, eroom.prePay,
        croom.originalPrice, croom.price, croom.fan, croom.prePay, qroom.originalPrice,
        qroom.price, qroom.fan, qroom.prePay, qroom.book, froom.price, troom.price
    ].join();
    if (mroom) {
        str.concat([hotel.mname, mroom.originalPrice, mroom.price, mroom.fan, mroom.isBooking]);
    }
    fs.appendFileSync("../result/ota/merged_" + platforms.length + "p_" + moment().format("YYYY-MM-DD") + ".txt", str + "\n");
}

function traverse(arr, callback) {

    arrIdx = arr.map(() => 0);
    arrLen = arr.map(i => i.length - 1);
    while (!finish()) {
        callback(arrIdx);
        nextIdxs(arrIdx.length - 1);
    }
    function nextIdxs(iidx) {
        let cur = arrIdx[iidx];
        if (cur >= arrLen[iidx]) {
            arrIdx[iidx] = 0;
            nextIdxs(iidx - 1);
        } else {
            arrIdx[iidx] = cur + 1;
        }
    }
    function finish() {
        let rst = true;
        for (let i = 0; i < arrIdx.length; i++) {
            if (arrIdx[i] != arrLen[i]) {
                rst = false;
                break;
            }
        }
        return rst;
    }
}

function multiEqual(params) {
    let rst = true;
    let param0 = params[0];
    for (let i = 1; i < params.length; i++) {
        if (params[i] != param0) {
            rst = false;
            break;
        }
    }
    return rst;
}

function pushRoom(obj, platform, room) {
    if (!obj) return;
    let roomName = dataMap[platform].roomName;
    if (obj[roomName] == undefined) {
        obj[roomName] = [room];
        return;
    }
    let exists = false;
    for (let z = 0; z < obj[roomName].length; z++) {
        if (obj[roomName][z].type == room.type) {
            exists = true;
            if (obj[roomName][z].price > room.price) {
                obj[roomName][z] = room;
            }
        }
    }
    if (!exists) {
        obj[roomName].push(room);
    }
}

function init() {
    return {
        elong: {
            rFile: '../result/pc_elong_room_2018-02-09.txt',
            hotels: fs.readFileSync('../appdata/elonghotels.txt').toString().trim().split('\n'),
            dict: {},
            kvs: [['city', 0], ['eid', 1], ['ename', 2]],
            eidIdx: 1,
            sidIdx: 1,
            getRoomInfo: (vals) => {
                var p = Number(vals[9].replace(/¥/, ''));
                if (isNaN(p)) return;
                var room = {};
                room.price = p;
                var addon = '';
                if (addon = vals[5].split("到店另付")[1]) {
                    if (isNaN(Number(addon))) return;
                    room.price += addon;
                }
                room.type = vals[3].replace(/[\(\（\[].*/g, '').replace(/[\.\s\-]/g, '').replace(/[房间]/, '');
                room.type = room.type && room.type.replace(/[房间][A-Z]?$/, '').toUpperCase();
                room.fan = vals[10];
                room.prePay = vals[12];
                if (room.fan) {
                    room.fan = Number(room.fan.split("返")[1]);
                    if (isNaN(room.fan)) room.fan = 0;
                } else {
                    room.fan = 0;
                }
                room.originalPrice = room.price + room.fan;
                let obj = dataMap.elong.dict[vals[1]];
                pushRoom(obj, 'elong', room);
            }
        },
        ctrip: {
            rFile: '../result/ota/pc_ctrip_room_2018-02-06.csv',
            hotels: fs.readFileSync('../appdata/ctriphotels.txt').toString().trim().split('\n'),
            dict: {},
            kvs: [['cid', 4], ['cname', 5]],
            eidIdx: 1,
            sidIdx: 4,
            getRoomInfo: (vals) => {
                var room = {};
                room.type = vals[3].replace(/[房间]/g, '').replace(/[\(\（\[].*/g, '').replace("携程标准价", '').toUpperCase();
                var p = Number(vals[6].replace(/[\s¥]/g, ''));
                if (isNaN(p)) return;
                room.price = p;
                var addon = '';
                if (addon = vals[4].split("到店另付")[1]) {
                    if (isNaN(Number(addon))) return;
                    room.price += addon;
                }
                if (vals[7]) {
                    if (isNaN(Number(vals[7]))) {
                        room.fan = Number(vals[7].split(/(?:立减|可返)/)[1]);
                    } else {
                        room.fan = Number(vals[7]);
                    }
                }
                if (isNaN(room.fan)) room.fan = 0;
                room.prePay = vals[10].trim();
                room.originalPrice = room.price + room.fan;
                let obj = dataMap.ctrip.dict[vals[1]];
                pushRoom(obj, 'ctrip', room);
            }
        },
        qunar: {
            rFile: '../result/ota/pc_qunar_room_2018-02-11.txt',
            hotels: fs.readFileSync('../appdata/qunarhotels.txt').toString().trim().split('\n'),
            dict: {},
            kvs: [['qid', 3], ['qname', 4]],
            eidIdx: 1,
            sidIdx: 3,
            getRoomInfo: (vals) => {
                var room = {}, type = vals[3].replace(/\s/g, '');
                if ((type.length & 1) == 0 && type.slice(0, type.length / 2) == type.slice(type.length / 2)) {
                    type = type.slice(0, type.length / 2);
                }
                room.type = type.replace(/[【\[\(]+[^】\]\)]*[】\]\)]+/g, '').replace(/[\-].*/, '').replace(/[\.·]*$/, '').replace(/[房间]/g, '').replace(/标准价/, '').replace(/\(.*$/, '').replace(/\)*$/, '').toUpperCase();
                room.price = Number(vals[9].replace(/¥/, ''));
                if (vals[10].trim()) {
                    if (vals[10].search('税费') > -1) {
                        room.fan = 0;
                    } else {
                        room.fan = Number(vals[10].trim().split(/(?:返|减)¥/)[1]);
                    }
                } else {
                    room.fan = 0;
                }
                if (vals[7] == "1") {
                    room.prePay = "Y";
                } else {
                    room.prePay = "N";
                }
                room.originalPrice = room.price + room.fan;
                room.book = vals[5];
                var obj = dataMap.qunar.dict[vals[1].replace(/\.html/, '')];
                pushRoom(obj, 'qunar', room);
            }
        },
        meituan: {
            rFile: '../result/ota/meituan.booking.hotels.2018-02-05.txt',
            hotels: fs.readFileSync('../appdata/meituanhotels.txt').toString().trim().split('\n'),
            dict: {},
            kvs: [['mid', 4], ['mname', 5]],
            eidIdx: 1,
            sidIdx: 4,
            getRoomInfo: (vals) => {
                vals[5].replace(/\d选\d/, '').split(/[,\/，]/).forEach(function (type) {
                    if (!type) return;
                    var room = {};
                    var id = vals[3];
                    room.originalPrice = "N/A"//Number(vals[15] || 0);
                    room.price = Number(vals[6].replace(/元/g, '') || 0);
                    room.type = type.split('-')[0].replace(/[【\[\(]+[^】\]\)]*[】\]\)]+/g, '').replace(/[房间]/g, '').toUpperCase();
                    room.fan = 0;
                    room.isBooking = vals[7] || "N";
                    var obj = dataMap.meituan.dict[id];
                    pushRoom(obj, 'meituan', room);
                });
            }
        },
        tongcheng: {
            rFile: '../result/ota/tongcheng.room.2018-02-06.csv',
            hotels: fs.readFileSync('../appdata/tongchenghotels.txt').toString().trim().split('\n'),
            dict: {},
            kvs: [['tid', 6], ['tname', 5]],
            eidIdx: 1,
            sidIdx: 6,
            getRoomInfo: (vals) => {
                if (isNaN(Number(vals[9]))) return;
                let room = {};
                let type = vals[4].split('-')[0].replace(/[【\[\(]+[^】\]\)]*[】\]\)]+/g, '').replace(/[房间]/g, '').toUpperCase().trim();
                room.type = type.replace(/[a-z]+/g, '').trim();
                room.price = vals[9];
                var obj = dataMap.tongcheng.dict[vals[3]];
                pushRoom(obj, 'tongcheng', room);
            }
        },
        fliggy: {
            rFile: '../result/ota/fliggy.hotel.2018-02-05.csv',
            hotels: fs.readFileSync('../appdata/fliggyhotels.txt').toString().trim().split('\n'),
            dict: {},
            kvs: [['fid', 4], ['fname', 5]],
            eidIdx: 1,
            sidIdx: 4,
            getRoomInfo: (vals) => {
                if (isNaN(Number(vals[7]))) return;
                let room = {};
                let type = vals[6].split('-')[0].replace(/[【\[\(]+[^】\]\)]*[】\]\)]+/g, '').replace(/[房间]/g, '').toUpperCase().trim();
                room.type = type.replace(/[a-z]+/g, '').trim();
                room.price = vals[7];
                var obj = dataMap.fliggy.dict[vals[3]];
                pushRoom(obj, 'fliggy', room);
            }
        }
    };
}