function ab(a, b) {
    let c = 1;
    for (let i = 0; i < b; i++) {
        c *= a;
    }
}

function an(a, n) {
    if (n == 0) return 1;
    return a * an(a, n - 1)
}

function am(a, m) {
    if (m == 0) return 1;
    if (m == 1) return a;

    let tmp = am(a, Math.floor(m / 2));
    return tmp * tmp * am(a, m - 2 * Math.floor(m / 2));
}

function pow(a, b) {
    if (b == 0) return 1;
    if (b == 1) return a;

    let r = a; let aa = a;
    while (b > 1) {
        if (b % 2) {
            r *= aa

        }
        a *= a;
        b = Math.floor(b / 2);

    }

    return a * r;
}
console.log(2, 10, pow(2, 10))
console.log(2, 5, pow(2, 5))
console.log(1, 3, pow(1, 3))
console.log(3, 3, pow(3, 3))
//console.log(parseInt('10', 2))
//console.log((12).toString(2))