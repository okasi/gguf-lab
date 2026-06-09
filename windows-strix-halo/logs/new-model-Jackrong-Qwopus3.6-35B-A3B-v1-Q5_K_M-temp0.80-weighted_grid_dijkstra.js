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
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
    get size() {
        return this.heap.length;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
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
        const length = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.heap[left][0] < this.heap[smallest][0]) {
                smallest = left;
            }
            if (right < length && this.heap[right][0] < this.heap[smallest][0]) {
                smallest = right;
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
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [H, W] = lines[0].split(" ").map(Number);
    const grid = lines.slice(1, H + 1);
    let startRow = -1;
    let startCol = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === "S") {
                startRow = r;
                startCol = c;
            }
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startRow][startCol] = 0;
    const heap = new MinHeap();
    heap.push([0, startRow, startCol]);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (heap.size > 0) {
        const [cost, r, c] = heap.pop();
        if (cost > dist[r][c])
            continue;
        if (grid[r][c] === "T") {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== "#") {
                const cell = grid[nr][nc];
                const moveCost = (cell === "S" || cell === "T") ? 0 : parseInt(cell);
                const newCost = cost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    heap.push([newCost, nr, nc]);
                }
            }
        }
    }
    console.log(-1);
}
solve();
