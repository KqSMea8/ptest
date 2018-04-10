var https = require('https');
var fs = require('fs');
var request = require('request');

var filenames = fs.readFileSync('file').toString().split('\r\n')
for (var i = filenames.length - 1; i >= 0; i--) {
	var fileURI = 'https://bootstrapmade.com/wp-content/themefiles/' + filenames[i] + '/' + filenames[i] + '.zip';
	downloadFile(fileURI, filenames[i] + '.zip');
};

function downloadFile(fileURI, filename) {
	request(fileURI).pipe(fs.createWriteStream(filename))
}
