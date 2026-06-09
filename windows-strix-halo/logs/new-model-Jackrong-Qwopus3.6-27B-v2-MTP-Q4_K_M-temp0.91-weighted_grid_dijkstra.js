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
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    if (lines.length < 1)
        return;
    const firstLine = lines[0].trim().split(/\s+/);
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);
    const grid = [];
    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let i = 1; i <= H; i++) {
        if (i < lines.length) {
            const row = lines[i].trim();
            grid.push(row.substring(0, W));
        }
        else {
            break;
        }
        for (let j = 0; j < W; j++) {
            const ch = grid[i - 1][j];
            if (ch === 'S') {
                startR = i - 1;
                startC = j;
            }
            else if (ch === 'T') {
                targetR = i - 1;
                targetC = j;
            }
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    class HeapNode {
        constructor(cost, r, c) {
            this.cost = cost;
            this.r = r;
            this.c = c;
        }
    }
    class MinHeap {
        constructor() {
            this.data = [];
        }
        push(node) {
            this.data.push(node);
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
        get size() { return this.data.length; }
        bubbleUp(idx) {
            while (idx > 0) {
                const parent = Math.floor((idx - 1) / 2);
                if (this.data[parent].cost <= this.data[idx].cost)
                    break;
                [this.data[parent], this.data[idx]] = [this.data[idx], this.data[parent]];
                idx = parent;
            }
        }
        bubbleDown(idx) {
            const n = this.data.length;
            while (true) {
                let smallest = idx;
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;
                if (left < n && this.data[left].cost < this.data[smallest].cost)
                    smallest = left;
                if (right < n && this.data[right].cost < this.data[smallest].cost)
                    smallest = right;
                if (smallest === idx)
                    break;
                [this.data[smallest], this.data[idx]] = [this.data[idx], this.data[smallest]];
                idx = smallest;
            }
        }
    }
    const heap = new MinHeap();
    heap.push(new HeapNode(0, startR, startC));
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (heap.size > 0) {
        const curr = heap.pop();
        const d = curr.cost;
        const r = curr.r;
        const c = curr.c;
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
            let cost = 0;
            if (ch >= '0' && ch <= '9') {
                cost = parseInt(ch, 10);
            }
            else if (ch === 'T') {
                cost = 0;
            }
            else if (ch === 'S') {
                cost = 0;
            }
            const newDist = d + cost;
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                heap.push(new HeapNode(newDist, nr, nc));
            }
        }
    }
    console.log(-1);
}
main();
