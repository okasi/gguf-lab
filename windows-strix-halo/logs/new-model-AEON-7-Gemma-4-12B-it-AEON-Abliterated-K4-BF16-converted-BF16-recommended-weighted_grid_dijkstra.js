"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\r?\n/);
    if (input.length === 0)
        return;
    const [H, W] = input[0].trim().split(/\s+/).map(Number);
    const grid = [];
    let start = null;
    let target = null;
    for (let i = 0; i < H; i++) {
        const row = input[i + 1].trim().split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S')
                start = [i, j];
            if (row[j] === 'T')
                target = [i, j];
        }
    }
    if (!start || !target) {
        console.log("-1");
        return;
    }
    // Dijkstra's algorithm
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const visited = Array.from({ length: H }, () => Array(W).fill(false));
    dist[start[0]][start[1]] = 0;
    // Simple Priority Queue implementation (Min-Heap)
    const pq = [{ r: start[0], c: start[1], cost: 0 }];
    while (pq.length > 0) {
        // Extract node with minimum cost
        let minIdx = 0;
        for (let i = 1; i < pq.length; i++) {
            if (pq[i].cost < pq[minIdx].cost)
                minIdx = i;
        }
        const { r, c, cost } = pq.splice(minIdx, 1)[0];
        if (visited[r][c])
            continue;
        visited[r][c] = true;
        if (r === target[0] && c === target[1]) {
            console.log(cost);
            return;
        }
        const dr = [-1, 1, 0, 0];
        const dc = [0, 0, -1, 1];
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                let moveCost = 0;
                const cell = grid[nr][nc];
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell, 10);
                }
                const newCost = cost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push({ r: nr, c: nc, cost: newCost });
                }
            }
        }
    }
    console.log("-1");
}
solve();
