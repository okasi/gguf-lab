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
        this.data = [];
    }
    push(item) {
        this.data.push(item);
        this._bubbleUp(this.data.length - 1);
    }
    pop() {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this._bubbleDown(0);
        }
        return top;
    }
    get length() {
        return this.data.length;
    }
    _bubbleUp(idx) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.data[idx][0] < this.data[parent][0]) {
                [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
                idx = parent;
            }
            else {
                break;
            }
        }
    }
    _bubbleDown(idx) {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.data[left][0] < this.data[smallest][0]) {
                smallest = left;
            }
            if (right < n && this.data[right][0] < this.data[smallest][0]) {
                smallest = right;
            }
            if (smallest !== idx) {
                [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
                idx = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split(/\r?\n/);
    if (input.length === 0)
        return;
    const firstLine = input[0].split(/\s+/).map(Number);
    const H = firstLine[0];
    const W = firstLine[1];
    const grid = [];
    for (let i = 0; i < H; i++) {
        grid.push(input[1 + i].trim());
    }
    let sr = -1, sc = -1, tr = -1, tc = -1;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const ch = grid[i][j];
            if (ch === 'S') {
                sr = i;
                sc = j;
            }
            else if (ch === 'T') {
                tr = i;
                tc = j;
            }
        }
    }
    if (sr === -1 || sc === -1 || tr === -1 || tc === -1) {
        console.log(-1);
        return;
    }
    if (sr === tr && sc === tc) {
        console.log(0);
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const heap = new MinHeap();
    dist[sr][sc] = 0;
    heap.push([0, sr, sc]);
    const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];
    while (heap.length > 0) {
        const [d, r, c] = heap.pop();
        if (d > dist[r][c])
            continue;
        if (r === tr && c === tc) {
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
            const cost = (ch >= '0' && ch <= '9') ? parseInt(ch, 10) : 0;
            const newDist = d + cost;
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                heap.push([newDist, nr, nc]);
            }
        }
    }
    console.log(-1);
}
solve();
