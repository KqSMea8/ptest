var k1x = {};
var BR0x = function (iu4y) {
    if (iu4y < -128) {
        return BR0x(128 - (-128 - iu4y))
    } else if (iu4y >= -128 && iu4y <= 127) {
        return iu4y
    } else if (iu4y > 127) {
        return BR0x(-129 + iu4y - 127)
    } else {
        throw new Error("1001")
    }
};
var coI9z = function (iu4y, bj1x) {
    return BR0x(iu4y + bj1x)
};
var coH9y = function (Zl8d, blG2x) {
    if (Zl8d == null) {
        return null
    }
    if (blG2x == null) {
        return Zl8d
    }
    var rI7B = [];
    var coG9x = blG2x.length;
    for (var i = 0, bs1x = Zl8d.length; i < bs1x; i++) {
        rI7B[i] = coI9z(Zl8d[i], blG2x[i % coG9x])
    }
    return rI7B
};
var coE9v = function (Zb8T) {
    if (Zb8T == null) {
        return Zb8T
    }
    var rI7B = [];
    var coB9s = Zb8T.length;
    for (var i = 0, bs1x = coB9s; i < bs1x; i++) {
        rI7B[i] = BR0x(0 - Zb8T[i])
    }
    return rI7B
};
var coA9r = function (blT2x, Oo4s) {
    blT2x = BR0x(blT2x);
    Oo4s = BR0x(Oo4s);
    return BR0x(blT2x ^ Oo4s)
};
var bQB1x = function (On4r, blX2x) {
    if (On4r == null || blX2x == null || On4r.length != blX2x.length) {
        return On4r
    }
    var rI7B = [];
    var cox9o = On4r.length;
    for (var i = 0, bs1x = cox9o; i < bs1x; i++) {
        rI7B[i] = coA9r(On4r[i], blX2x[i])
    }
    return rI7B
};
var bQz1x = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
var cov9m = function (dw2x) {
    var KI3x = [];
    KI3x.push(bQz1x[dw2x >>> 4 & 15]);
    KI3x.push(bQz1x[dw2x & 15]);
    return KI3x.join("")
};
var bQy1x = function (vh8Z) {
    var bs1x = vh8Z.length;
    if (vh8Z == null || bs1x < 0) {
        return new String("")
    }
    var KI3x = [];
    for (var i = 0; i < bs1x; i++) {
        KI3x.push(cov9m(vh8Z[i]))
    }
    return KI3x.join("")
};
var bQu1x = function (YO7H) {
    if (YO7H == null || YO7H.length == 0) {
        return YO7H
    }
    var bmg2x = new String(YO7H);
    var rI7B = [];
    var bs1x = bmg2x.length / 2;
    var bj1x = 0;
    for (var i = 0; i < bs1x; i++) {
        var pc6W = parseInt(bmg2x.charAt(bj1x++), 16) << 4;
        var pb6V = parseInt(bmg2x.charAt(bj1x++), 16);
        rI7B[i] = BR0x(pc6W + pb6V)
    }
    return rI7B
};
var bQs1x = function (cN2x) {
    if (cN2x == null || cN2x == undefined) {
        return cN2x
    }
    var Og4k = encodeURIComponent(cN2x);
    var vh8Z = [];
    var bQr1x = Og4k.length;
    for (var i = 0; i < bQr1x; i++) {
        if (Og4k.charAt(i) == "%") {
            if (i + 2 < bQr1x) {
                vh8Z.push(bQu1x(Og4k.charAt(++i) + "" + Og4k.charAt(++i))[0])
            } else {
                throw new Error("1009")
            }
        } else {
            vh8Z.push(Og4k.charCodeAt(i))
        }
    }
    return vh8Z
};
var cnX9O = function (xS9J) {
    var bc1x = 0;
    bc1x += (xS9J[0] & 255) << 24;
    bc1x += (xS9J[1] & 255) << 16;
    bc1x += (xS9J[2] & 255) << 8;
    bc1x += xS9J[3] & 255;
    return bc1x
};
var cIV4Z = function (bc1x) {
    var xS9J = [];
    xS9J[0] = bc1x >>> 24 & 255;
    xS9J[1] = bc1x >>> 16 & 255;
    xS9J[2] = bc1x >>> 8 & 255;
    xS9J[3] = bc1x & 255;
    return xS9J
};
var cnT9K = function (cW2x, bmz2x, bs1x) {
    var dE2x = [];
    if (cW2x == null || cW2x.length == 0) {
        return dE2x
    }
    if (cW2x.length < bs1x) {
        throw new Error("1003")
    }
    for (var i = 0; i < bs1x; i++) {
        dE2x[i] = cW2x[bmz2x + i]
    }
    return dE2x
};
var bmA2x = function (cW2x, bmz2x, sV7O, cnS9J, bs1x) {
    if (cW2x == null || cW2x.length == 0) {
        return sV7O
    }
    if (sV7O == null) {
        throw new Error("1004")
    }
    if (cW2x.length < bs1x) {
        throw new Error("1003")
    }
    for (var i = 0; i < bs1x; i++) {
        sV7O[cnS9J + i] = cW2x[bmz2x + i]
    }
    return sV7O
};
var cnQ9H = function (bs1x) {
    var bu1x = [];
    for (var i = 0; i < bs1x; i++) {
        bu1x[i] = 0
    }
    return bu1x
};
var cnO9F = [82, 9, 106, -43, 48, 54, -91, 56, -65, 64, -93, -98, -127, -13, -41, -5, 124, -29, 57, -126, -101, 47, -1, -121, 52, -114, 67, 68, -60, -34, -23, -53, 84, 123, -108, 50, -90, -62, 35, 61, -18, 76, -107, 11, 66, -6, -61, 78, 8, 46, -95, 102, 40, -39, 36, -78, 118, 91, -94, 73, 109, -117, -47, 37, 114, -8, -10, 100, -122, 104, -104, 22, -44, -92, 92, -52, 93, 101, -74, -110, 108, 112, 72, 80, -3, -19, -71, -38, 94, 21, 70, 87, -89, -115, -99, -124, -112, -40, -85, 0, -116, -68, -45, 10, -9, -28, 88, 5, -72, -77, 69, 6, -48, 44, 30, -113, -54, 63, 15, 2, -63, -81, -67, 3, 1, 19, -118, 107, 58, -111, 17, 65, 79, 103, -36, -22, -105, -14, -49, -50, -16, -76, -26, 115, -106, -84, 116, 34, -25, -83, 53, -123, -30, -7, 55, -24, 28, 117, -33, 110, 71, -15, 26, 113, 29, 41, -59, -119, 111, -73, 98, 14, -86, 24, -66, 27, -4, 86, 62, 75, -58, -46, 121, 32, -102, -37, -64, -2, 120, -51, 90, -12, 31, -35, -88, 51, -120, 7, -57, 49, -79, 18, 16, 89, 39, -128, -20, 95, 96, 81, 127, -87, 25, -75, 74, 13, 45, -27, 122, -97, -109, -55, -100, -17, -96, -32, 59, 77, -82, 42, -11, -80, -56, -21, -69, 60, -125, 83, -103, 97, 23, 43, 4, 126, -70, 119, -42, 38, -31, 105, 20, 99, 85, 33, 12, 125];
var KC3x = 64;
var YA7t = 64;
var bQk1x = 4;
var cnH9y = function (rR7K) {
    var bQj1x = [];
    if (rR7K == null || rR7K == undefined || rR7K.length == 0) {
        return cnQ9H(YA7t)
    }
    if (rR7K.length >= YA7t) {
        return cnT9K(rR7K, 0, YA7t)
    } else {
        for (var i = 0; i < YA7t; i++) {
            bQj1x[i] = rR7K[i % rR7K.length]
        }
    }
    return bQj1x
};
var cnC9t = function (Yx7q) {
    if (Yx7q == null || Yx7q.length % KC3x != 0) {
        throw new Error("1005")
    }
    var bnp3x = [];
    var bj1x = 0;
    var cnr9i = Yx7q.length / KC3x;
    for (var i = 0; i < cnr9i; i++) {
        bnp3x[i] = [];
        for (var j = 0; j < KC3x; j++) {
            bnp3x[i][j] = Yx7q[bj1x++]
        }
    }
    return bnp3x
};
var cnq9h = function (bQe1x) {
    var pc6W = bQe1x >>> 4 & 15;
    var pb6V = bQe1x & 15;
    var bj1x = pc6W * 16 + pb6V;
    return cnO9F[bj1x]
};
var bQd1x = function (bnz3x) {
    if (bnz3x == null) {
        return null
    }
    var bPZ1x = [];
    for (var i = 0, bs1x = bnz3x.length; i < bs1x; i++) {
        bPZ1x[i] = cnq9h(bnz3x[i])
    }
    return bPZ1x
};
var bPY1x = function (KA3x, rR7K) {
    rR7K = cnH9y(rR7K);
    var bnJ3x = rR7K;
    var bnM3x = cnC9t(KA3x);
    var Oa4e = [];
    var cna9R = bnM3x.length;
    for (var i = 0; i < cna9R; i++) {
        var bnQ3x = bQd1x(bnM3x[i]);
        bnQ3x = bQd1x(bnQ3x);
        var bnR3x = bQB1x(bnQ3x, bnJ3x);
        var cmY9P = coH9y(bnR3x, coE9v(bnJ3x));
        bnR3x = bQB1x(cmY9P, rR7K);
        bmA2x(bnR3x, 0, Oa4e, i * KC3x, KC3x);
        bnJ3x = bnM3x[i]
    }
    var bPV1x = [];
    bmA2x(Oa4e, Oa4e.length - bQk1x, bPV1x, 0, bQk1x);
    var bs1x = cnX9O(bPV1x);
    if (bs1x > Oa4e.length) {
        throw new Error("1006")
    }
    var rI7B = [];
    bmA2x(Oa4e, 0, rI7B, 0, bs1x);
    return rI7B
};
var cmT9K = function (Yi7b, L1x) {
    if (Yi7b == null) {
        return null
    }
    var bPU1x = new String(Yi7b);
    if (bPU1x.length == 0) {
        return []
    }
    var KA3x = bQu1x(bPU1x);
    if (L1x == null || L1x == undefined) {
        throw new Error("1007")
    }
    var rR7K = bQs1x(L1x);
    return bPY1x(KA3x, rR7K)
};
cmN9E = function (Yi7b, L1x) {
    var bof3x = cmT9K(Yi7b, L1x);
    var Eu1x = new String(bQy1x(bof3x));
    var zx0x = [];
    var boj3x = Eu1x.length / 2;
    var bj1x = 0;
    for (var i = 0; i < boj3x; i++) {
        zx0x.push("%");
        zx0x.push(Eu1x.charAt(bj1x++));
        zx0x.push(Eu1x.charAt(bj1x++))
    }
    return zx0x.join("")
}
    ;
