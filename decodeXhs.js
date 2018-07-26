navigator = {
    plugins: [
        {
            name: "Chrome PDF Plugin"
        },
        {
            name: "Chrome PDF Viewer"
        },
        {
            name: "Native Client"
        },
        {
            name: "Shockwave Flash"
        }
    ],
        mimeTypes: [
            {
                description: "FutureSplash Player"
            },
            {
                description: ""
            }, {
                description: "Portable Document Format"
            }, {
                description: "Native Client Executable"
            }, {
                description: "Portable Native Client Executable"
            }, {
                description: "Shockwave Flash"
            }
        ]
}

var  b = window = {
    screen: {
        availHeight: 1058,
        availLeft
            :
            1280,
        availTop
            :
            22,
        availWidth
            :
            1872,
        colorDepth
            :
            24,
        height
            :
            1080,
        width
            :
            1920
    },
    navigator: navigator
}


var Q = function (str) {
    return new Buffer(str, 'binary').toString('base64');
}


var x = (new Date).getTime(), m = "", k = "", u = "", t = "";

if (b.__abbaidu_20180315_zidgetf)
    try {
        m = b.__abbaidu_20180315_zidgetf() || ""
    } catch (q) {

    }
if (b.__abbaidu_20180315_bidgetf)
    try {
        k = b.__abbaidu_20180315_bidgetf() || ""
    } catch (q) {

    }
if (b.__abbaidu_20180315_subidgetf)
    try {
        u = b.__abbaidu_20180315_subidgetf() || ""
    } catch (q) {

    }
if (b.__abbaidu_20180315_extra_datagetf)
    try {
        t = b.__abbaidu_20180315_extra_datagetf() || ""
    } catch (q) {

    }

var v = Y() + "",
    ba = aa(!0, "antifraud", !1),
    ca = (b.screen.colorDepth || "") + "",
    l = b.screen.width + "x" + b.screen.height,
    N = b.screen.availWidth + "x" + b.screen.availHeight,
    z = [b.screen.deviceXDPI || "", b.screen.G || ""].join(),
    A = da(),
    fa = ea();
try {
    var O = !!b.localStorage + 0
}
catch (q) {
    O = 1
}
O += "";
try {
    var P = true + 0
} catch (q) {
    P = 1
}
P += "";

var ha = (b.navigator.cookieEnabled || "") + "",
    ia = (new Date).getTimezoneOffset() + "",
    ja = b.navigator.language || "",
    ka = b.navigator.M || "", ma = la(),
    na = (b.devicePixelRatio || "") + "",
    oa = (b.navigator.H || "") + "",
    qa = pa() + "",
    ra = b.navigator.i || b.navigator.L || undefined || "",
    ta = sa(), va = ua();
try {
    var Z = !!b.indexedDB + 0
} catch (q) {
    Z = 1
}


z = !1;

var r = {
    1: v, 3: ba, 4: ca, 5: l, 6: N, 7: z, 8: A, 9: fa, 11: O, 12: P, 13: ha, 14: ia, 15: ja,
    16: ka, 17: ma, 18: na, 19: oa, 20: qa, 21: ra, 22: ta, 23: va, 24: Z + "",
    27: b.navigator.userAgent || "",
    28: [false, false].join(),
    29: [true, true, true].join(),
    32: "0",
    34: b.navigator.platform || "",
    35: [!!(b.navigator.D || b.navigator.J || b.navigator.N), !!b.navigator.getBattery].join(),
    101: "",
    103: (new Date).getTime() + "",
    104: "", 106: "",
    107: "12", 108: '',
    109: '',
    110: "",
    112: m,
    113: k,
    114: u,
    115: t,
    200: "1"
};

o = function () {
    g(); M = "2005"; L = ""; r["106"] = "2005"; r["104"] = ""; r["101"] = w; try {

        r["110"] = b.localStorage.getItem("abbaidu_ls_key&^%") || ""
    } catch (q) {


    }

    if (b.navigator.getBattery)
        try {
            b.navigator.getBattery().then(function (a) {
                try { U = "" + a.charging, V = "" + a.chargingTime, W = "" + a.dischargingTime, X = "" + a.level } catch (ya) {

                }
            })
        } catch (q) {

        }
    c();
    xa(function (a) {
        a && (T = a, B = (new Date).getTime(), h(!1))
    });


    e.addEventListener("click", d, !0); setTimeout(function () { h(!0) }, 2E3)
}

r["32"] = "" + ((new Date).getTime() - x);

function v() {

    "interactive" !== e.readyState && "complete" !== e.readyState || z || (z = !0, (new A).o())

}

