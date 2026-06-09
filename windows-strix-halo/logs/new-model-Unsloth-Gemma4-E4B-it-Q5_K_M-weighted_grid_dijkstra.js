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
 * MinPriorityQueue implementation for Dijkstra's algorithm.
 * Stores [cost, row, col] tuples, prioritized by cost.
 */
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }
    parent(i) { return Math.floor((i - 1) / 2); }
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    enqueue(item) {
        this.heap.push(item);
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
        let current = index;
        while (current > 0) {
            const parentIndex = this.parent(current);
            // Compare costs (index 0)
            if (this.heap[current][0] < this.heap[parentIndex][0]) {
                this.swap(current, parentIndex);
                current = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        let current = index;
        const length = this.heap.length;
        while (true) {
            let leftChild = this.left(current);
            let rightChild = this.right(current);
            let smallest = current;
            // Compare costs
            if (leftChild < length && this.heap[leftChild][0] < this.heap[smallest][0]) {
                smallest = leftChild;
            }
            if (rightChild < length && this.heap[rightChild][0] < this.heap[smallest][0]) {
                smallest = rightChild;
            }
            if (smallest !== current) {
                this.swap(current, smallest);
                current = smallest;
            }
            else {
                break;
            }
        }
    }
}
/**
 * Solves the minimum cost path problem using Dijkstra's algorithm.
 */
function solve() {
    // Read all input from stdin (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === '')
        return -1;
    // 1. Parse dimensions
    const [H, W] = input[0].split(' ').map(Number);
    const grid = input.slice(1, H + 1).map(line => line.split(''));
    let start = null;
    let target = null;
    // 2. Find Start and Target positions
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
        // Should not happen based on problem description, but good practice.
        return -1;
    }
    // 3. Initialize Dijkstra structures
    const INF = Infinity;
    // dist[r][c] stores the minimum cost to reach (r, c)
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new MinPriorityQueue();
    const [startR, startC] = start;
    // Start cost is 0
    dist[startR][startC] = 0;
    // PQ entry: [cost, r, c]
    pq.enqueue([0, startR, startC]);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    // 4. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        const [currentCost, r, c] = current;
        if (currentCost > dist[r][c]) {
            continue; // Stale entry
        }
        // Check if we reached the target
        if (grid[r][c] === 'T') {
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
            // Check walls
            if (grid[nr][nc] === '#') {
                continue;
            }
            // Calculate cost to enter the neighbor cell (nr, nc)
            let moveCost = 0;
            const char = grid[nr][nc];
            if (char >= '0' && char <= '9') {
                moveCost = parseInt(char);
            }
            // If char is 'S' or 'T', moveCost remains 0
            const newCost = currentCost + moveCost;
            // Relaxation step
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.enqueue([newCost, nr, nc]);
            }
        }
    }
    // If the PQ empties and we haven't returned, the target is unreachable
    return -1;
}
console.log(solve());
