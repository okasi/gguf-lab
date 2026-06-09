import * as fs from 'fs';

const input = fs.readFileSync('/dev/stdin', 'utf8');
const tokens = input.trim().split(/\s+/);
let idx = 0;

const N = parseInt(tokens[idx++], 10);
const Q = parseInt(tokens[idx++], 10);

const starts: number[] = new Array(N);
const ends: number[] = new Array(N);

for (let i = 0; i < N; i++) {
    starts[i] = parseInt(tokens[idx++], 10);
    ends[i] = parseInt(tokens[idx++], 10);
}

starts.sort((a, b) => a - b);
ends.sort((a, b) => a - b);

const queries: [number, number][] = new Array(Q);
for (let i = 0; i < Q; i++) {
    queries[i] = [parseInt(tokens[idx++], 10), i];
}

function upperBound(arr: number[], val: number): number {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = (left + right) >> 1;
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
        const mid = (left + right) >> 1;
        if (arr[mid] < val) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}

const results: number[] = new Array(Q);

for (const [val, originalIdx] of queries) {
    const countL = upperBound(starts, val);
    const countR = lowerBound(ends, val);
    results[originalIdx] = countL - countR;
}

console.log(results.join(' '));
