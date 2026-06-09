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
class MinHeap {
    constructor() {
        this.heap = [];
        this.size = 0;
    }
    push(value, priority) {
        this.heap.push([value, priority]);
        this.size++;
        this.bubbleUp(this.size - 1);
    }
    pop() {
        if (this.size === 0)
            return undefined;
        const top = this.heap[0];
        this.heap[0] = this.heap[this.size - 1];
        this.heap.pop();
        this.size--;
        this.sinkDown(0);
        return top?.[0];
    }
    isEmpty() {
        return this.size === 0;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.heap[parentIndex][1] <= this.heap[index][1])
                break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }
    sinkDown(index) {
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        let smallest = index;
        if (left < this.size && this.heap[left][1] < this.heap[smallest][1]) {
            smallest = left;
        }
        if (right < this.size && this.heap[right][1] < this.heap[smallest][1]) {
            smallest = right;
        }
        if (smallest !== index) {
            this.swap(index, smallest);
            this.sinkDown(smallest);
        }
    }
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [h, w] = lines[0].split(" ").map(Number);
    const grid = [];
    let startRow = -1, startCol = -1;
    for (let i = 1; i <= h; i++) {
        grid.push(lines[i].split(""));
    }
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            if (grid[r][c] === "S") {
                startRow = r;
                startCol = c;
            }
        }
    }
    const dist = Array.from({ length: h }, () => Array(w).fill(Infinity));
    dist[startRow][startCol] = 0;
    const pq = new MinHeap();
    pq.push([startRow, startCol], 0);
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    while (!pq.isEmpty()) {
        const pos = pq.pop();
        const [r, c] = pos;
        const currentCost = dist[r][c];
        if (grid[r][c] === "T") {
            process.stdout.write(String(currentCost));
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < h && nc >= 0 && nc < w && grid[nr][nc] !== "#") {
                const stepCost = grid[nr][nc] === "S" || grid[nr][nc] === "T" ? 0 : parseInt(grid[nr][nc]);
                const newCost = currentCost + stepCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push([nr, nc], newCost);
                }
            }
        }
    }
    process.stdout.write("-1");
}
solve();
