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
    push(val, priority) {
        this.heap.push({ val, priority });
        this.bubbleUp();
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return top;
    }
    size() {
        return this.heap.length;
    }
    bubbleUp() {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            let pIdx = (idx - 1) >> 1;
            if (this.heap[idx].priority >= this.heap[pIdx].priority)
                break;
            const tmp = this.heap[idx];
            this.heap[idx] = this.heap[pIdx];
            this.heap[pIdx] = tmp;
            idx = pIdx;
        }
    }
    bubbleDown() {
        let idx = 0;
        const n = this.heap.length;
        while (true) {
            let left = (idx << 1) + 1;
            let right = (idx << 1) + 2;
            let smallest = idx;
            if (left < n && this.heap[left].priority < this.heap[smallest].priority)
                smallest = left;
            if (right < n && this.heap[right].priority < this.heap[smallest].priority)
                smallest = right;
            if (smallest === idx)
                break;
            const tmp = this.heap[idx];
            this.heap[idx] = this.heap[smallest];
            this.heap[smallest] = tmp;
            idx = smallest;
        }
    }
}
function solve() {
    const inputStr = fs.readFileSync(0, "utf8");
    const tokens = inputStr.trim().split(/\s+/);
    if (tokens.length < 2)
        return;
    const H = parseInt(tokens[0]);
    const W = parseInt(tokens[1]);
    if (isNaN(H) || isNaN(W))
        return;
    const allChars = tokens.slice(2).join("");
    let startR = -1, startC = -1;
    for (let i = 0; i < H * W; i++) {
        if (allChars[i] === 'S') {
            startR = Math.floor(i / W);
            startC = i % W;
            break;
        }
    }
    if (startR === -1) {
        process.stdout.write("-1\n");
        return;
    }
    const dist = new Float64Array(H * W).fill(Infinity);
    const pq = new MinHeap();
    dist[startR * W + startC] = 0;
    pq.push([startR, startC], 0);
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (pq.size() > 0) {
        const item = pq.pop();
        if (!item)
            break;
        const { val, priority: d } = item;
        const [r, c] = val;
        if (d > dist[r * W + c])
            continue;
        if (allChars[r * W + c] === 'T') {
            process.stdout.write(d.toString() + "\n");
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const idx = nr * W + nc;
                const char = allChars[idx];
                if (char !== '#') {
                    let moveCost = 0;
                    if (char >= '0' && char <= '9') {
                        moveCost = char.charCodeAt(0) - 48;
                    }
                    const newDist = d + moveCost;
                    if (newDist < dist[idx]) {
                        dist[idx] = newDist;
                        pq.push([nr, nc], newDist);
                    }
                }
            }
        }
    }
    process.stdout.write("-1\n");
}
solve();
