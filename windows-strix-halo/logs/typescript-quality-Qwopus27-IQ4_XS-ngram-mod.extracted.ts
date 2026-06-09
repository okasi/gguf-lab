import * as fs from 'fs';

function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\s+/);
    let idx = 0;
    const N = parseInt(input[idx++], 10);
    const Q = parseInt(input[idx++], 10);

    const lefts: number[] = new Array(N);
    const rights: number[] = new Array(N);

    for (let i = 0; i < N; i++) {
        lefts[i] = parseInt(input[idx++], 10);
        rights[i] = parseInt(input[idx++], 10);
    }

    lefts.sort((a, b) => a - b);
    rights.sort((a, b) => a - b);

    const answers: string[] = new Array(Q);

    for (let i = 0; i < Q; i++) {
        const q = parseInt(input[idx++], 10);
        const l = upperBound(lefts, q);
        const r = lowerBound(rights, q);
        answers[i] = String(l - r);
    }

    process.stdout.write(answers.join(' ') + '\n');
}

function upperBound(arr: number[], target: number): number {
    let l = 0, r = arr.length;
    while (l < r) {
        const mid = (l + r) >>> 1;
        if (arr[mid] <= target) {
            l = mid + 1;
        } else {
            r = mid;
        }
    }
    return l;
}

function lowerBound(arr: number[], target: number): number {
    let l = 0, r = arr.length;
    while (l < r) {
        const mid = (l + r) >>> 1;
        if (arr[mid] < target) {
            l = mid + 1;
        } else {
            r = mid;
        }
    }
    return l;
}

main();
