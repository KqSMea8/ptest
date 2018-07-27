var mysql = require('mysql');
var http = require("http");

var connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

connection.connect();

var server = http.createServer(function (request, response) {
    let sm_sql = "select * from table where sign=123456;";
    select(sm_sql).then(rst => {
        if (rst === 1) {
            res.end(JSON.stringify({}));
        } else {
            res.end(JSON.stringify(rst));
        }
    })
});

server.listen(9527);

function select(sql) {
    return new Promise(resolve => {
        connection.query(sql, function (error, result) {
            if (error) {
                resolve(1);
            } else {
                resolve(result);
            }
        });
    })
}
