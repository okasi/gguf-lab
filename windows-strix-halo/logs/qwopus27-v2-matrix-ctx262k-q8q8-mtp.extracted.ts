import * as fs from 'fs';

const input = fs.readFileSync(0, "utf8").trim();
const tokens = input.split(/\s+/);
let ptr = 0;

const N = parseInt(tokens[ptr++]);
const Q = parseInt(tokens[ptr++]);

const L: number[] = new Array(N);
const R: number[] = new Array(N);

for (let i = 0; i < N; i++) {
    L[i] = parseInt(tokens[ptr++]);
    R[i] = parseInt(tokens[ptr++]);
}

L.sort((a, b) => a - b);
R.sort((a, b) => a - b);

const upperBound = (arr: number[], x: number): number => {
    let low = 0, high = arr.length;
    while (low < high) {
        const mid = (low + high) >>> 1;
        if (arr[mid] <= x) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
};

const lowerBound = (arr: number[], x: number): number => {
    let low = 0, high = arr.length;
    while (low < high) {
        const mid = (low + high) >>> 1;
        if (arr[mid] < x) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
};

const results: number[] = new Array(Q);
for (let i = 0; i < Q; i++) {
    const x = parseInt(tokens[ptr++]);
    const countL = upperBound(L, x);
    const countR = lowerBound(R, x);
    results[i] = countL - countR;
}

console.log(results.join(" "));
