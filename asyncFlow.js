function asyncFlow(options, callback) {
    if (!options) return;
    let funcs = options.funcs, xargs = options.xargs;

    if (typeof funcs == 'function') funcs = [funcs];
    if (!(funcs instanceof Array)) return;
    if (!funcs.every(func => typeof func == 'function')) return;

    if (typeof xargs != 'object') return;
    if (!(xargs instanceof Array)) xargs = [xargs];
    if (xargs.every(xarg => typeof xarg == 'object')) return;

    if (funcs.length == 1 && xargs.length == 1) return;
    if (funcs.length != xargs.length && funcs.length != 1 && xargs.length != 1) return;

    let funcIdx = 0, xargIdx = 0, tmpResults = [];
    executeFuncs();

    function executeFuncs() {
        if (funcIdx >= funcs.length || xargIdx >= xargs.length) {
            if (typeof callback == 'function') callback(null, tmpResults);
            return;
        }
        let func = funcs[funcIdx];
        let xarg = xargs[xargIdx];
        func(xarg, function (error, result) {
            tmpResults.push({ error, result });
            funcIdx += (funcs.length == 1 ? 0 : 1);
            xargIdx += (xargs.length == 1 ? 0 : 1);
            executeFuncs();
        });
    }
}

exports.asyncFlow = asyncFlow
