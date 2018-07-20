let h = "substring", i = "split", j = "replace", k = "substr", e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function substr(a, b) {
    let c = a[h](0, b[0]), d = a[k](b[0], b[1]);
    return c + a[h](b[0])[j](d, "");
}

function getPos(a, b) {
    return b[0] = a.length - b[0] - b[1], b
}

function getHex(a) {
    return {
        str: a[h](4),
        hex: a[h](0, 4)[i]("").reverse().join("")
    }
}

function getDec(a) {
    let b = parseInt(a, 16).toString();
    return {
        pre: b[h](0, 2)[i](""),
        tail: b[h](2)[i]("")
    }
}

function atob(a) {
    for (var b, c, d = 0, g = 0, rst = ""; c = a.charAt(g++); ~c && (b = d % 4 ? 64 * b + c : c, d++ % 4) ? rst += String.fromCharCode(255 & b >> (-2 * d & 6)) : 0)c = e.indexOf(c);
    return rst
}

function decodeMp(url) {
    let hexUrl = getHex(url);
    let decUrl = getDec(hexUrl.hex);
    let str = substr(hexUrl.str, decUrl.pre);
    let pos = getPos(str, decUrl.tail);
    let tmp = substr(str, pos);
    return atob(tmp);
}

module.exports = decodeMp;