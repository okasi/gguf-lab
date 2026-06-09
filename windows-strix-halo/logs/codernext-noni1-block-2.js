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
// ... implementation ...
const main = () => {
    const rawInput = fs.readFileSync(0, "utf8");
    const lines = rawInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2)
        return; // Handle edge case if needed
    // Parse N and Q
    const firstLine = lines[0].split(/\s+/).map(Number);
    const N = firstLine[0];
    const Q = firstLine[1];
    // Parse Intervals
    const intervals = [];
    for (let i = 1; i <= N; i++) {
        const [l, r] = lines[i].split(/\s+/).map(Number);
        intervals.push([l, r]);
    }
    // Parse Queries
    // The remaining lines contain the query points.
    // We expect Q integers.
    const queryTokens = [];
    for (let i = N + 1; i < lines.length; i++) {
        const nums = lines[i].split(/\s+/).map(Number);
        queryTokens.push(...nums);
    }
    // Ensure we have enough tokens
    const queries = queryTokens.slice(0, Q);
    // Prepare Events
    // Type 0: Start, Type 1: Query, Type 2: End
    const events = [];
    for (let i = 0; i < N; i++) {
        const [l, r] = intervals[i];
        events.push({ pos: l, type: 0 }); // Start
        events.push({ pos: r, type: 2 }); // End
    }
    for (let i = 0; i < Q; i++) {
        events.push({ pos: queries[i], type: 1, idx: i });
    }
    // Sort Events
    // Primary key: pos
    // Secondary key: type (Start < Query < End)
    events.sort((a, b) => {
        if (a.pos !== b.pos) {
            return a.pos - b.pos;
        }
        return a.type - b.type;
    });
    // Process Events
    const ans = new Array(Q).fill(0);
    let activeIntervals = 0;
    for (const e of events) {
        if (e.type === 0) {
            activeIntervals++;
        }
        else if (e.type === 1) {
            ans[e.idx] = activeIntervals;
        }
        else {
            activeIntervals--;
        }
    }
    console.log(ans.join(' '));
};
main();
