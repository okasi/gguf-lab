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
        if (this.heap.length > 0 && last) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(i) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (this.heap[i][0] < this.heap[p][0]) {
                [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
                i = p;
            }
            else {
                break;
            }
        }
    }
    sinkDown(i) {
        const n = this.heap.length;
        while (true) {
            let l = 2 * i + 1;
            let r = 2 * i + 2;
            let smallest = i;
            if (l < n && this.heap[l][0] < this.heap[smallest][0])
                smallest = l;
            if (r < n && this.heap[r][0] < this.heap[smallest][0])
                smallest = r;
            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    const [H, W] = input[0].split(' ').map(Number);
    const grid = input.slice(1);
    let startY = -1, startX = -1, targetY = -1, targetX = -1;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const ch = grid[y][x];
            if (ch === 'S') {
                startY = y;
                startX = x;
            }
            if (ch === 'T') {
                targetY = y;
                targetX = x;
            }
        }
    }
    const dist = Array.from({ length: H }, () => new Array(W).fill(Infinity));
    dist[startY][startX] = 0;
    const pq = new MinHeap();
    pq.push([0, startY, startX]);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (!pq.isEmpty()) {
        const [cost, y, x] = pq.pop();
        if (cost > dist[y][x])
            continue;
        if (y === targetY && x === targetX)
            return cost;
        for (const [dy, dx] of dirs) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny < 0 || ny >= H || nx < 0 || nx >= W)
                continue;
            const ch = grid[ny][nx];
            if (ch === '#')
                continue;
            const newCost = (ch === 'S' || ch === 'T') ? cost : cost + parseInt(ch);
            if (newCost < dist[ny][nx]) {
                dist[ny][nx] = newCost;
                pq.push([newCost, ny, nx]);
            }
        }
    }
    return -1;
}
console.log(solve());
