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
// Read input
const input = fs.readFileSync(0, 'utf8').trim().split('\n');
let idx = 0;
const [N, Q] = input[idx++].split(' ').map(Number);
const intervals = [];
for (let i = 0; i < N; i++) {
    const [l, r] = input[idx++].split(' ').map(Number);
    intervals.push([l, r]);
}
const queries = input[idx].split(' ').map(Number);
// Note: The problem says "Last line: Q integers".
// Sometimes input might have extra newlines or spaces. 
// `input[idx].split(' ')` handles multiple spaces.
// If Q is large, splitting the last line is sufficient.
// However, `input` array might contain empty strings if there are trailing newlines.
// `trim()` handles trailing newlines.
// If the last line has Q integers, `input[idx]` should have them.
// But wait, `input` is lines.
// If N=2, Q=3.
// Line 0: "2 3"
// Line 1: "1 5"
// Line 2: "2 6"
// Line 3: "1 2 3"
// So `idx` starts at 3. `input[3]` has "1 2 3".
// `input.length` might be 4.
// If `input[idx]` is undefined, we might need to look at previous lines?
// Usually `readFileSync` gives the whole file.
// `trim().split('\n')` creates an array of lines.
// If the last line doesn't end with \n, it's still one element.
// If there are blank lines at the end, `trim()` removes them.
// So `input` contains only non-empty lines roughly.
// Wait, `trim()` removes leading/trailing whitespace including newlines.
// So `input` will have exactly the content lines.
// Number of lines should be $2 + N$ (if last line is separate) or $1 + N$ (if last line is merged)?
// Problem description: "Next N lines: l r". "Last line: Q integers".
// This implies the Q integers are on a single line at the end.
// So total lines = 1 (header) + N (intervals) + 1 (queries) = N + 2.
// However, standard competitive programming inputs might vary.
// To be safe, I'll parse all tokens from the input string rather than strictly relying on line counts for the query part, though the spec is strict.
// Actually, `split(' ')` on the last line works if they are space separated.
// If the last line is missing or empty, `input[idx]` might be undefined.
// Let's collect all remaining tokens.
// Better approach: Flatten all words from all lines.
const allTokens = input.flatMap(line => line.split(' ').filter(Boolean));
let tokenIdx = 0;
const N2 = parseInt(allTokens[tokenIdx++]);
const Q2 = parseInt(allTokens[tokenIdx++]);
const intervals2 = [];
for (let i = 0; i < N2; i++) {
    const l = parseInt(allTokens[tokenIdx++]);
    const r = parseInt(allTokens[tokenIdx++]);
    intervals2.push([l, r]);
}
const queries2 = [];
for (let i = 0; i < Q2; i++) {
    queries2.push(parseInt(allTokens[tokenIdx++]));
}
// Use N2, Q2, intervals2, queries2.
