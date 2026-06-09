import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8');
const tokens = input.trim().split(/\s+/);
let idx = 0;
const N = parseInt(tokens[idx++], 10);
const Q = parseInt(tokens[idx++], 10);

const L: number[] = new Array(N);
const R: number[] = new Array(N);

for (let i = 0; i < N; i++) {
    L[i] = parseInt(tokens[idx++], 10);
    R[i] = parseInt(tokens[idx++], 10);
}

L.sort((a, b) => a - b);
R.sort((a, b) => a - b);

function upperBound(arr: number[], target: number): number {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] <= target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

function lowerBound(arr: number[], target: number): number {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

const answers: string[] = [];
for (let i = 0; i < Q; i++) {
    const x = parseInt(tokens[idx++], 10);
    const countL = upperBound(L, x);
    const countR = lowerBound(R, x);
    answers.push(String(countL - countR));
}

console.log(answers.join(' '));
