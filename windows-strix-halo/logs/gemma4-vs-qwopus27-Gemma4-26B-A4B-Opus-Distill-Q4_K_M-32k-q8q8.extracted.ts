import * as fs from 'fs';

function solve() {
    const input = fs.readFileSync(0);
    let offset = 0;

    function nextInt(): number | null {
        while (offset < input.length && input[offset] <= 32) offset++;
        if (offset >= input.length) return null;

        let neg = false;
        if (input[offset] === 45) {
            neg = true;
            offset++;
        }

        let res = 0;
        while (offset < input.length && input[offset] >= 48 && input[offset] <= 57) {
            res = res * 10 + (input[offset] - 48);
            offset++;
        }
        return neg ? -res : res;
    }

    const firstN = nextInt();
    const firstQ = nextInt();

    if (firstN === null || firstQ === null) return;

    const N = firstN;
    const Q = firstQ;

    const L = new Int32Array(N);
    const R = new Int32Array(N);

    for (let i = 0; i < N; i++) {
        const l = nextInt();
        const r = nextInt();
        if (l === null || r === null) break;
        L[i] = l;
        R[i] = r;
    }

    L.sort();
    R.sort();

    function lowerBound(arr: Int32Array, x: number): number {
        let low = 0, high = arr.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (arr[mid] < x) low = mid + 1;
            else high = mid;
        }
        return low;
    }

    function upperBound(arr: Int32Array, x: number): number {
        let low = 0, high = arr.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (arr[mid] <= x) low = mid + 1;
            else high = mid;
        }
        return low;
    }

    const answers: number[] = new Array(Q);
    for (let i = 0; i < Q; i++) {
        const x = nextInt();
        if (x === null) break;
        const countL = upperBound(L, x);
        const countR = lowerBound(R, x);
        answers[i] = countL - countR;
    }

    process.stdout.write(answers.join(' ') + '\n');
}

solve();
