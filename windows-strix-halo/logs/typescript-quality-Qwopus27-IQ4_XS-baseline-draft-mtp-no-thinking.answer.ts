import * as fs from 'fs';

function upperBound(arr: number[], x: number): number {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = (left + right) >> 1;
        if (arr[mid] > x) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

function lowerBound(arr: number[], x: number): number {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = (left + right) >> 1;
        if (arr[mid] >= x) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\s+/);
let idx = 0;
const N = +input[idx++];
const Q = +input[idx++];

const L: number[] = new Array(N);
const R: number[] = new Array(N);

for (let i = 0; i < N; i++) {
    L[i] = +input[idx++];
    R[i] = +input[idx++];
}

const queries: number[] = new Array(Q);
for (let i = 0; i < Q; i++) {
    queries[i] = +input[idx++];
}

L.sort((a, b) => a - b);
R.sort((a, b) => a - b);

const results: string[] = new Array(Q);
for (let i = 0; i < Q; i++) {
    const q = queries[i];
    const countL = upperBound(L, q);
    const countR = lowerBound(R, q);
    results[i] = String(countL - countR);
}

console.log(results.join(' '));
