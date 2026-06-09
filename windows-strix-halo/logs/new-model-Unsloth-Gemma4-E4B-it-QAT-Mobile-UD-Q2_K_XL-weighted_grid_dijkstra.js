"use strict";
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8');
const lines = input.trim().split('\n');
class Node {
    constructor(row, col, cost) {
        this.row = row;
        this.col = col;
        this.cost = cost;
    }
}
function solve() {
    const lines = input.trim().split('\n');
    if (lines.length < 1)
        return;
    const [H, W] = lines[0].split(' ').map(Number);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        const rowLine = lines[i].split('');
        grid.push(rowLine.map(c => c === ' ' ? 0 : parseInt(c) || (c === 'S' ? 0 : (c === 'T' ? 0 : -1))));
    }
    const gridCost = [];
    for (let i = 0; i < H; i++) {
        const rowData = [];
        for (let j = 0; j < W; j++) {
            const char = lines[i + 1][j];
            let cost = 0;
            if (char === 'S')
                cost = 0;
            else if (char === 'T')
                cost = 0;
            else if (char === '#')
                cost = Infinity;
            else if (char >= '0' && char <= '9')
                cost = parseInt(char);
            else
                cost = -1; // Should not happen based on problem constraints but safe fallback
        }
        gridCost.push(rowData);
    }
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = [{ r: 0, c: 0, cost: 0 }]; // Start 'S' position
    const startRow = grid.findIndex(row => row.includes('S'));
    const startCol = grid.findIndex(row => row.includes('S'));
    // Logic to find S and T first
    let startRow = -1;
    let startCol = -1;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === 'S') {
                startRow = i;
                startCol = j;
                break;
            }
        }
    }
    let targetRow = -1;
    let targetCol = -1;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === 'T') {
                targetRow = i;
                targetCol = j;
                break;
            }
        }
    }
    let pq = [{ cost: 0, r: startRow, c: startCol, pathCost: 0 }];
    const minCosts = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    minCosts[startRow][startCol] = 0;
    // Simple Dijkstra
    while (pq.length > 0) {
        let current = pq.shift();
        let r = current.row;
        let c = current.col;
        let currentCost = current.cost;
        if (minCosts[r][c] <= currentCost)
            continue; // Skip if we found a better path
        // Check 4 directions
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of directions) {
            let nr = r + dr;
            let nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== ' ' && grid[nr][nc] !== '#') {
                let moveCost = (grid[nr][nc] === ' ' ? 0 : 0);
                let nextCost = currentCost + moveCost;
                if (minCosts[nr][nc] > nextCost) {
                    minCosts[nr][nc] = nextCost;
                    pq.push({ cost: nextCost, r: nr, c: nc });
                }
            }
        }
    }
    // ... logic continues here
}
console.log(-1);
`` `
;
