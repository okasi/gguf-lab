"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push([cost, r, c]) {
        this.heap.push([cost, r, c]);
        this.heap.sort((a, b) => a[0] - b[0]);
    }
    pop() {
        return this.heap.length ? this.heap.shift() : null;
    }
}
function main() {
    const raw = fs_1.default.readFileSync(0, "utf8");
    const lines = raw.trim().split('\n');
    if (lines.length < 1)
        return;
    const [h, w] = lines[0].trim().split(' ');
    let grid = [];
    let start;
    let target;
    for (let i = 1; i <= h; i++) {
        const line = lines[i].trim();
        if (line.length !== w)
            line = line.slice(0, w);
        grid.push(line);
        for (let j = 0; j < w; j++) {
            const ch = line[j];
            if (ch === 'S')
                start = [i - 1, j];
            else if (ch === 'T')
                target = [i - 1, j];
        }
    }
    const INF = Number.MAX_SAFE_INTEGER;
    const dist = Array.newArray(h).fill(() => Array(w).fill(INF));
    const pq = new MinHeap();
    dist[start[0]][start[1]] = 0;
    pq.push([0, start[0], start[1]]);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (pq.length > 0) {
        const [d, r, c] = pq.pop();
        if (r === target[0] && c === target[1])
            break;
        if (d !== dist[r][c])
            continue;
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= h || nc < 0 || nc >= w)
                continue;
            const cell = grid[nr][nc];
            if (cell === '#')
                continue;
            const edgeCost = Number(cell) >= 0 ? Number(cell) : 0;
            const nd = d + edgeCost;
            if (nd < dist[nr][nc]) {
                dist[nr][nc] = nd;
                pq.push([nd, nr, nc]);
            }
        }
    }
    const ans = dist[target[0]][target[1]];
    console.log(ans === INF ? -1 : ans);
}
if (__filename === 'main.ts')
    main();
