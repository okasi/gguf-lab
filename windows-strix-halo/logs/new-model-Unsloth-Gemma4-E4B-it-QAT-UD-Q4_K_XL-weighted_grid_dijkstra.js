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
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0 || input[0].length === 0) {
        return;
    }
    const [H, W] = input[0].trim().split(/\s+/).map(Number);
    const grid = input.slice(1, H + 1).map(line => line.trim().split(''));
    let startRow = -1, startCol = -1;
    let targetRow = -1, targetCol = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startRow = r;
                startCol = c;
            }
            else if (grid[r][c] === 'T') {
                targetRow = r;
                targetCol = c;
            }
        }
    }
    if (startRow === -1 || targetRow === -1) {
        // Should not happen based on problem description, but good practice
        console.log(-1);
        return;
    }
    // Priority Queue: [cost, row, col]
    // We will implement a simple min-priority queue using an array sort for simplicity,
    // though a binary heap would be more efficient for large grids.
    let pq = [];
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    // Initial state
    dist[startRow][startCol] = 0;
    pq.push([0, startRow, startCol]);
    const dr = [-1, 1, 0, 0]; // Up, Down, Left, Right
    const dc = [0, 0, -1, 1];
    while (pq.length > 0) {
        // Simple extraction of min cost element (slow O(N) instead of O(log N))
        pq.sort((a, b) => a[0] - b[0]);
        const [cost, r, c] = pq.shift();
        if (cost > dist[r][c]) {
            continue;
        }
        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                let moveCost = 0;
                const cell = grid[nr][nc];
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell);
                }
                // 'S' and 'T' cost 0, which is the default if they are encountered here.
                const newCost = cost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push([newCost, nr, nc]);
                }
            }
        }
    }
    // If the loop finishes and target wasn't reached
    if (dist[targetRow][targetCol] === Infinity) {
        console.log(-1);
    }
    else {
        // This case should have been caught inside the loop, but as a fallback
        console.log(dist[targetRow][targetCol]);
    }
}
solve();
