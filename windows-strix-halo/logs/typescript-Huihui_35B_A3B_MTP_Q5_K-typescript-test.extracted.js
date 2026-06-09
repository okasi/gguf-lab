"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const input = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, 'input.txt'), 'utf-8')
    .trim()
    .split('\n')
    .filter(line => line.trim().length > 0);
const [N, Q] = input[0].trim().split(/\s+/).map(Number);
const intervals = [];
for (let i = 1; i <= N; i++) {
    const parts = input[i].trim().split(/\s+/);
    intervals.push([Number(parts[0]), Number(parts[1])]);
}
const queries = input[N + 1].trim().split(/\s+/).map(Number);
const events = [];
for (const [l, r] of intervals) {
    events.push([l, 0, 1]);
    events.push([r, 2, -1]);
}
for (let i = 0; i < Q; i++) {
    events.push([queries[i], 1, 0]);
}
events.sort((a, b) => {
    if (a[0] !== b[0])
        return a[0] - b[0];
    return a[1] - b[1];
});
const ans = new Array(Q);
let current = 0;
let qi = 0;
for (const [coord, etype, val] of events) {
    if (etype === 1) {
        ans[qi++] = current;
    }
    else {
        current += val;
    }
}
process.stdout.write(ans.join(' '));
