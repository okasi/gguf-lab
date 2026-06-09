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
// --- Priority Queue Implementation (MinHeap) ---
// Used to implement Dijkstra's algorithm efficiently.
// Stores [cost, r, c] tuples, prioritizing the smallest cost.
class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.size() === 0;
    }
    enqueue(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
        if (this.isEmpty())
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            // Compare based on cost (index 0)
            if (this.heap[index][0] < this.heap[parentIndex][0]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;
            // Find the smallest cost among parent, left, and right
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallest][0]) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex][0] < this.heap[smallest][0]) {
                smallest = rightChildIndex;
            }
            if (smallest !== index) {
                // Swap
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
// --- Main Solver Function ---
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0)
        return -1;
    // 1. Parse Dimensions
    const [H, W] = input[0].split(' ').map(Number);
    const grid = input.slice(1, H + 1);
    let startR = -1;
    let startC = -1;
    let targetR = -1;
    let targetC = -1;
    // 2. Locate S and T
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            }
            else if (grid[r][c] === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }
    if (startR === -1 || targetR === -1) {
        // Should not happen based on problem description, but good practice
        return -1;
    }
    // 3. Dijkstra Setup
    const INF = Infinity;
    // distances[r][c] stores the minimum cost to reach (r, c)
    const distances = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new PriorityQueue();
    // Initialize start node
    distances[startR][startC] = 0;
    // PQ stores [cost, r, c]
    pq.enqueue([0, startR, startC]);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    // 4. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        const [cost, r, c] = current;
        // If we found a shorter path previously, ignore this stale entry
        if (cost > distances[r][c]) {
            continue;
        }
        // Check if target reached
        if (r === targetR && c === targetC) {
            return cost;
        }
        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            // Check bounds
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }
            const cell = grid[nr][nc];
            // Check for walls
            if (cell === '#') {
                continue;
            }
            // Calculate cost of entering the new cell
            let entryCost = 0;
            if (cell >= '0' && cell <= '9') {
                entryCost = parseInt(cell);
            }
            // S and T cost 0, handled by initialization or general logic
            const newCost = cost + entryCost;
            // Relaxation step
            if (newCost < distances[nr][nc]) {
                distances[nr][nc] = newCost;
                pq.enqueue([newCost, nr, nc]);
            }
        }
    }
    // 5. Unreachable
    return -1;
}
// Execute and print result
console.log(solve());
