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
const data = fs.readFileSync(0, "utf8").trim().split(/\r?\n/);
let H = parseInt(data[0].split(' ')[0]);
let W = parseInt(data[0].split(' ')[1]);
const grid = [];
let startR = -1, startC = -1;
for (let i = 0; i < H; i++) {
    grid.push(data[i + 1]);
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === 'S') {
            startR = i;
            startC = j;
        }
    }
}
const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[startR][startC] = 0;
const heap = [[0, startR, startC]];
const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
        let p = (i - 1) >> 1;
        if (heap[p][0] <= item[0])
            break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
    }
};
const pop = () => {
    if (heap.length === 0)
        return null;
    const top = heap[0];
    heap[0] = heap[heap.length - 1];
    heap.pop();
    let i = 0;
    const n = heap.length;
    while (true) {
        let minIdx = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        if (left < n && heap[left][0] < heap[minIdx][0])
            minIdx = left;
        if (right < n && heap[right][0] < heap[minIdx][0])
            minIdx = right;
        if (minIdx === i)
            break;
        [heap[i], heap[minIdx]] = [heap[minIdx], heap[i]];
        i = minIdx;
    }
    return top;
};
const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
while (heap.length > 0) {
    const [d, r, c] = pop();
    if (d > dist[r][c])
        continue;
    if (grid[r][c] === 'T')
        return d;
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W)
            continue;
        const cell = grid[nr][nc];
        if (cell === '#')
            continue;
        let cost = 0;
        if (cell >= '0' && cell <= '9') {
            cost = parseInt(cell);
        }
        // S and T cost 0 to enter.
        if (dist[r][c] + cost < dist[nr][nc]) {
            dist[nr][nc] = dist[r][c] + cost;
            push([dist[nr][nc], nr, nc]);
        }
    }
}
console.log(-1);
