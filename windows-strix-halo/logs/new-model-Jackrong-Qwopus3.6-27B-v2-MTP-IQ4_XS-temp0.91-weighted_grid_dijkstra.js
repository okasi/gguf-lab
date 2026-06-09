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
const data = fs.readFileSync(0, 'utf8').trim().split('\n');
const [H, W] = data[0].split(' ').map(Number);
const grid = [];
for (let i = 0; i < H; i++) {
    grid.push(data[i + 1].split(''));
}
const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
let startH = -1, startW = -1;
for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === 'S') {
            startH = i;
            startW = j;
        }
    }
}
dist[startH][startW] = 0;
// Priority queue: [cost, h, w]
const pq = [];
const addPq = (cost, h, w) => {
    pq.push([cost, h, w]);
    pq.sort((a, b) => a[0] - b[0]);
};
addPq(0, startH, startW);
while (pq.length > 0) {
    const [d, h, w] = pq.shift();
    if (d > dist[h][w])
        continue;
    if (grid[h][w] === 'T') {
        console.log(d);
        process.exit(0);
    }
    for (const [dh, dw] of dirs) {
        const nh = h + dh;
        const nw = w + dw;
        if (nh < 0 || nh >= H || nw < 0 || nw >= W)
            continue;
        const ch = grid[nh][nw];
        if (ch === '#')
            continue;
        let cost = 0;
        if (ch >= '0' && ch <= '9') {
            cost = parseInt(ch, 10);
        }
        const nd = d + cost;
        if (nd < dist[nh][nw]) {
            dist[nh][nw] = nd;
            addPq(nd, nh, nw);
        }
    }
}
console.log(-1);
