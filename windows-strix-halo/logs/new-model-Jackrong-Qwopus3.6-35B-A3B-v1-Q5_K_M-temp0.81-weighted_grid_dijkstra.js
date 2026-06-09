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
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    size() {
        return this.heap.length;
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.less(i, parent)) {
                this.swap(i, parent);
                i = parent;
            }
            else {
                break;
            }
        }
    }
    sinkDown(i) {
        const n = this.heap.length;
        while (true) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let smallest = i;
            if (left < n && this.less(left, smallest))
                smallest = left;
            if (right < n && this.less(right, smallest))
                smallest = right;
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            }
            else {
                break;
            }
        }
    }
    less(i, j) {
        return this.heap[i][0] < this.heap[j][0];
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split("\n");
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);
    const grid = [];
    let sx = -1, sy = -1, tx = -1, ty = -1;
    for (let i = 1; i <= H; i++) {
        const line = lines[i].trim();
        const row = [];
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            row.push(char);
            if (char === 'S') {
                sx = j;
                sy = i - 1;
            }
            else if (char === 'T') {
                tx = j;
                ty = i - 1;
            }
        }
        grid.push(row);
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[sy][sx] = 0;
    // [cost, x, y]
    const pq = new MinHeap();
    pq.push([0, sx, sy]);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (pq.size() > 0) {
        const current = pq.pop();
        const [cost, x, y] = current;
        if (cost > dist[y][x])
            continue;
        if (x === tx && y === ty) {
            console.log(cost);
            return;
        }
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] !== '#') {
                const char = grid[ny][nx];
                const stepCost = char === 'S' || char === 'T' ? 0 : parseInt(char, 10);
                if (cost + stepCost < dist[ny][nx]) {
                    dist[ny][nx] = cost + stepCost;
                    pq.push([dist[ny][nx], nx, ny]);
                }
            }
        }
    }
    console.log(-1);
}
solve();
