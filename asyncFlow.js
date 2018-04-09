function asyncFlow(funs, xargs, callback) {
    if (typeof funs == 'function') funs = [funs];
    if (!(funs instanceof Array)) return;
    if (funs.filter(fun => (typeof fun == 'function')).length != funs.length) return;

    if (typeof xargs != 'object') return;
    if (!(xargs instanceof Array)) xargs = [xargs];
    if (xargs.filter(xarg => (typeof xarg == 'object')).length != xargs.length) return;

    let onlyOneFun = false, onlyOneXarg = false;
    if (funs.length != xargs.length) {
        if (funs.length == 1) {
            onlyOneFun = true;
        } else if (xargs.length == 1) {
            onlyOneXarg = true;
        } else {
            return;
        }
    }
    let rst = [];
    executeFuncs();
    function executeFuncs() {
        if (!funs.length || !xargs.length) return callback(null, rst);
        let fun = onlyOneFun ? funs[0] : funs.shift();
        let xarg = onlyOneXarg ? xargs[0] : xargs.shift();
        fun(xarg, function (error, result) {
            rst.push({ error, result });
            executeFuncs();
        });
    }
}

function asyncFun1(option, cb) {
    setTimeout(() => {
        console.log(1, option);
        cb();
    }, 2000);
}

function asyncFun2(option, cb) {
    setTimeout(() => {
        console.log(2, option);
        cb();
    }, 2000);
}

asyncFlow([asyncFun1,asyncFun2], [{ a: 1 }], (err, res) => {
    console.log(res)
})
