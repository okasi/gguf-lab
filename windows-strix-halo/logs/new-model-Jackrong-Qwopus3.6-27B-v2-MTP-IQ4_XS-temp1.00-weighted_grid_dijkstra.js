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
function minHeapifyDown(heap, index) {
    const len = heap.length;
    while (true) {
        let smallest = index;
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        if (left < len && heap[left][0] < heap[smallest][0]) {
            smallest = left;
        }
        if (right < len && heap[right][0] < heap[smallest][0]) {
            smallest = right;
        }
        if (smallest !== index) {
            [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
            index = smallest;
        }
        else {
            break;
        }
    }
}
function minHeapifyUp(heap, index) {
    while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (heap[index][0] < heap[parent][0]) {
            [heap[index], heap[parent]] = [heap[parent], heap[index]];
            index = parent;
        }
        else {
            break;
        }
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [H, W] = lines[0].split(/\s+/).map(Number);
    const grid = lines.slice(1);
    let startX = -1;
    let startY = -1;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (grid[y][x] === 'S') {
                startX = x;
                startY = y;
            }
        }
    }
    const dist = Array.from({ length: H }, () => new Array(W).fill(Infinity));
    dist[startY][startX] = 0;
    const pq = [[0, startX, startY]];
    const dx = [-1, 1, 0, 0];
    const dy = [0, 0, -1, 1];
    while (pq.length > 0) {
        const minNode = pq[0];
        pq[0] = pq[pq.length - 1];
        pq.pop();
        minHeapifyDown(pq, 0);
        const [cost, cx, cy] = minNode;
        if (cost > dist[cy][cx])
            continue;
        if (grid[cy][cx] === 'T') {
            console.log(cost);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nx = cx + dx[i];
            const ny = cy + dy[i];
            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                const c = grid[ny][nx];
                if (c === '#')
                    continue;
                let nextCost = 0;
                if (c >= '0' && c <= '9') {
                    nextCost = parseInt(c, 10);
                }
                else if (c === 'T') {
                    nextCost = 0;
                }
                const newCost = cost + nextCost;
                if (newCost < dist[ny][nx]) {
                    dist[ny][nx] = newCost;
                    pq.push([newCost, nx, ny]);
                    minHeapifyUp(pq, pq.length - 1);
                }
            }
        }
    }
    console.log(-1);
}
main();
`` `
;
