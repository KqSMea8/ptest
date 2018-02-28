const fs = require('fs');
const util = require('util');
const moment = require('moment');

let topn = 100, curData = {}, month = process.argv[2], files = getFiles();
let historyfile = '../../result/video/yy_gxb_top' + topn + '_room';
let hidArr = getHistory(), daysInMonth = moment(month, 'YYYY-MM-DD').daysInMonth();
let rstfile = '../../result/video/yy_gxb_top_room_tracking.' + month + '.csv';

readIncome();
roomStat();

function readIncome() {
	for (let file of files) {
		console.log('read file: ' + file);
		fs.readFileSync(file).toString().trim().split('\n').forEach((line) => {
			line = line.trim().split(',');
			roomFn({ 'roomid': line[0], 'income': line[1] });
		});
	}
}

function roomStat() {

	let ids = Object.keys(curData);
	console.log('total user: ' + ids.length);
	ids.forEach(function (roomid) {
		curData[roomid].totalIncome = Math.round(curData[roomid].sum / curData[roomid].count / 7 * daysInMonth);
	});

	fs.writeFileSync(rstfile, '\ufeff');
	hidArr.forEach(function (item) {
		let totalIncome = 'NaN';
		if (curData[item.id]) totalIncome = curData[item.id].totalIncome;
		fs.appendFileSync(rstfile, [item.addTime, item.id, totalIncome].join() + '\n');
	});

	ids.sort(function (min, max) { return curData[max].totalIncome - curData[min].totalIncome });
	let tempyTopn = topn > ids.length ? ids.length : topn;
	for (let i = 0; i < tempyTopn; i++) {
		fs.appendFileSync(rstfile, [month, ids[i], curData[ids[i]].totalIncome].join() + '\n');
		fs.appendFileSync(historyfile, [month, ids[i]].join() + '\n');
	}
}

function roomFn(record) {
	record.income = Number(record.income) || 0;
	if (record.roomid in curData) {
		curData[record.roomid].sum += record.income;
		curData[record.roomid].count += 1;
	} else {
		curData[record.roomid] = {
			sum: record.income,
			count: 1
		}
	}
}

function getFiles() {
	let indir = '../../result/video/';
	let reg = new RegExp('yy_room_' + month);
	return fs.readdirSync(indir).filter(function (file) {
		return reg.test(file);
	}).map(function (file) {
		return indir + file;
	});
}

function getHistory() {
	let rst1 = [];
	if (!fs.existsSync(historyfile)) return rst1;
	fs.readFileSync(historyfile).toString().trim().split('\n').forEach(function (line) {
		let vals = line.trim().split(',');
		rst1.push({ id: vals[1], addTime: vals[0] });
	});
	return rst1;
}