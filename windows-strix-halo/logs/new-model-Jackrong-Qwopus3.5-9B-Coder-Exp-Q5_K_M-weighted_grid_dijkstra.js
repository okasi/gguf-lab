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
function minCostPath() {
    const data = fs.readFileSync(0, "utf8");
    const lines = data.split("\n").filter((line) => line.trim().length > 0);
    if (lines.length < 2)
        return -1;
    const [HStr, WStr, ...gridLines] = lines;
    const H = parseInt(HStr, 10);
    const W = parseInt(WStr, 10);
    if (H <= 0 || W <= 0)
        return -1;
    const grid = [];
    for (let i = 0; i < H; i++) {
        grid.push(gridLines[i].split(""));
    }
    let start = null;
    let target = null;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const ch = grid[r][c];
            if (ch === "S") {
                start = { r, c, cost: 0 };
            }
            else if (ch === "T") {
                target = { r, c, cost: 0 };
            }
        }
    }
    if (!start || !target)
        return -1;
    const INF = Number.MAX_SAFE_INTEGER;
    const dist = Array.from({ length: H }, () => Array(W).fill(INF));
    dist[start.r][start.c] = 0;
    const pq = [[0, start]];
    const dir = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
    ];
    while (pq.length > 0) {
        let minCost = INF;
        let minIdx = -1;
        for (let i = 0; i < pq.length; i++) {
            if (pq[i][0] < minCost) {
                minCost = pq[i][0];
                minIdx = i;
            }
        }
        if (minIdx === -1)
            break;
        const [cost, { r: curR, c: curC }] = pq.splice(minIdx, 1)[0];
        if (curR === target.r && curC === target.c) {
            return cost;
        }
        if (cost > dist[curR][curC])
            continue;
        for (const [dr, dc] of dir) {
            const nr = curR + dr;
            const nc = curC + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const ch = grid[nr][nc];
            if (ch === "#")
                continue;
            let cellCost = 0;
            if (ch >= "0" && ch <= "9") {
                cellCost = parseInt(ch, 10);
            }
            const newCost = cost + cellCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.push([newCost, { r: nr, c: nc, cost: cellCost }]);
            }
        }
    }
    return -1;
}
console.log(minCostPath());
