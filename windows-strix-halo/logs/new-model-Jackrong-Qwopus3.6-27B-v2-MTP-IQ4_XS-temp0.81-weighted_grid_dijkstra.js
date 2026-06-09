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
class Heap {
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
        const bottom = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = bottom;
            this.bubbleDown(0);
        }
        return top;
    }
    bubbleUp(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.data[p][0] <= this.data[i][0])
                break;
            [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
            i = p;
        }
    }
    bubbleDown(i) {
        const n = this.data.length;
        while (true) {
            let l = 2 * i + 1, r = 2 * i + 2, s = i;
            if (l < n && this.data[l][0] < this.data[s][0])
                s = l;
            if (r < n && this.data[r][0] < this.data[s][0])
                s = r;
            if (s === i)
                break;
            [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
            i = s;
        }
    }
}
const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [H, W] = input[0].split(/\s+/).map(Number);
const grid = input.slice(1).map(line => line.split(''));
let sr = 0, sc = 0;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === 'S') {
            sr = r;
            sc = c;
        }
    }
}
const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[sr][sc] = 0;
const heap = new Heap();
heap.push([0, sr, sc]);
const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];
let ans = -1;
while (heap.data.length > 0) {
    const [d, r, c] = heap.pop();
    if (d > dist[r][c])
        continue;
    if (grid[r][c] === 'T') {
        ans = d;
        break;
    }
    for (let i = 0; i < 4; i++) {
        const nr = r + dr[i];
        const nc = c + dc[i];
        if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
            let cost = 0;
            const ch = grid[nr][nc];
            if (ch >= '0' && ch <= '9') {
                cost = parseInt(ch, 10);
            }
            const nd = d + cost;
            if (nd < dist[nr][nc]) {
                dist[nr][nc] = nd;
                heap.push([nd, nr, nc]);
            }
        }
    }
}
console.log(ans);
