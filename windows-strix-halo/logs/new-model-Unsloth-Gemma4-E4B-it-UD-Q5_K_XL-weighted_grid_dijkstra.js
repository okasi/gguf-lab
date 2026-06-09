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
// Minimal implementation of a Min-Heap for Dijkstra's
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    insert(state) {
        this.heap.push(state);
        this.bubbleUp(this.heap.length - 1);
    }
    extractMin() {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].cost < this.heap[parentIndex].cost) {
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
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex].cost < this.heap[smallest].cost) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex].cost < this.heap[smallest].cost) {
                smallest = rightChildIndex;
            }
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
/**
 * Determines the cost to enter a cell.
 * S and T cost 0. Digits cost their value. Walls are impassable.
 */
function getCellCost(char) {
    if (char === 'S' || char === 'T') {
        return 0;
    }
    if (char === '#') {
        return Infinity; // Effectively blocked
    }
    if (char >= '0' && char <= '9') {
        return parseInt(char);
    }
    return 0; // Should not happen based on problem description
}
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0)
        return -1;
    // 1. Parse Dimensions and Grid
    const [H, W] = input[0].split(' ').map(Number);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].split(''));
    }
    let startR = -1;
    let startC = -1;
    let targetR = -1;
    let targetC = -1;
    // 2. Find Start and Target
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
    // Check if S or T were found (safety check)
    if (startR === -1 || targetR === -1) {
        return -1;
    }
    // 3. Dijkstra Initialization
    const distances = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = new MinPriorityQueue();
    // Start cost is 0
    distances[startR][startC] = 0;
    pq.insert({ cost: 0, r: startR, c: startC });
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    // 4. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const current = pq.extractMin();
        const { cost: currentCost, r: r, c: c } = current;
        if (currentCost > distances[r][c]) {
            continue; // Stale entry
        }
        // Check if we reached the target
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
            const cellChar = grid[nr][nc];
            const entryCost = getCellCost(cellChar);
            if (entryCost === Infinity) {
                continue; // Wall
            }
            const newCost = currentCost + entryCost;
            // Relaxation step
            if (newCost < distances[nr][nc]) {
                distances[nr][nc] = newCost;
                pq.insert({ cost: newCost, r: nr, c: nc });
            }
        }
    }
    // 5. Target unreachable
    return -1;
}
console.log(solve());
;
