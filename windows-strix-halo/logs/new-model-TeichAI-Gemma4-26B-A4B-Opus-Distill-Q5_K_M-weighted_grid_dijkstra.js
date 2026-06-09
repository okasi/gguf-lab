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
class PriorityQueue {
    constructor(comparator) {
        this.heap = [];
        this.comparator = comparator;
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp();
    }
    pop() {
        if (this.isEmpty())
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return top;
    }
    isEmpty() { return this.heap.length === 0; }
    bubbleUp() {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.comparator(this.heap[idx], this.heap[parent]) < 0) {
                [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                idx = parent;
            }
            else
                break;
        }
    }
    bubbleDown() {
        let idx = 0;
        const length = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = (idx << 1) + 1;
            const right = (idx << 1) + 2;
            if (left < length && this.comparator(this.heap[left], this.heap[smallest]) < 0)
                smallest = left;
            if (right < length && this.comparator(this.heap[right], this.heap[smallest]) < 0)
                smallest = right;
            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            }
            else
                break;
        }
    }
}
function solve() {
    const inputStr = fs.readFileSync(0, 'utf8');
    const tokens = inputStr.split(/\s+/).filter(s => s.length > 0);
    if (tokens.length < 2)
        return;
    const H = parseInt(tokens[0], 10);
    const W = parseInt(tokens[1], 10);
    if (isNaN(H) || isNaN(W))
        return;
    const gridStr = tokens.slice(2).join('');
    if (gridStr.length < H * W)
        return;
    const grid = [];
    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let i = 0; i < H; i++) {
        grid[i] = [];
        for (let j = 0; j < W; j++) {
            const char = gridStr[i * W + j];
            grid[i].push(char);
            if (char === 'S') {
                startR = i;
                startC = j;
            }
            else if (char === 'T') {
                targetR = i;
                targetC = j;
            }
        }
    }
    if (startR === -1 || targetR === -1) {
        console.log(-1);
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new PriorityQueue((a, b) => a.cost - b.cost);
    dist[startR][startC] = 0;
    pq.push({ r: startR, c: startC, cost: 0 });
    const dr = [0, 0, 1, -1];
    const dc = [1, -1, 0, 0];
    while (!pq.isEmpty()) {
        const curr = pq.pop();
        if (curr.cost > dist[curr.r][curr.c])
            continue;
        if (curr.r === targetR && curr.c === targetC) {
            console.log(curr.cost);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = curr.r + dr[i];
            const nc = curr.c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#')
                    continue;
                let entryCost = 0;
                if (char >= '0' && char <= '9') {
                    entryCost = parseInt(char, 10);
                }
                else if (char === 'S' || char === 'T') {
                    entryCost = 0;
                }
                if (dist[curr.r][curr.c] + entryCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[curr.r][curr.c] + entryCost;
                    pq.push({ r: nr, c: nc, cost: dist[nr][nc] });
                }
            }
        }
    }
    console.log(-1);
}
solve();
