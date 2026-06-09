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
        if (this.data.length === 0)
            return null;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    get size() {
        return this.data.length;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.data[parent].cost <= this.data[i].cost)
                break;
            [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
            i = parent;
        }
    }
    bubbleDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.data[left].cost < this.data[smallest].cost)
                smallest = left;
            if (right < n && this.data[right].cost < this.data[smallest].cost)
                smallest = right;
            if (smallest === i)
                break;
            [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
            i = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return -1;
    const lines = input.split("\n");
    const [H, W] = lines[0].split(" ").map(Number);
    const grid = lines.slice(1);
    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const ch = grid[r][c];
            if (ch === "S") {
                startR = r;
                startC = c;
            }
            else if (ch === "T") {
                targetR = r;
                targetC = c;
            }
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    const heap = new MinHeap();
    heap.push({ cost: 0, r: startR, c: startC });
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (heap.size > 0) {
        const item = heap.pop();
        if (!item)
            continue;
        const { cost, r, c } = item;
        if (cost > dist[r][c])
            continue;
        if (r === targetR && c === targetC)
            return cost;
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const nch = grid[nr][nc];
            if (nch === "#")
                continue;
            const nCost = nch === "S" || nch === "T" ? 0 : parseInt(nch, 10);
            const newCost = cost + nCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                heap.push({ cost: newCost, r: nr, c: nc });
            }
        }
    }
    return -1;
}
console.log(solve());
