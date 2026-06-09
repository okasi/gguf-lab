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
 * Min Priority Queue implementation for Dijkstra's algorithm.
 * Stores [cost, row, col] and prioritizes lower cost.
 */
class MinHeap {
    constructor() {
        this.heap = [];
    }
    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    getLeftChildIndex(i) {
        return 2 * i + 1;
    }
    getRightChildIndex(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    compare(a, b) {
        return a.cost < b.cost;
    }
    bubbleUp(index) {
        let currentIndex = index;
        let parentIndex = this.getParentIndex(currentIndex);
        while (currentIndex > 0 && this.heap[currentIndex].cost < this.heap[this.getParentIndex(currentIndex)].cost) {
            this.bubbleUp(this.getParentIndex(currentIndex));
            this.swap(currentIndex, this.getParentIndex(currentIndex));
            currentIndex--;
        }
    }
    bubbleDown(index) {
        let currentIndex = index;
        let leftChildIndex = this.getLeftChildIndex(currentIndex);
        let rightChildIndex = this.getRightChildIndex(currentIndex);
        let smallest = currentIndex;
        // Find the smallest among current, left, and right
        const left = leftChildIndex < this.heap.length ? this.heap[this.heap.length - 1 - leftChildIndex] : null;
        const right = rightChildIndex < this.heap.length ? this.heap[this.heap.length - 1 - rightChildIndex] : null;
        const currentCost = this.heap[currentIndex].cost;
        const leftCost = left ? left.cost : Infinity;
        const rightCost = right ? right.cost : Infinity;
        if (left && leftCost < currentCost) {
            smallest = this.heap.length - 1 - leftChildIndex;
        }
        if (right && rightCost < this.heap[this.heap.length - 1 - smallest].cost) {
            smallest = this.heap.length - 1 - rightChildIndex;
        }
        if (smallest !== currentIndex) {
            this.swap(currentIndex, smallest);
            this.bubbleDown(smallest);
        }
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    peek() {
        return this.heap[0];
    }
    enqueue(cell) {
        this.heap.push(cell);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
}
function solveGrid(grid, H, W) {
    const start = grid.findIndex((row) => row.includes('S'));
    const target = grid.findIndex((row) => row.includes('T'));
    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;
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
    const INF = 10 ** 9;
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new MinHeap();
    // Start state: cost 0, current cell cost 0 (entering S)
    dist[startR][startC] = 0;
    pq.enqueue({ cost: 0, r: startR, c: startC });
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (!pq.isEmpty()) {
        const { cost: currentCost, r, c } = pq.dequeue();
        if (currentCost > dist[r][c]) {
            continue;
        }
        if (r === targetR && c === targetC) {
            return currentCost;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                let moveCost = 0;
                const char = cell.charAt(0);
                if (char >= '0' && char <= '9') {
                    moveCost = parseInt(char);
                }
                else if (char === '#') {
                    continue; // Wall
                }
                // S and T cost 0 to enter
                const newCost = currentCost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.enqueue({ cost: newCost, r: nr, c: nc });
                }
            }
        }
    }
    return dist[targetR][targetC] === INF ? -1 : dist[targetR][targetC];
}
async function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        const lines = input.trim().split('\n').filter(line => line.trim().length > 0);
        if (lines.length === 0) {
            console.log(-1);
            return;
        }
        const [H_str, W_str] = lines[0].split(' ');
        const H = parseInt(H_str);
        const W = parseInt(W_str);
        const grid = lines.slice(1).map(line => line.trim().split(''));
        const result = solveGrid(grid, H, W);
        console.log(result);
    }
    catch (e) {
        // Handle empty input or file read error gracefully
        console.error(e);
        console.log(-1);
    }
}
main();
