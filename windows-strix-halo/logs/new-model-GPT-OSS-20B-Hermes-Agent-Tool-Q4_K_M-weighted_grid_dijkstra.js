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
const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [H, W] = input[0].trim().split(' ').map(Number);
const grid = input.slice(1).map((line) => line.trim().split(''));
let start = null;
let target = null;
for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === 'S') {
            start = [i, j];
        }
        else if (grid[i][j] === 'T') {
            target = [i, j];
        }
    }
}
if (!start || !target) {
    console.log(-1);
    process.exit(0);
}
const [si, sj] = start;
const [ti, tj] = target;
const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
];
const dist = Array.from({ length: H }, () => Array.from({ length: W }, () => Infinity));
dist[si][sj] = 0;
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
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return min;
    }
    bubbleUp(n) {
        const element = this.heap[n];
        while (n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this.heap[parentN];
            if (element[0] >= parent[0])
                break;
            this.heap[parentN] = element;
            this.heap[n] = parent;
            n = parentN;
        }
    }
    sinkDown(n) {
        const length = this.heap.length;
        const element = this.heap[n];
        while (true) {
            const child2N = n * 2 + 2;
            const child1N = child2N - 1;
            let swap = null;
            let child1 = null;
            let child2 = null;
            if (child1N < length) {
                child1 = this.heap[child1N];
                if (child1[0] < element[0]) {
                    swap = child1N;
                }
            }
            if (child2N < length) {
                child2 = this.heap[child2N];
                if ((swap === null && child2[0] < element[0]) ||
                    (swap !== null && child2[0] < child1[0])) {
                    swap = child2N;
                }
            }
            if (swap === null)
                break;
            this.heap[n] = this.heap[swap];
            this.heap[swap] = element;
            n = swap;
        }
    }
}
const heap = new MinHeap();
heap.push([0, [si, sj]]);
while (heap.heap.length > 0) {
    const [d, [i, j]] = heap.pop();
    if (d > dist[i][j])
        continue;
    for (const [di, dj] of directions) {
        const ni = i + di;
        const nj = j + dj;
        if (ni < 0 || ni >= H || nj < 0 || nj >= W)
            continue;
        const cell = grid[ni][nj];
        if (cell === '#')
            continue;
        const cost = cell === '.' || cell === 'S' || cell === 'T' ? 0 : parseInt(cell, 10);
        const nd = d + cost;
        if (nd < dist[ni][nj]) {
            dist[ni][nj] = nd;
            heap.push([nd, [ni, nj]]);
        }
    }
}
const result = dist[ti][tj];
console.log(result === Infinity ? -1 : result);
