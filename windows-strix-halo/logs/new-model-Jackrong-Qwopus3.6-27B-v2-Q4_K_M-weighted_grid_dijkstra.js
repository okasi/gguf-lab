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
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    left(i) {
        return 2 * i + 1;
    }
    right(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    siftUp(i) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.data[p][0] > this.data[i][0]) {
                this.swap(i, p);
                i = p;
            }
            else {
                break;
            }
        }
    }
    siftDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l][0] < this.data[smallest][0]) {
                smallest = l;
            }
            if (r < n && this.data[r][0] < this.data[smallest][0]) {
                smallest = r;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            }
            else {
                break;
            }
        }
    }
    push(cost, r, c) {
        this.data.push([cost, r, c]);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return null;
        const top = this.data[0];
        const last = this.data.pop();
        if (last !== top) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/).map(Number);
    const H = parts[0];
    const W = parts[1];
    const grid = [];
    for (let i = 1; i <= H; i++) {
        if (i < lines.length) {
            grid.push(lines[i].trim());
        }
        else {
            grid.push('');
        }
    }
    let startR = -1, startC = -1, targetR = -1, targetC = -1;
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
    if (startR === -1 || targetR === -1) {
        console.log(-1);
        return;
    }
    if (startR === targetR && startC === targetC) {
        console.log(0);
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    const pq = new MinHeap();
    pq.push(0, startR, startC);
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (!pq.isEmpty()) {
        const top = pq.pop();
        if (top === null)
            break;
        const [cost, r, c] = top;
        if (cost > dist[r][c])
            continue;
        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }
        for (let d = 0; d < 4; d++) {
            const nr = r + dr[d];
            const nc = c + dc[d];
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const ch = grid[nr][nc];
            if (ch === '#')
                continue;
            let cellCost = 0;
            if (ch === 'S' || ch === 'T') {
                cellCost = 0;
            }
            else if (ch >= '0' && ch <= '9') {
                cellCost = parseInt(ch, 10);
            }
            else {
                cellCost = 0; // should not happen
            }
            const newCost = cost + cellCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.push(newCost, nr, nc);
            }
        }
    }
    console.log(-1);
}
main();
