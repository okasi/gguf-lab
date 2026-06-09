import * as fs from "fs";

function upperBound(arr: number[], x: number): number {
    let l = 0, r = arr.length;
    while (l < r) {
        let mid = (l + r) >> 1;
        if (arr[mid] <= x) l = mid + 1;
        else r = mid;
    }
    return l;
}

function lowerBound(arr: number[], x: number): number {
    let l = 0, r = arr.length;
    while (l < r) {
        let mid = (l + r) >> 1;
        if (arr[mid] < x) l = mid + 1;
        else r = mid;
    }
    return l;
}

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const tokens = input.split(/\s+/).map(Number);
    let idx = 0;
    
    const N = tokens[idx++];
    const Q = tokens[idx++];
    
    const L: number[] = new Array(N);
    const R: number[] = new Array(N);
    
    for (let i = 0; i < N; i++) {
        L[i] = tokens[idx++];
        R[i] = tokens[idx++];
    }
    
    L.sort((a, b) => a - b);
    R.sort((a, b) => a - b);
    
    const results: number[] = new Array(Q);
    for (let i = 0; i < Q; i++) {
        const x = tokens[idx++];
        results[i] = upperBound(L, x) - lowerBound(R, x);
    }
    
    console.log(results.join(" "));
}

main();
