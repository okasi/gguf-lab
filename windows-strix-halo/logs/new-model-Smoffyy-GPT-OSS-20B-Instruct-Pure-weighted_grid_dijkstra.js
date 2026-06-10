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
const lines = fs.readFileSync(0, 'utf8').trimEnd().split(/\r?\n/);
const [H, W] = lines[0].trim().split(/\s+/).map(Number);
const grid = lines.slice(1, H + 1);
let startIdx = -1;
let targetIdx = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        const ch = grid[r][c];
        const idx = r * W + c;
        if (ch === 'S')
            startIdx = idx;
        if (ch === 'T')
            targetIdx = idx;
    }
}
const INF = Number.MAX_SAFE_INTEGER;
const dist = new Array(H * W).fill(INF);
dist[startIdx] = 0;
class MinHeap {
    constructor(cmp) {
        this.cmp = cmp;
        this.heap = [];
    }
    size() { return this.heap.length; }
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
            this.bubbleDown(0);
        }
        return top;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.cmp(this.heap[parent], this.heap[idx]))
                break;
            [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
            idx = parent;
        }
    }
    bubbleDown(idx) {
        const n = this.heap.length;
        while (true) {
            let left = idx * 2 + 1;
            let right = idx * 2 + 2;
            let smallest = idx;
            if (left < n && !this.cmp(this.heap[smallest], this.heap[left]))
                smallest = left;
            if (right < n && !this.cmp(this.heap[smallest], this.heap[right]))
                smallest = right;
            if (smallest === idx)
                break;
            [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
            idx = smallest;
        }
    }
}
const heap = new MinHeap((a, b) => a.cost < b.cost);
heap.push({ cost: 0, idx: startIdx });
const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];
while (heap.size() > 0) {
    const { cost, idx } = heap.pop();
    if (cost > dist[idx])
        continue;
    if (idx === targetIdx)
        break;
    const r = Math.floor(idx / W);
    const c = idx % W;
    for (let dir = 0; dir < 4; dir++) {
        const nr = r + dr[dir];
        const nc = c + dc[dir];
        if (nr < 0 || nr >= H || nc < 0 || nc >= W)
            continue;
        const ch = grid[nr][nc];
        if (ch === '#')
            continue;
        const nIdx = nr * W + nc;
        const add = ch === 'S' || ch === 'T' ? 0 : Number(ch);
        const newCost = cost + add;
        if (newCost < dist[nIdx]) {
            dist[nIdx] = newCost;
            heap.push({ cost: newCost, idx: nIdx });
        }
    }
}
const answer = dist[targetIdx] === INF ? -1 : dist[targetIdx];
console.log(answer.toString());
