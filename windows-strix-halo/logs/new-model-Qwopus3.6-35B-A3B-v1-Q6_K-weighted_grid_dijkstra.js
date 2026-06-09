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
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    get size() {
        return this.data.length;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.data[parent][0] <= this.data[i][0])
                break;
            [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
            i = parent;
        }
    }
    sinkDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.data[left][0] < this.data[smallest][0])
                smallest = left;
            if (right < n && this.data[right][0] < this.data[smallest][0])
                smallest = right;
            if (smallest === i)
                break;
            [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
            i = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0)
        return;
    const [H, W] = input[0].split(' ').map(Number);
    const grid = input.slice(1).slice(0, H);
    let sR = -1, sC = -1, tR = -1, tC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                sR = r;
                sC = c;
            }
            else if (grid[r][c] === 'T') {
                tR = r;
                tC = c;
            }
        }
    }
    if (sR === -1 || tR === -1) {
        console.log(-1);
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[sR][sC] = 0;
    const pq = new MinHeap();
    pq.push([0, sR, sC]);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (pq.size > 0) {
        const [d, r, c] = pq.pop();
        if (d > dist[r][c])
            continue;
        if (r === tR && c === tC) {
            console.log(d);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === '#')
                continue;
            const cost = (cell === 'T' || cell === 'S') ? 0 : parseInt(cell, 10);
            const newDist = d + cost;
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                pq.push([newDist, nr, nc]);
            }
        }
    }
    console.log(-1);
}
solve();
