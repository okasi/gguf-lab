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
const input = fs.readFileSync('/dev/stdin', 'utf8');
const tokens = input.trim().split(/\s+/);
let idx = 0;
const N = parseInt(tokens[idx++], 10);
const Q = parseInt(tokens[idx++], 10);
const starts = new Array(N);
const ends = new Array(N);
for (let i = 0; i < N; i++) {
    starts[i] = parseInt(tokens[idx++], 10);
    ends[i] = parseInt(tokens[idx++], 10);
}
starts.sort((a, b) => a - b);
ends.sort((a, b) => a - b);
const queries = new Array(Q);
for (let i = 0; i < Q; i++) {
    queries[i] = [parseInt(tokens[idx++], 10), i];
}
function upperBound(arr, val) {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = (left + right) >> 1;
        if (arr[mid] <= val) {
            left = mid + 1;
        }
        else {
            right = mid;
        }
    }
    return left;
}
function lowerBound(arr, val) {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = (left + right) >> 1;
        if (arr[mid] < val) {
            left = mid + 1;
        }
        else {
            right = mid;
        }
    }
    return left;
}
const results = new Array(Q);
for (const [val, originalIdx] of queries) {
    const countL = upperBound(starts, val);
    const countR = lowerBound(ends, val);
    results[originalIdx] = countL - countR;
}
console.log(results.join(' '));