k1x.cqR0x = function (bok3x, L1x) {
    return k1x.cmK9B(k1x.czF2x(bok3x), L1x)
};

k1x.cmK9B = function (bok3x, L1x) {
    var bof3x = bPY1x(bok3x, bQs1x(L1x));
    var Eu1x = new String(bQy1x(bof3x));
    var zx0x = [];
    var boj3x = Eu1x.length / 2;
    var bj1x = 0;
    for (var i = 0; i < boj3x; i++) {
        zx0x.push("%");
        zx0x.push(Eu1x.charAt(bj1x++));
        zx0x.push(Eu1x.charAt(bj1x++))
    }
    return zx0x.join("")
}


var bUY4c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    , RV5a = {}
    , Ho2x = {};
for (var i = 0, l = bUY4c.length, c; i < l; i++) {
    c = bUY4c.charAt(i);
    RV5a[i] = c;
    Ho2x[c] = i
}

var bUX4b = function () {
    var sO7H = /\n|\r|=/g;
    return function (i1x) {
        var m1x = [];
        i1x = i1x.replace(sO7H, "");
        for (var i = 0, l = i1x.length; i < l; i += 4)
            m1x.push(Ho2x[i1x.charAt(i)] << 2 | Ho2x[i1x.charAt(i + 1)] >> 4, (Ho2x[i1x.charAt(i + 1)] & 15) << 4 | Ho2x[i1x.charAt(i + 2)] >> 2, (Ho2x[i1x.charAt(i + 2)] & 3) << 6 | Ho2x[i1x.charAt(i + 3)]);
        var bs1x = m1x.length
            , fu3x = i1x.length % 4;
        if (fu3x == 2)
            m1x = m1x.slice(0, bs1x - 2);
        if (fu3x == 3)
            m1x = m1x.slice(0, bs1x - 1);
        return m1x
    }
}();


czF2x = function (i1x) {
    var iJ4N = bUX4b(i1x), iI4M;
    var r1x = 0;
    while (iI4M = iJ4N[r1x]) {
        if (iI4M > 128) {
            iJ4N[r1x] = iI4M - 256
        }
        r1x++
    }
    return iJ4N
}

function decode(str, id, key) {
    return JSON.parse(decodeURIComponent(k1x.cmK9B(czF2x(str), 'param=' + id.slice(8, 12) + key)));
}

module.exports = decode;
