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
function main() {
    const data = fs.readFileSync(0, 'utf8');
    const lines = data.trim().split(/\r?\n/);
    const firstLine = lines[0].trim();
    const [H, W] = firstLine.split(/\s+/).map(Number);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(lines[i].trim());
    }
    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        const row = grid[r];
        for (let c = 0; c < W; c++) {
            const ch = row[c];
            if (ch === 'S') {
                startR = r;
                startC = c;
            }
            else if (ch === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }
    function getCost(r, c) {
        const ch = grid[r][c];
        if (ch === '#')
            return Infinity;
        if (ch === 'S' || ch === 'T')
            return 0;
        return parseInt(ch, 10);
    }
    const INF = Number.MAX_SAFE_INTEGER;
    const dist = [];
    for (let r = 0; r < H; r++) {
        dist.push(new Array(W).fill(INF));
    }
    dist[startR][startC] = 0;
    class MinHeap {
        constructor() {
            this.heap = [];
        }
        parent(i) { return (i - 1) >> 1; }
        left(i) { return 2 * i + 1; }
        right(i) { return 2 * i + 2; }
        swap(i, j) {
            [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
        }
        siftUp(i) {
            while (i > 0 && this.heap[this.parent(i)][0] > this.heap[i][0]) {
                this.swap(i, this.parent(i));
                i = this.parent(i);
            }
        }
        siftDown(i) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < this.heap.length && this.heap[l][0] < this.heap[smallest][0])
                smallest = l;
            if (r < this.heap.length && this.heap[r][0] < this.heap[smallest][0])
                smallest = r;
            if (smallest !== i) {
                this.swap(i, smallest);
                this.siftDown(smallest);
            }
        }
        push(priority, r, c) {
            this.heap.push([priority, r, c]);
            this.siftUp(this.heap.length - 1);
        }
        pop() {
            if (this.heap.length === 0)
                return null;
            const top = this.heap[0];
            const last = this.heap.pop();
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this.siftDown(0);
            }
            return top;
        }
        isEmpty() {
            return this.heap.length === 0;
        }
    }
    const pq = new MinHeap();
    pq.push(0, startR, startC);
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (!pq.isEmpty()) {
        const entry = pq.pop();
        if (entry === null)
            break;
        const [d, r, c] = entry;
        if (d > dist[r][c])
            continue;
        if (r === targetR && c === targetC) {
            console.log(d);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const ch = grid[nr][nc];
            if (ch === '#')
                continue;
            const cost = getCost(nr, nc);
            const newDist = d + cost;
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                pq.push(newDist, nr, nc);
            }
        }
    }
    const ans = dist[targetR][targetC];
    console.log(ans === INF ? -1 : ans);
}
main();
