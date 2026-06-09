import { readFileSync } from 'fs';

const data = readFileSync('/dev/stdin', 'utf8').trim().split(/\s+/);
const it = data[Symbol.iterator]();

const next = () => parseInt(it.next().value, 10);

const N = next();
const Q = next();

const L = new Array(N);
const R = new Array(N);

for (let i = 0; i < N; i++) {
    L[i] = next();
    R[i] = next();
}

L.sort((a, b) => a - b);
R.sort((a, b) => a - b);

const queries = new Array(Q);
for (let i = 0; i < Q; i++) {
    queries[i] = next();
}

const answers: number[] = new Array(Q);

for (let i = 0; i < Q; i++) {
    const x = queries[i];
    const started = upperBound(L, x);
    const ended = lowerBound(R, x);
    answers[i] = started - ended;
}

console.log(answers.join(' '));

function upperBound(arr: number[], val: number): number {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = (left + right) >>> 1;
        if (arr[mid] <= val) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}

function lowerBound(arr: number[], val: number): number {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = (left + right) >>> 1;
