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
const priority_queue_1 = require("@datastructures-js/priority-queue");
/**
 * Finds the minimum cost path from 'S' to 'T' in a grid with variable movement costs.
 * Uses Dijkstra's algorithm.
 */
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0)
        return;
    const [hStr, wStr] = input[0].trim().split(/\s+/);
    const H = parseInt(hStr);
    const W = parseInt(wStr);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(''));
    }
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
        console.log(-1);
        return;
    }
    // Distances initialized to infinity
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    // Priority Queue stores [cost, row, col]
    // We use a min-heap based on cost.
    const pq = new priority_queue_1.PriorityQueue((a, b) => a[0] - b[0]);
    // Initialize start node
    dist[startRow][startCol] = 0;
    pq.enqueue([0, startRow, startCol]);
    const dr = [-1, 1, 0, 0]; // Up, Down
    const dc = [0, 0, -1, 1]; // Left, Right
    while (!pq.isEmpty()) {
        const [cost, r, c] = pq.dequeue();
        if (cost > dist[r][c]) {
            continue;
        }
        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }
        // Explore neighbors
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            // Check boundaries
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                // Check for walls
                if (cell === '#') {
                    continue;
                }
                let moveCost = 0;
                // Calculate cost to enter the new cell (nr, nc)
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell);
                }
                else if (cell === 'S' || cell === 'T') {
                    // Entering S or T costs 0, as per problem description.
                    // Note: Start cost is handled by initialization.
                    moveCost = 0;
                }
                const newDist = dist[r][c] + moveCost;
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.enqueue([newDist, nr, nc]);
                }
            }
        }
    }
    // If the loop finishes and target hasn't been reached
    console.log(-1);
}
solve();
