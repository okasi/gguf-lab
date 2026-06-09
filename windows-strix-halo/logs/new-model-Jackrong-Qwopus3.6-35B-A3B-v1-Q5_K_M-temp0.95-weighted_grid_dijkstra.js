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
    push(val) {
        this.data.push(val);
        this._up(this.data.length - 1);
    }
    pop() {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this._down(0);
        }
        return top;
    }
    get size() { return this.data.length; }
    _up(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.data[p][0] <= this.data[i][0])
                break;
            [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
            i = p;
        }
    }
    _down(i) {
        const n = this.data.length;
        while (true) {
            let s = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
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
function main() {
    const raw = fs.readFileSync(0, "utf8").trim();
    const lines = raw.split("\n");
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);
    const grid = [];
    let sy = -1, sx = -1, ty = -1, tx = -1;
    for (let y = 0; y < H; y++) {
        const line = lines[y + 1].trim();
        grid.push(line);
        for (let x = 0; x < W; x++) {
            const c = line[x];
            if (c === "S") {
                sy = y;
                sx = x;
            }
            else if (c === "T") {
                ty = y;
                tx = x;
            }
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new MinHeap();
    dist[sy][sx] = 0;
    pq.push([0, sy, sx]);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (pq.size > 0) {
        const [cost, y, x] = pq.pop();
        if (cost > dist[y][x])
            continue;
        if (y === ty && x === tx) {
            console.log(cost);
            return;
        }
        for (const [dy, dx] of dirs) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny < 0 || ny >= H || nx < 0 || nx >= W)
                continue;
            const cell = grid[ny][nx];
            if (cell === "#")
                continue;
            const cellCost = cell === "S" || cell === "T" ? 0 : parseInt(cell);
            const newCost = cost + cellCost;
            if (newCost < dist[ny][nx]) {
                dist[ny][nx] = newCost;
                pq.push([newCost, ny, nx]);
            }
        }
    }
    console.log(-1);
}
main();
