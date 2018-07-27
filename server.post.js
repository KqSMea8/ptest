let http = require("http");
let subProcess = require('child_process');


let cmd = './cmd ';

let server = http.createServer(function (req, res) {
    let data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', function () {
        data = JSON.stringify(JSON.parse(data));
        subProcess.exec(cmd, function(err,stdout,stderr){
            res.end(JSON.stringify({status:true}));
        })
    });
});

server.listen(9527);
