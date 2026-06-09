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
const data = fs.readFileSync(0, 'utf8').trim().split(/\s+/);
let idx = 0;
const N = parseInt(data[idx++], 10);
const Q = parseInt(data[idx++], 10);
const lArr = new Array(N);
const rArr = new Array(N);
for (let i = 0; i < N; i++) {
    lArr[i] = parseInt(data[idx++], 10);
    rArr[i] = parseInt(data[idx++], 10);
}
const queries = new Array(Q);
for (let i = 0; i < Q; i++) {
    queries[i] = parseInt(data[idx++], 10);
}
lArr.sort((a, b) => a - b);
rArr.sort((a, b) => a - b);
function upperBound(arr, x) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid] <= x)
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}
function lowerBound(arr, x) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid] < x)
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}
const results = [];
for (let i = 0; i < Q; i++) {
    const x = queries[i];
    const cnt = upperBound(lArr, x) - lowerBound(rArr, x);
    results.push(cnt.toString());
}
process.stdout.write(results.join(' '));
