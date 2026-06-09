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
function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\s+/);
    let idx = 0;
    const N = parseInt(input[idx++], 10);
    const Q = parseInt(input[idx++], 10);
    const lefts = new Array(N);
    const rights = new Array(N);
    for (let i = 0; i < N; i++) {
        lefts[i] = parseInt(input[idx++], 10);
        rights[i] = parseInt(input[idx++], 10);
    }
    lefts.sort((a, b) => a - b);
    rights.sort((a, b) => a - b);
    const answers = new Array(Q);
    for (let i = 0; i < Q; i++) {
        const q = parseInt(input[idx++], 10);
        const l = upperBound(lefts, q);
        const r = lowerBound(rights, q);
        answers[i] = String(l - r);
    }
    process.stdout.write(answers.join(' ') + '\n');
}
function upperBound(arr, target) {
    let l = 0, r = arr.length;
    while (l < r) {
        const mid = (l + r) >>> 1;
        if (arr[mid] <= target) {
            l = mid + 1;
        }
        else {
            r = mid;
        }
    }
    return l;
}
function lowerBound(arr, target) {
    let l = 0, r = arr.length;
    while (l < r) {
        const mid = (l + r) >>> 1;
        if (arr[mid] < target) {
            l = mid + 1;
        }
        else {
            r = mid;
        }
    }
    return l;
}
main();
