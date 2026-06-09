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
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');
const [H, W] = lines[0].split(' ').map(Number);
const grid = lines.slice(1, H + 1);
let startX = -1, startY = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === 'S') {
            startX = c;
            startY = r;
        }
    }
}
const INF = Number.MAX_SAFE_INTEGER;
const dist = Array.from({ length: H }, () => Array(W).fill(INF));
dist[startY][startX] = 0;
class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    push(item) {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this._bubbleDown(0);
        }
        return top;
    }
    get size() {
        return this.heap.length;
    }
    _bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.heap[idx][0] < this.heap[parentIdx][0]) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            }
            else {
                break;
            }
        }
    }
    _bubbleDown(idx) {
        const length = this.heap.length;
        while (true) {
            const leftIdx = 2 * idx + 1;
            const rightIdx = 2 * idx + 2;
            let smallest = idx;
            if (leftIdx < length && this.heap[leftIdx][0] < this.heap[smallest][0]) {
                smallest = leftIdx;
            }
            if (rightIdx < length && this.heap[rightIdx][0] < this.heap[smallest][0]) {
                smallest = rightIdx;
            }
            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            }
            else {
                break;
            }
        }
    }
}
const pq = new PriorityQueue();
pq.push([0, startY, startX]);
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
while (pq.size > 0) {
    const [cost, r, c] = pq.pop();
    if (cost > dist[r][c])
        continue;
    for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W)
            continue;
        if (grid[nr][nc] === '#')
            continue;
        let cellCost = 0;
        if (grid[nr][nc] >= '0' && grid[nr][nc] <= '9') {
            cellCost = parseInt(grid[nr][nc], 10);
        }
        const newCost = cost + cellCost;
        if (newCost < dist[nr][nc]) {
            dist[nr][nc] = newCost;
            pq.push([newCost, nr, nc]);
        }
    }
}
let targetCost = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === 'T') {
            if (dist[r][c] !== INF) {
                targetCost = dist[r][c];
            }
            break;
        }
    }
    if (targetCost !== -1)
        break;
}
console.log(targetCost);
