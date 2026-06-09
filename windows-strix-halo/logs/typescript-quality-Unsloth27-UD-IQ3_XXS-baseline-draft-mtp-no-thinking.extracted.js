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
function solve() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\s+/);
    let idx = 0;
    const N = parseInt(input[idx++], 10);
    const Q = parseInt(input[idx++], 10);
    const intervals = [];
    for (let i = 0; i < N; i++) {
        const l = parseInt(input[idx++], 10);
        const r = parseInt(input[idx++], 10);
        intervals.push([l, r]);
    }
    const queries = [];
    for (let i = 0; i < Q; i++) {
        queries.push(parseInt(input[idx++], 10));
    }
    const criticalPoints = [];
    // Add interval boundaries
    for (let i = 0; i < N; i++) {
        const [l, r] = intervals[i];
        criticalPoints.push({ coord: l, type: 'start', index: i });
        criticalPoints.push({ coord: r + 1, type: 'end', index: i });
    }
    // Add query points
    for (let i = 0; i < Q; i++) {
        criticalPoints.push({ coord: queries[i], type: 'query', index: i });
    }
    // Sort critical points by coordinate, then by type:
    // 'start' comes before 'query', 'query' comes before 'end'
    // This ensures that at a point x:
    // - All intervals starting at x are counted
    // - All queries at x are processed
    // - All intervals ending at x-1 (i.e., end+1 = x) are removed
    criticalPoints.sort((a, b) => {
        if (a.coord !== b.coord) {
            return a.coord - b.coord;
        }
        // Order: start < query < end
        const typeOrder = { 'start': 0, 'query': 1, 'end': 2 };
        return typeOrder[a.type] - typeOrder[b.type];
    });
    // Sweep line
    let currentCount = 0;
    const answers = new Array(Q);
    for (const cp of criticalPoints) {
        if (cp.type === 'start') {
            currentCount++;
        }
        else if (cp.type === 'end') {
            currentCount--;
        }
        else { // query
            answers[cp.index] = currentCount;
        }
    }
    // Output answers space-separated
    console.log(answers.join(' '));
}
solve();
