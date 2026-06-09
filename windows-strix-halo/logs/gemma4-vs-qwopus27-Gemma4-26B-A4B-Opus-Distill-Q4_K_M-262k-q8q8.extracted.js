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
    const input = fs.readFileSync(0);
    let offset = 0;
    function nextInt() {
        while (offset < input.length && input[offset] <= 32)
            offset++;
        if (offset >= input.length)
            return null;
        let neg = false;
        if (input[offset] === 45) {
            neg = true;
            offset++;
        }
        let res = 0;
        while (offset < input.length && input[offset] >= 48 && input[offset] <= 57) {
            res = res * 10 + (input[offset] - 48);
            offset++;
        }
        return neg ? -res : res;
    }
    const firstN = nextInt();
    const firstQ = nextInt();
    if (firstN === null || firstQ === null)
        return;
    const N = firstN;
    const Q = firstQ;
    const L = new Int32Array(N);
    const R = new Int32Array(N);
    for (let i = 0; i < N; i++) {
        const l = nextInt();
        const r = nextInt();
        if (l === null || r === null)
            break;
        L[i] = l;
        R[i] = r;
    }
    L.sort();
    R.sort();
    function lowerBound(arr, x) {
        let low = 0, high = arr.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (arr[mid] < x)
                low = mid + 1;
            else
                high = mid;
        }
        return low;
    }
    function upperBound(arr, x) {
        let low = 0, high = arr.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (arr[mid] <= x)
                low = mid + 1;
            else
                high = mid;
        }
        return low;
    }
    const answers = new Array(Q);
    for (let i = 0; i < Q; i++) {
        const x = nextInt();
        if (x === null)
            break;
        const countL = upperBound(L, x);
        const countR = lowerBound(R, x);
        answers[i] = countL - countR;
    }
    process.stdout.write(answers.join(' ') + '\n');
}
solve();
