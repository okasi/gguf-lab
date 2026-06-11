"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const input = (0, fs_1.readFileSync)(0, "utf8");
const lines = input.split('\n').filter(line => line.trim() !== '');
const [H, W] = lines[0].trim().split(' ').map(Number);
const grid = lines.slice(1).map(line => line.trim());
let start = null;
let end = null;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === 'S') {
            start = [r, c];
        }
        else if (grid[r][c] === 'T') {
            end = [r, c];
        }
    }
}
if (!start || !end) {
    console.log(-1);
    process.exit(0);
}
const INF = Infinity;
const dist = Array.from({ length: H }, () => Array(W).fill(INF));
dist[start[0]][start[1]] = 0;
const visited = Array.from({ length: H }, () => Array(W).fill(false));
// Priority queue: [cost, row, col]
const pq = [[0, start[0], start[1]]];
const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];
while (pq.length > 0) {
    // Extract min cost element
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
        if (pq[i][0] < pq[minIdx][0]) {
            minIdx = i;
        }
    }
    const [cost, r, c] = pq.splice(minIdx, 1)[0];
    if (visited[r][c])
        continue;
    visited[r][c] = true;
    if (r === end[0] && c === end[1]) {
        console.log(cost);
        process.exit(0);
    }
    for (let i = 0; i < 4; i++) {
        const nr = r + dr[i];
        const nc = c + dc[i];
        if (nr < 0 || nr >= H || nc < 0 || nc >= W)
            continue;
        if (visited[nr][nc])
            continue;
        const cell = grid[nr][nc];
        if (cell === '#')
            continue;
        let moveCost = 0;
        if (cell >= '0' && cell <= '9') {
            moveCost = parseInt(cell);
        }
        // S and T cost 0
        const newCost = cost + moveCost;
        if (newCost < dist[nr][nc]) {
            dist[nr][nc] = newCost;
            pq.push([newCost, nr, nc]);
        }
    }
}
console.log(-1);
