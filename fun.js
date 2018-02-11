let hotel = {
    a: [14, 15],
    b: [21, 22],
    c: [31, 32],
    d: [41, 42]
}

let keys = Object.keys(hotel);

let arr = [];
while (keys.length) {
    let key = keys.shift();
    let next = hotel[key];

    if (arr.length === 0) {
        arr = next;
        continue;
    }

    arr = arr.reduce((total, cur) => {
        if (!Array.isArray(cur)) {
            cur = [cur];
        }
        next.forEach(v => {
            total.push(cur.concat(v))
        });
        return total;
    }, []);
}
console.log(arr);


arr = [[1, 2], [3, 4]];

function traverse(arr, callback) {

    arrIdx = arr.map(() => 0);
    arrLen = arr.map(i => i.length - 1);
    while (!finish()) {
        callback(arrIdx);
        nextIdxs(arrIdx.length - 1);
    }
    function nextIdxs(iidx) {
        let cur = arrIdx[iidx];
        if (cur >= arrLen[iidx]) {
            arrIdx[iidx] = 0;
            nextIdxs(iidx - 1);
        } else {
            arrIdx[iidx] = cur + 1;
        }
    }

    function finish() {
        let rst = true;
        for (let i = 0; i < arrIdx.length; i++) {
            if (arrIdx[i] != arrLen[i]) {
                rst = false;
                break;
            }
        }
        return rst;
    }
}




