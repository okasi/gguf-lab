"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function solve() {
    const input = (0, fs_1.readFileSync)(0, "utf8").trim();
    const lines = input.split('\n');
    const firstLine = lines[0].split(' ').map(Number);
    const H = firstLine[0];
    const W = firstLine[1];
    const grid = [];
    let startR = -1;
    let startC = -1;
    let endR = -1;
    let endC = -1;
    for (let r = 0; r < H; r++) {
        grid[r] = lines[r + 1].split('');
        for (let c = 0; c < W; c++) {
            const cell = grid[r][c];
            if (cell === 'S') {
                startR = r;
                startC = c;
            }
            else if (cell === 'T') {
                endR = r;
                endC = c;
            }
        }
    }
    const dist = Array(H).fill(null).map(() => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    // Priority queue: [cost, r, c]
    // Using a simple array as a priority queue (min-heap simulation or just sorting)
    // For large grids, a proper min-heap is better, but for typical competitive programming constraints,
    // an array-based approach with sorting or unshift/unshift can work if N is small.
    // However, to be safe and efficient, let's implement a simple min-heap or use Array.sort.
    // Given the constraints are not specified, let's use Array.sort for simplicity as it's O(N log N) per extract.
    const pq = [[0, startR, startC]];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (pq.length > 0) {
        // Extract min
        pq.sort((a, b) => a[0] - b[0]);
        const [cost, r, c] = pq.shift();
        if (cost > dist[r][c])
            continue;
        if (r === endR && c === endC) {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell === '#')
                    continue;
                let newCost = cost;
                if (cell !== 'S' && cell !== 'T') {
                    newCost += parseInt(cell, 10);
                }
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
