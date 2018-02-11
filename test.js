let arr = [[1, 2, 3], [4, 5], [6, 7]];

traverse(arr, callback);

function callback(idx) {
    console.log(idx)
}


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