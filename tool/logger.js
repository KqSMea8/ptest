const moment = require('moment');
const logger = require('winston');
const env = process.env.NODE_ENV || 'development';

let getlogger = function (options) {

	logger.add(logger.transports.File, {
		filename: (options.logdir || '../log/') + options.prgname + '.log' + moment().format(options.datePattern),
		handleExceptions: (env !== 'development'),
		timestamp: function () {
			return moment().format('YYYY-MM-DD HH:mm:ss');
		}
	});
	logger.level = options.level || 'info';
	if (env !== 'development') {
		logger.remove(logger.transports.Console);
	} else {
		logger.cli();
	}
	return logger;
}

module.exports.getlogger = getlogger;