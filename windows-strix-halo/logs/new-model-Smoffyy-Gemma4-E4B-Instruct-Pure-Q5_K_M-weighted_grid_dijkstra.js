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
/**
 * Simple Priority Queue implementation (Min-Heap based on cost).
 * Stores [cost, r, c] tuples.
 */
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    /**
     * Inserts an item and maintains the heap property.
     * The comparison is based on the cost (index 0).
     */
    enqueue(cost, r, c) {
        this.items.push([cost, r, c]);
        // Simple bubble up (inefficient for massive queues, but fine for typical Dijkstra use cases)
        this.items.sort((a, b) => a[0] - b[0]);
    }
    /**
     * Removes and returns the item with the minimum cost.
     */
    dequeue() {
        return this.items.shift();
    }
    isEmpty() {
        return this.items.length === 0;
    }
}
/**
 * Parses a character into its associated numerical cost.
 * S and T have a cost of 0. Digits 0-9 have their face value.
 */
function getCost(char) {
    if (char === 'S' || char === 'T') {
        return 0;
    }
    const digit = parseInt(char, 10);
    return isNaN(digit) ? Infinity : digit;
}
/**
 * Finds the minimum cost path using Dijkstra's algorithm.
 * @param H Grid height
 * @param W Grid width
 * @param grid The grid map
 * @param startR Start row
 * @param startC Start column
 * @param targetR Target row
 * @param targetC Target column
 * @returns Minimum cost or -1 if unreachable
 */
function solveDijkstra(H, W, grid, startR, startC, targetR, targetC) {
    // Initialize distance array (dist[r][c] stores min cost to reach (r, c))
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = new PriorityQueue();
    // Start initialization
    dist[startR][startC] = 0;
    pq.enqueue(0, startR, startC);
    // Directions: [dr, dc]
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (!pq.isEmpty()) {
        const item = pq.dequeue();
        if (!item)
            continue;
        const [currentCost, r, c] = item;
        // If we found a shorter path already, skip this stale entry
        if (currentCost > dist[r][c]) {
            continue;
        }
        // Check if target reached
        if (r === targetR && c === targetC) {
            return currentCost;
        }
        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            // Check bounds
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }
            const nextCell = grid[nr][nc];
            // Check for wall
            if (nextCell === '#') {
                continue;
            }
            // Determine the cost to *enter* the neighbor cell (nr, nc)
            // Note: S and T entry cost is 0. Digits cost their value.
            const moveCost = getCost(nextCell);
            // If the cost is Infinity (should only happen if parsing failed, but good check)
            if (moveCost === Infinity) {
                continue;
            }
            const newCost = currentCost + moveCost;
            // Relaxation step
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.enqueue(newCost, nr, nc);
            }
        }
    }
    // Target unreachable
    return -1;
}
function main() {
    try {
        // Read all input from stdin
        const input = fs.readFileSync(0, "utf8").trim().split('\n');
        if (input.length === 0) {
            console.log(-1);
            return;
        }
        // First line: H W
        const [H_str, W_str] = input[0].trim().split(/\s+/);
        const H = parseInt(H_str);
        const W = parseInt(W_str);
        if (isNaN(H) || isNaN(W) || H <= 0 || W <= 0) {
            console.log(-1);
            return;
        }
        // Grid input (starts from the second line)
        const grid = input.slice(1, H + 1).map(line => line.trim());
        let startR = -1;
        let startC = -1;
        let targetR = -1;
        let targetC = -1;
        // Find S and T coordinates
        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                const char = grid[r][c];
                if (char === 'S') {
                    startR = r;
                    startC = c;
                }
                else if (char === 'T') {
                    targetR = r;
                    targetC = c;
                }
            }
        }
        if (startR === -1 || targetR === -1) {
            // S or T not found
            console.log(-1);
            return;
        }
        const minCost = solveDijkstra(H, W, grid, startR, startC, targetR, targetC);
        console.log(minCost);
    }
    catch (e) {
        // Handle potential file reading errors or parsing issues gracefully
        // console.error("Error processing input:", e);
        console.log(-1);
    }
}
main();
