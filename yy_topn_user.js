const fs = require('fs');
const util = require('util');
const moment = require('moment');

let topn = 300, curData = {}, month = process.argv[2], files = getFiles();
let historyfile = '../../result/video/yy_gxb_top' + topn + '_contributor';
let hidArr = getHistory(), daysInMonth = moment(month, 'YYYY-MM-DD').daysInMonth();
let rstfile = '../../result/video/yy_gxb_top_contributor_tracking.' + month + '.csv';

readConsumeData();
contributorStat();

function readConsumeData() {
	for (let file of files) {
		console.log('read file: ' + file);
		fs.readFileSync(file).toString().trim().split('\n').forEach((line) => {
			line = line.trim().split(',');
			contributorFn({ 'contributorid': line[0], 'consume': line[1] });
		});
	}
}

function contributorStat() {
	fs.writeFileSync(rstfile, '\ufeff');
	hidArr.forEach(function (item) {
		let consume = Math.round((curData[item.id].sum / curData[item.id].count) / 7 * daysInMonth);
		fs.appendFileSync(rstfile, [item.addTime, item.id, consume].join() + '\n');
	});
	let ids = Object.keys(curData);
	console.log('total user: ' + ids.length);
	ids.forEach(function (contributorid) {
		curData[contributorid].income = Math.round(curData[contributorid].sum / curData[contributorid].count / 7 * daysInMonth);
	});
	ids.sort(function (min, max) { return curData[max].income - curData[min].income });
	let tempyTopn = topn > ids.length ? ids.length : topn;
	for (let i = 0; i < tempyTopn; i++) {
		fs.appendFileSync(rstfile, [month, ids[i], curData[ids[i]].consume].join() + '\n');
		fs.appendFileSync(historyfile, [month, ids[i]].join() + '\n');
	}
}

function contributorFn(record) {
	record.consume = Number(record.consume) || 0;
	if (record.contributorid in curData) {
		curData[record.contributorid].sum += record.consume;
		curData[record.contributorid].count += 1;
	} else {
		curData[record.contributorid] = {
			sum: record.consume,
			count: 1
		}
	}
}

function getFiles() {
	let indir = '../../result/video/';
	let reg = new RegExp('yy_contributor_' + month);
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