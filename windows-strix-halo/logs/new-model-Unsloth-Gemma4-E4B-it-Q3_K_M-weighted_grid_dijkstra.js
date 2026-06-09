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
 * Priority Queue implementation (Min-Heap) for Dijkstra's algorithm.
 * Stores [cost, nodeIndex]
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    enqueue(cost, node) {
        this.heap.push([cost, node]);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
        if (this.heap.length === 0) {
            return undefined;
        }
        const min = this.heap[0];
        const last = this.heap.pop();
        if (last) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return min;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(index) {
        let current = index;
        while (current > 0) {
            const parentIndex = Math.floor((current - 1) / 2);
            if (this.heap[current][0] < this.heap[parentIndex][0]) {
                [this.heap[current], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[current]];
                current = parentIndex;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
        let current = index;
        const length = this.heap.length;
        while (true) {
            let left = 2 * current + 1;
            let right = 2 * current + 2;
            let smallest = current;
            if (left < length && this.heap[left][0] < this.heap[smallest][0]) {
                smallest = left;
            }
            if (right < length && this.heap[right][0] < this.heap[smallest][0]) {
                smallest = right;
            }
            if (smallest !== current) {
                [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
                current = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '') {
        return -1;
    }
    // Parse dimensions
    const dim = input[0].split(' ').map(Number);
    const H = dim[0];
    const W = dim[1];
    const grid = [];
    let start = null;
    let target = null;
    // Parse grid and find start/target
    for (let i = 0; i < H; i++) {
        const row = input[i + 1].split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S') {
                start = [i, j];
            }
            else if (row[j] === 'T') {
                target = [i, j];
            }
        }
    }
    if (!start || !target) {
        // Should not happen based on problem description, but good practice.
        return -1;
    }
    const INF = Infinity;
    const distances = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new PriorityQueue();
    // Initialization
    distances[start[0]][start[1]] = 0;
    // Priority Queue stores [cost, [row, col]]
    pq.enqueue(0, start);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    // Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const result = pq.dequeue();
        if (!result)
            continue;
        const [cost, [r, c]] = result;
        // If we reached the target
        if (r === target[0] && c === target[1]) {
            return cost;
        }
        // If we found a shorter path already, skip
        if (cost > distances[r][c]) {
            continue;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            // Check boundaries
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }
            const cell = grid[nr][nc];
            let movementCost = 0;
            if (cell === '#') {
                // Wall, cannot enter
                continue;
            }
            else if (cell === 'S' || cell === 'T') {
                // Start or Target cost is 0
                movementCost = 0;
            }
            else {
                // Digit cell cost
                const digit = parseInt(cell);
                movementCost = digit;
            }
            const newCost = cost + movementCost;
            // Relaxation step
            if (newCost < distances[nr][nc]) {
                distances[nr][nc] = newCost;
                pq.enqueue(newCost, [nr, nc]);
            }
        }
    }
    // If the target was never reached
    return -1;
}
console.log(solve());