function xa(a) {
    try {
        (new Promise(function (g) {
            try {
                var d = function (a) {
                    if (a = e.exec(a))
                        a = a[1], "0.0.0.0" !== a && (void 0 === c[a] && h.push(a), c[a] = !0)
                }, p = b.RTCPeerConnection || b.K || b.webkitRTCPeerConnection;
                if (p) {
                    var h = [], c = {},
                        f = new p({
                            iceServers: [{
                                urls: "stun:stun.services.mozilla.com"
                            }]
                        },
                            {
                                optional: [{
                                    RtpDataChannels: !0
                                }]
                            }),
                        e = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
                    f.onicecandidate = function (a) {
                        a.candidate && d(a.candidate.candidate)
                    };
                    f.createDataChannel("");
                    f.createOffer(function (a) {
                        f.setLocalDescription(a, function () {

                        }, function () {

                        })
                    }, function () {

                    });
                    var k = 0, u = setInterval(function () {
                        try {
                            if (f.localDescription.sdp.split("\n").forEach(function (a) {
                                0 !== a.indexOf("a=candidate:") && 0 !== a.indexOf("c=IN") || d(a)
                            }), 0 < h.length || 2 < ++k)
                                g(h.join(",")), clearInterval(u)
                        } catch (t) {
                            g(h.join(",")), clearInterval(u)
                        }
                    }, 1E3)
                } else g("")
            } catch (t) {
                a("")
            }
        })).then(function (g) {
            a(g)
        })
    } catch (g) {
        a(null)
    }
}

function ua() {

    var a = 0, g = 0; "undefined" !== typeof navigator.maxTouchPoints ? a = navigator.maxTouchPoints 
    : 
    "undefined" !== typeof navigator.msMaxTouchPoints && (a = navigator.msMaxTouchPoints); try { e.createEvent("TouchEvent"), g = 1 } catch (d) { } return [a, g, !!("ontouchstart" in b) + 0].join()


}

function sa() {
    var a = b.navigator; return [a.product, a.productSub, a.vendor, a.vendorSub, a.appCodeName, a.appName, a.platform, eval.toString().length, a.F || ""].join()

}

function Y() {

    return 1;
}

