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
const input = fs.readFileSync(0, 'utf-8').trim().split(/\s+/);
const it = input[Symbol.iterator]();
const next = () => parseInt(it.next().value, 10);
const N = next();
const Q = next();
const L = new Array(N);
const R = new Array(N);
for (let i = 0; i < N; i++) {
    L[i] = next();
    R[i] = next();
}
L.sort((a, b) => a - b);
R.sort((a, b) => a - b);
const results = [];
for (let i = 0; i < Q; i++) {
    const x = next();
    // Find count of intervals where l <= x (upper bound for L)
    let lo = 0, hi = N;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (L[mid] <= x)
            lo = mid + 1;
        else
            hi = mid;
    }
    const countL = lo;
    // Find count of intervals where r < x (lower bound for R)
    lo = 0;
    hi = N;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (R[mid] < x)
            lo = mid + 1;
        else
            hi = mid;
    }
    const countR = lo;
    results.push(String(countL - countR));
}
process.stdout.write(results.join(' ') + '\n');
