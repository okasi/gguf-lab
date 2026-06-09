import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf-8').trim().split(/\s+/);
const it = input[Symbol.iterator]();
const next = () => parseInt(it.next().value, 10);

const N = next();
const Q = next();

const L: number[] = new Array(N);
const R: number[] = new Array(N);

for (let i = 0; i < N; i++) {
    L[i] = next();
    R[i] = next();
}

L.sort((a, b) => a - b);
R.sort((a, b) => a - b);

const results: string[] = [];

for (let i = 0; i < Q; i++) {
    const x = next();

    // Find count of intervals where l <= x (upper bound for L)
    let lo = 0, hi = N;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (L[mid] <= x) lo = mid + 1;
        else hi = mid;
    }
    const countL = lo;

    // Find count of intervals where r < x (lower bound for R)
    lo = 0; hi = N;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (R[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    const countR = lo;

    results.push(String(countL - countR));
}

process.stdout.write(results.join(' ') + '\n');
