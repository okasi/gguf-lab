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
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n');
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);
    const grid = lines.slice(1).filter(line => line.length > 0);
    let startRow = -1, startCol = -1;
    let targetRow = -1, targetCol = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const char = grid[r][c];
            if (char === 'S') {
                startRow = r;
                startCol = c;
            }
            else if (char === 'T') {
                targetRow = r;
                targetCol = c;
            }
        }
    }
    const INF = Number.MAX_SAFE_INTEGER;
    const dist = Array.from({ length: H }, () => Array(W).fill(INF));
    dist[startRow][startCol] = 0;
    class MinHeap {
        constructor() {
            this.heap = [];
        }
        push(cost, r, c) {
            this.heap.push([cost, r, c]);
            this._bubbleUp(this.heap.length - 1);
        }
        pop() {
            if (this.heap.length === 0)
                return undefined;
            const top = this.heap[0];
            const last = this.heap.pop();
            if (this.heap.length > 0 && last) {
                this.heap[0] = last;
                this._sinkDown(0);
            }
            return top;
        }
        isEmpty() {
            return this.heap.length === 0;
        }
        _bubbleUp(index) {
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
        _sinkDown(index) {
            const length = this.heap.length;
            while (true) {
                let leftChildIndex = 2 * index + 1;
                let rightChildIndex = 2 * index + 2;
                let smallestIndex = index;
                if (leftChildIndex < length && this.heap[leftChildIndex][0] < this.heap[smallestIndex][0]) {
                    smallestIndex = leftChildIndex;
                }
                if (rightChildIndex < length && this.heap[rightChildIndex][0] < this.heap[smallestIndex][0]) {
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
    const pq = new MinHeap();
    pq.push(0, startRow, startCol);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (!pq.isEmpty()) {
        const [cost, r, c] = pq.pop();
        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }
        if (cost > dist[r][c])
            continue;
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char !== '#') {
                    let enterCost = 0;
                    if (char >= '0' && char <= '9') {
                        enterCost = char.charCodeAt(0) - 48;
                    }
                    const newCost = cost + enterCost;
                    if (newCost < dist[nr][nc]) {
                        dist[nr][nc] = newCost;
                        pq.push(newCost, nr, nc);
                    }
                }
            }
        }
    }
    console.log(-1);
}
solve();
