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
    constructor() { this.data = []; }
    push(item) {
        this.data.push(item);
        this._bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this._bubbleDown(0);
        }
        return top;
    }
    size() { return this.data.length; }
    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.data[index][0] < this.data[parentIndex][0]) {
                [this.data[index], this.data[parentIndex]] = [this.data[parentIndex], this.data[index]];
                index = parentIndex;
            }
            else
                break;
        }
    }
    _bubbleDown(index) {
        const length = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.data[left][0] < this.data[smallest][0])
                smallest = left;
            if (right < length && this.data[right][0] < this.data[smallest][0])
                smallest = right;
            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            }
            else
                break;
        }
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    if (lines.length < 2) {
        console.log(-1);
        return;
    }
    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/);
    const H = parseInt(parts[0], 10);
    const W = parseInt(parts[1], 10);
    const grid = new Array(H);
    for (let i = 0; i < H; i++) {
        grid[i] = lines[i + 1].trim();
    }
    let sx = -1, sy = -1, tx = -1, ty = -1;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const ch = grid[i][j];
            if (ch === 'S') {
                sx = i;
                sy = j;
            }
            else if (ch === 'T') {
                tx = i;
                ty = j;
            }
        }
    }
    if (sx === -1 || sy === -1 || tx === -1 || ty === -1) {
        console.log(-1);
        return;
    }
    const dist = new Array(H * W).fill(Infinity);
    dist[sx * W + sy] = 0;
    const pq = new MinHeap();
    pq.push([0, sx, sy]);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (pq.size() > 0) {
        const [d, x, y] = pq.pop();
        if (d > dist[x * W + y])
            continue;
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= H || ny < 0 || ny >= W)
                continue;
            const ch = grid[nx][ny];
            if (ch === '#')
                continue;
            const cost = (ch === 'S' || ch === 'T') ? 0 : parseInt(ch, 10);
            const newDist = d + cost;
            if (newDist < dist[nx * W + ny]) {
                dist[nx * W + ny] = newDist;
                pq.push([newDist, nx, ny]);
            }
        }
    }
    const result = dist[tx * W + ty];
    console.log(result === Infinity ? -1 : result);
}
main();
