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
 * Priority Queue implementation (Min-Heap)
 * Stores [cost, row, col] tuples, ordered by cost.
 */
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    /**
     * Inserts an item into the heap.
     * @param item [cost, row, col]
     */
    insert(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    /**
     * Extracts the item with the minimum cost.
     * @returns [cost, row, col]
     */
    extractMin() {
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
            // Compare by cost (index 0)
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
            let smallestIndex = index;
            // Check left child
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallestIndex][0]) {
                smallestIndex = leftChildIndex;
            }
            // Check right child
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex][0] < this.heap[smallestIndex][0]) {
                smallestIndex = rightChildIndex;
            }
            if (smallestIndex !== index) {
                [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
                index = smallestIndex;
            }
            else {
                break;
            }
        }
    }
}
/**
 * Reads input, performs Dijkstra's algorithm, and prints the result.
 */
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0) {
        console.log(-1);
        return;
    }
    // 1. Parse H and W
    const [hStr, wStr] = input[0].split(' ');
    const H = parseInt(hStr);
    const W = parseInt(wStr);
    const grid = [];
    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;
    // 2. Parse Grid and find S and T
    for (let i = 0; i < H; i++) {
        const rowChars = input[i + 1].split('');
        grid.push(rowChars);
        for (let j = 0; j < W; j++) {
            const char = rowChars[j];
            if (char === 'S') {
                startR = i;
                startC = j;
            }
            else if (char === 'T') {
                targetR = i;
                targetC = j;
            }
        }
    }
    // 3. Initialization
    // dist[r][c] stores the minimum cost to reach (r, c)
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = new MinPriorityQueue();
    // Start setup
    dist[startR][startC] = 0;
    // Push [cost, r, c]
    pq.insert([0, startR, startC]);
    // Directions: Up, Down, Left, Right
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    // 4. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.extractMin();
        // Skip if we found a better path already
        if (currentCost > dist[r][c]) {
            continue;
        }
        // Check if target reached
        if (r === targetR && c === targetC) {
            console.log(currentCost);
            return;
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
            // Check for wall
            if (cell === '#') {
                continue;
            }
            // Calculate cost to enter (nr, nc)
            let moveCost = 0;
            if (cell >= '0' && cell <= '9') {
                moveCost = parseInt(cell);
            }
            else if (cell === 'S' || cell === 'T') {
                // Entering S or T costs 0
                moveCost = 0;
            }
            const newCost = currentCost + moveCost;
            // Relaxation step
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.insert([newCost, nr, nc]);
            }
        }
    }
    // 5. Target unreachable
    console.log(-1);
}
solve();
