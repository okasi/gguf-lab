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
const lines = input.split(/\r?\n/);
const firstLine = lines[0].split(/\s+/).map(Number);
const H = firstLine[0];
const W = firstLine[1];
const grid = [];
for (let i = 1; i <= H; i++) {
    grid.push(lines[i].trim());
}
let startR = -1, startC = -1;
let targetR = -1, targetC = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        const ch = grid[r][c];
        if (ch === 'S') {
            startR = r;
            startC = c;
        }
        if (ch === 'T') {
            targetR = r;
            targetC = c;
        }
    }
}
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
            throw new Error('pop from empty');
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._bubbleDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    _bubbleUp(index) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.heap[parent][0] <= this.heap[index][0])
                break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }
    _bubbleDown(index) {
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.heap[left][0] < this.heap[smallest][0])
                smallest = left;
            if (right < n && this.heap[right][0] < this.heap[smallest][0])
                smallest = right;
            if (smallest === index)
                break;
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}
const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[startR][startC] = 0;
const pq = new PriorityQueue();
pq.push([0, startR, startC]);
const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
while (!pq.isEmpty()) {
    const [d, r, c] = pq.pop();
    if (d > dist[r][c])
        continue;
    if (r === targetR && c === targetC) {
        console.log(d);
        return;
    }
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W)
            continue;
        const ch = grid[nr][nc];
        if (ch === '#')
            continue;
        const cost = (ch === 'S' || ch === 'T') ? 0 : parseInt(ch, 10);
        const newDist = d + cost;
        if (newDist < dist[nr][nc]) {
            dist[nr][nc] = newDist;
            pq.push([newDist, nr, nc]);
        }
    }
}
console.log(-1);
