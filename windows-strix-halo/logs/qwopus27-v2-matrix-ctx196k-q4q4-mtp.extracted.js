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
const input = fs.readFileSync(0, "utf8").trim().split(/\s+/);
const ptr = { i: 0 };
const next = () => {
    return parseInt(input[ptr.i++], 10);
};
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
const upperBound = (arr, x) => {
    let left = 0, right = arr.length;
    while (left < right) {
        const mid = (left + right) >> 1;
        if (arr[mid] <= x) {
            left = mid + 1;
        }
        else {
            right = mid;
        }
    }
    return left;
};
const lowerBound = (arr, x) => {
    let left = 0, right = arr.length;
    while (left < right) {
        const mid = (left + right) >> 1;
        if (arr[mid] < x) {
            left = mid + 1;
        }
        else {
            right = mid;
        }
    }
    return left;
};
const answers = [];
for (let i = 0; i < Q; i++) {
    const x = next();
    const countL = upperBound(L, x);
    const countR = lowerBound(R, x);
    answers.push(String(countL - countR));
}
console.log(answers.join(" "));
