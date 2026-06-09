import * as fs from 'fs';

const data = fs.readFileSync(0, 'utf8').trim().split(/\s+/);
let idx = 0;
const N = parseInt(data[idx++], 10);
const Q = parseInt(data[idx++], 10);

const lArr = new Array(N);
const rArr = new Array(N);

for (let i = 0; i < N; i++) {
    lArr[i] = parseInt(data[idx++], 10);
    rArr[i] = parseInt(data[idx++], 10);
}

const queries = new Array(Q);
for (let i = 0; i < Q; i++) {
    queries[i] = parseInt(data[idx++], 10);
}

lArr.sort((a, b) => a - b);
rArr.sort((a, b) => a - b);

function upperBound(arr: number[], x: number): number {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid] <= x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

function lowerBound(arr: number[], x: number): number {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

const results: string[] = [];
for (let i = 0; i < Q; i++) {
    const x = queries[i];
    const cnt = upperBound(lArr, x) - lowerBound(rArr, x);
    results.push(cnt.toString());
}

process.stdout.write(results.join(' '));
