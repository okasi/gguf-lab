"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function solve() {
    const data = (0, fs_1.readFileSync)(0, "utf8").trim().split("\n");
    const [H, W] = data[0].split(" ").map(Number);
    const grid = [];
    let start = null;
    let target = null;
    for (let i = 0; i < H; i++) {
        grid.push(data[i].split(""));
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === "S") {
                start = [i, j];
            }
            else if (grid[i][j] === "T") {
                target = [i, j];
            }
        }
    }
    if (start === null || target === null) {
        console.log(-1);
        return;
    }
    const INF = Number.MAX_SAFE_INTEGER;
    const dist = Array.from({ length: H }, () => Array(W).fill(INF));
    const visited = Array.from({ length: H }, () => Array(W).fill(false));
    const dirs = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
    ];
    const pq = [];
    function pushPQ(entry) {
        pq.push(entry);
        pq.sort((a, b) => a[0] - b[0]);
    }
    function popPQ() {
        return pq.shift();
    }
    function peekPQ() {
        return pq[0];
    }
    function emptyPQ() {
        return pq.length === 0;
    }
    const [sr, sc] = start;
    dist[sr][sc] = 0;
    pushPQ([0, sr, sc]);
    while (!emptyPQ()) {
        const entry = popPQ();
        if (entry === undefined)
            break;
        const [cost, r, c] = entry;
        if (visited[r][c])
            continue;
        visited[r][c] = true;
        if (grid[r][c] === "T") {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            if (visited[nr][nc])
                continue;
            const cell = grid[nr][nc];
            if (cell === "#")
                continue;
            let moveCost = 0;
            if (cell >= "0" && cell <= "9") {
                moveCost = parseInt(cell, 10);
            }
            const newCost = cost + moveCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pushPQ([newCost, nr, nc]);
            }
        }
    }
    console.log(-1);
}
solve();
