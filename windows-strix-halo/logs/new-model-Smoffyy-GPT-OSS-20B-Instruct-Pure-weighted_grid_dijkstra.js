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
const input = fs.readFileSync(0, 'utf8').trimEnd().split(/\r?\n/);
const [H, W] = input[0].trim().split(/\s+/).map(Number);
const grid = input.slice(1, H + 1);
let startIdx = -1;
let targetIdx = -1;
const cost = new Array(H * W);
for (let i = 0; i < H; i++) {
    const line = grid[i];
    for (let j = 0; j < W; j++) {
        const ch = line[j];
        const idx = i * W + j;
        if (ch === 'S') {
            startIdx = idx;
            cost[idx] = 0;
        }
        else if (ch === 'T') {
            targetIdx = idx;
            cost[idx] = 0;
        }
        else if (ch === '#') {
            cost[idx] = -1; // wall
        }
        else {
            cost[idx] = Number(ch); // digit 0-9
        }
    }
}
if (startIdx === -1 || targetIdx === -1) {
    console.log(-1);
    process.exit(0);
}
class MinHeap {
    constructor() {
        this.data = [];
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    size() {
        return this.data.length;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.data[parent][0] <= this.data[idx][0])
                break;
            [this.data[parent], this.data[idx]] = [this.data[idx], this.data[parent]];
            idx = parent;
        }
    }
    bubbleDown(idx) {
        const n = this.data.length;
        while (true) {
            let left = (idx << 1) + 1;
            let right = left + 1;
            let smallest = idx;
            if (left < n && this.data[left][0] < this.data[smallest][0])
                smallest = left;
            if (right < n && this.data[right][0] < this.data[smallest][0])
                smallest = right;
            if (smallest === idx)
                break;
            [this.data[smallest], this.data[idx]] = [this.data[idx], this.data[smallest]];
            idx = smallest;
        }
    }
}
const dist = new Array(H * W).fill(Infinity);
dist[startIdx] = 0;
const heap = new MinHeap();
heap.push([0, startIdx]);
const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
];
while (heap.size() > 0) {
    const [d, idx] = heap.pop();
    if (d !== dist[idx])
        continue;
    if (idx === targetIdx)
        break;
    const i = Math.floor(idx / W);
    const j = idx % W;
    for (const [di, dj] of dirs) {
        const ni = i + di;
        const nj = j + dj;
        if (ni < 0 || ni >= H || nj < 0 || nj >= W)
            continue;
        const nidx = ni * W + nj;
        if (cost[nidx] === -1)
            continue; // wall
        const nd = d + cost[nidx];
        if (nd < dist[nidx]) {
            dist[nidx] = nd;
            heap.push([nd, nidx]);
        }
    }
}
const result = dist[targetIdx] === Infinity ? -1 : dist[targetIdx];
console.log(result.toString());