function aa(a, g, d) {

    var b = [];
    var f = {
        l: 0,
        C: "",
        b: 8,
        f: function (a) {
            return f.g(f.h(f.w(a), a.length * f.b))
        },
        h: function (a, b) {
            a[b >> 5] |= 128 << 24 - b % 32; a[15 + (b + 64 >> 9 << 4)] = b; for (var d = Array(80), g = 1732584193, h = -271733879, c = -1732584194, e = 271733878, m = -1009589776, k = 0; k < a.length; k += 16) {
                for (var u = g, t = h, v = c, z = e, A = m, l = 0; 80 > l; l++) {
                    d[l] = 16 > l ? a[k + l] : f.c(d[l - 3] ^ d[l - 8] ^ d[l - 14] ^ d[l - 16], 1); var N = f.a(f.a(f.c(g, 5), f.u(l, h, c, e)), f.a(f.a(m,
                        d[l]), f.v(l))); m = e; e = c; c = f.c(h, 30); h = g; g = N
                } g = f.a(g, u); h = f.a(h, t); c = f.a(c, v); e = f.a(e, z); m = f.a(m, A)
            } return [g, h, c, e, m]
        },
        u: function (a, b, d, f) {
            return 20 > a ? b & d | ~b & f : 40 > a ? b ^ d ^ f : 60 > a ? b & d | b & f | d & f : b ^ d ^ f
        }, v: function (a) { return 20 > a ? 1518500249 : 40 > a ? 1859775393 : 60 > a ? -1894007588 : -899497514 }, a: function (a, b) { var d = (65535 & a) + (65535 & b); return (a >> 16) + (b >> 16) + (d >> 16) << 16 | 65535 & d }, c: function (a, b) { return a << b | a >>> 32 - b }, w: function (a) {
            for (var b = [], d = (1 << f.b) - 1, e = 0; e < a.length * f.b; e += f.b)b[e >> 5] |= (a.charCodeAt(e / f.b) & d) << 24 -
                e % 32; return b
        },
        g: function (a) {
            for (var b = f.l ? "0123456789ABCDEF" : "0123456789abcdef", d = "", e = 0; e < 4 * a.length; e++)d += b.charAt(a[e >> 2] >> 8 * (3 - e % 4) + 4 & 15) + b.charAt(a[e >> 2] >> 8 * (3 - e % 4) & 15); return d
        }
    }

    b.push("canvas winding:yes");


    b.push("canvas fp:" + 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB9AAAADICAYAAACwGnoBAAAcuElEQVR4Xu3bwQ0AMAjEMNh/6VJlDTOCld+JHUeAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAjMMiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgTGgC4CAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECDwBXyg64AAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgAFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAIAEf6EogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIGdA0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEEfKArgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNA1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEEvCBrgQCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIGBA1wABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEEjAB7oSCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAAV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAR/oSiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQR8oCuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0DVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQS8IGuBAIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEDXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQSMAHuhIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIABXQMECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCABH+hKIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBBHygK4EAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgAFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAIAEf6EogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIGdA0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEEfKArgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNA1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEEvCBrgQCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIGBA1wABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEEjAB7oSCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAAV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAR/oSiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQR8oCuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0DVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQS8IGuBAIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEDXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQSMAHuhIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIABXQMECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCABH+hKIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBBHygK4EAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgAFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAIAEf6EogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIGdA0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEEfKArgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNA1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEEvCBrgQCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIGBA1wABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEEjAB7oSCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAAV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAR/oSiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQR8oCuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0DVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQS8IGuBAIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEDXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQSMAHuhIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIABXQMECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCABH+hKIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBBHygK4EAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgAFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAIAEf6EogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIGdA0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEEfKArgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNA1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEEvCBrgQCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIGBA1wABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEEjAB7oSCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAAV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAR/oSiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQR8oCuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0DVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQS8IGuBAIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEDXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQSMAHuhIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIABXQMECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCABH+hKIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBBHygK4EAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgAFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAIAEf6EogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIGdA0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEEfKArgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNA1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEEvCBrgQCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIGBA1wABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEEjAB7oSCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAAV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAR/oSiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQR8oCuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0DVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQS8IGuBAIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEDXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQSMAHuhIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIABXQMECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCABH+hKIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBBHygK4EAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgAFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAIAEf6EogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIGdA0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEEfKArgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNA1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEEvCBrgQCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIGBA1wABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEEjAB7oSCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAAV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAR/oSiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQR8oCuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0DVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQS8IGuBAIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEDXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQSMAHuhIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIABXQMECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCABH+hKIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBBHygK4EAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgAFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAIAEf6EogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIGdA0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEEfKArgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNA1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEEvCBrgQCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIGBA1wABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEEjAB7oSCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAAV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAR/oSiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQR8oCuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0DVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQS8IGuBAIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEDXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQSMAHuhIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIABXQMECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCABH+hKIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBBHygK4EAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAgAFdAwQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAIAEf6EogQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIGdA0QIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIEEfKArgQABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIGNA1QIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEEvCBrgQCBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIGBA1wABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIEEjAB7oSCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICAAV0DBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEAgAR/oSiBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgZ0DRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgQR8oCuBAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgY0DVAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQS8IGuBAIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgYEDXAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQSMAHuhIIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIABXQMECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQCABH+hKIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBnQNECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBBHygK4EAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBjQNUCAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBBLwga4EAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBgQNcAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBBIwAe6EggQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAwAk8534AyTlM9nwAAAAASUVORK5CYII=');

    return f.f(b.join("~"))
}
function da() {
    for (var a = "", g = b.navigator.plugins, d = 0; d < g.length; d++)

        a = d === g.length - 1 ? a + encodeURIComponent(g[d].name) : a + (encodeURIComponent(g[d].name) + ",");

    return a
} function ea() {
    for (var a = "", g = b.navigator.mimeTypes, d = 0; d < g.length; d++)a =
        d === g.length - 1 ? a + encodeURIComponent(g[d].description) : a + (encodeURIComponent(g[d].description) + ","); return a
}
function la() {


    return '1,1,1,1,1,0';
}
function pa() {
    
    
    
    return 0
}


function wa() {
    this.encode = function (a) {

        var b = "", d, p = 0;

        a = a.replace(/\r\n/g, "\n");

        var h = ""; for (d = 0; d < a.length; d++) {

            var c = a.charCodeAt(d);

            128 > c ? h += String.fromCharCode(c) : (127 < c && 2048 > c ? h += String.fromCharCode(c >> 6 | 192) : (h += String.fromCharCode(c >>
                12 | 224), h += String.fromCharCode(c >> 6 & 63 | 128)), h += String.fromCharCode(c & 63 | 128))
        }

        for (a = h; p < a.length;) {
            var f = a.charCodeAt(p++); h = a.charCodeAt(p++);
            d = a.charCodeAt(p++); c = f >> 2; f = (f & 3) << 4 | h >> 4; var e = (h & 15) << 2 | d >> 6; var k = d & 63; isNaN(h) ? e = k = 64 : isNaN(d) && (k = 64);
            b = b + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(c) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(f) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(e) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(k)
        }
        return b
    }
}



console.log(Q(JSON.stringify(r)));