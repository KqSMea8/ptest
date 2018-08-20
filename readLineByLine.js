let fs = require('fs');
let rl = require('readline');

let filename = '';

var lineReader = rl.createInterface({
    input: fs.createReadStream(filename)
});

lineReader.on('line', function (line) {
    dealwith(line);
});


lineReader.on('close', function () {

});

function dealwith(line) {
    console.log(line);
}