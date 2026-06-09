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
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
    parent(i) {
        return (i - 1) >> 1;
    }
    left(i) {
        return 2 * i + 1;
    }
    right(i) {
        return 2 * i + 2;
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return null;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const pIdx = this.parent(idx);
            if (this.heap[pIdx].dist <= this.heap[idx].dist)
                break;
            this.swap(pIdx, idx);
            idx = pIdx;
        }
    }
    sinkDown(idx) {
        const length = this.heap.length;
        while (true) {
            let smallest = idx;
            const l = this.left(idx);
            const r = this.right(idx);
            if (l < length && this.heap[l].dist < this.heap[smallest].dist)
                smallest = l;
            if (r < length && this.heap[r].dist < this.heap[smallest].dist)
                smallest = r;
            if (smallest === idx)
                break;
            this.swap(idx, smallest);
            idx = smallest;
        }
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0].trim().split(/\s+/);
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);
    const grid = [];
    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let i = 0; i < H; i++) {
        const rowStr = lines[i + 1].trim();
        const row = [];
        for (let j = 0; j < W; j++) {
            const ch = rowStr[j];
            if (ch === '#') {
                row.push(-1);
            }
            else if (ch === 'S') {
                row.push(0);
                startR = i;
                startC = j;
            }
            else if (ch === 'T') {
                row.push(0);
                targetR = i;
                targetC = j;
            }
            else {
                row.push(parseInt(ch, 10));
            }
        }
        grid.push(row);
    }
    const dist = [];
    for (let i = 0; i < H; i++) {
        dist.push(new Array(W).fill(Infinity));
    }
    dist[startR][startC] = 0;
    const heap = new MinHeap();
    heap.push({ r: startR, c: startC, dist: 0 });
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (!heap.isEmpty()) {
        const cur = heap.pop();
        if (cur === null)
            break;
        const { r, c, d } = cur;
        if (d > dist[r][c])
            continue;
        if (r === targetR && c === targetC) {
            console.log(d);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== -1) {
                const newDist = d + grid[nr][nc];
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    heap.push({ r: nr, c: nc, dist: newDist });
                }
            }
        }
    }
    if (dist[targetR][targetC] === Infinity) {
        console.log(-1);
    }
    else {
        console.log(dist[targetR][targetC]);
    }
}
main();
