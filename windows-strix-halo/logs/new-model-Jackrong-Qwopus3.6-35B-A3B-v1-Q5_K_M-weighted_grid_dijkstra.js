"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function solve() {
    const data = fs_1.default.readFileSync(0, "utf8");
    const lines = data.trim().split("\n");
    if (lines.length < 2)
        return;
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);
    const grid = [];
    let start = null;
    let target = null;
    for (let i = 0; i < H; i++) {
        grid.push(lines[i + 1].trim().split(""));
    }
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                start = [r, c];
            }
            else if (grid[r][c] === 'T') {
                target = [r, c];
            }
        }
    }
    if (!start || !target) {
        console.log(-1);
        return;
    }
    const INF = Infinity;
    const dist = Array.from({ length: H }, () => Array(W).fill(INF));
    dist[start[0]][start[1]] = 0;
    const pq = []; // [cost, row, col]
    pq.push([0, start[0], start[1]]);
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    while (pq.length > 0) {
        // Extract min from priority queue
        pq.sort((a, b) => a[0] - b[0]);
        const [cost, r, c] = pq.shift();
        if (cost > dist[r][c])
            continue;
        if (r === target[0] && c === target[1]) {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell === '#')
                    continue;
                let moveCost = 0;
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell, 10);
                }
                const newCost = cost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push([newCost, nr, nc]);
                }
            }
        }
    }
    console.log(-1);
}
solve();
