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
    const input = fs.readFileSync(0, "utf8").trim();
    const tokens = input.split(/\s+/);
    const it = tokens[Symbol.iterator]();
    const N = parseInt(next(it), 10);
    const M = parseInt(next(it), 10);
    const tasks = [];
    for (let i = 0; i < N; i++) {
        tasks.push(next(it));
    }
    const adj = new Map();
    const inDeg = new Map();
    for (const t of tasks) {
        inDeg.set(t, 0);
        adj.set(t, []);
    }
    for (let i = 0; i < M; i++) {
        const A = next(it);
        const B = next(it);
        adj.get(A).push(B);
        inDeg.set(B, inDeg.get(B) + 1);
    }
    const heap = new MinHeap((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const t of tasks) {
        if (inDeg.get(t) === 0) {
            heap.push(t);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const cur = heap.pop();
        result.push(cur);
        const neighbors = adj.get(cur) || [];
        for (const nb of neighbors) {
            const newDeg = inDeg.get(nb) - 1;
            inDeg.set(nb, newDeg);
            if (newDeg === 0) {
                heap.push(nb);
            }
        }
    }
    if (result.length === N) {
        console.log(result.join(" "));
    }
    else {
        console.log("IMPOSSIBLE");
    }
}
function next(it) {
    const value = it.next();
    if (value.done)
        throw new Error("Unexpected end of input");
    return value.value;
}
class MinHeap {
    constructor(compare) {
        this.data = [];
        this.compare = compare;
    }
    push(item) {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            throw new Error("Heap empty");
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    peek() {
        if (this.data.length === 0)
            throw new Error("Heap empty");
        return this.data[0];
    }
    isEmpty() {
        return this.data.length === 0;
    }
    siftUp(idx) {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.compare(this.data[idx], this.data[parent]) < 0) {
                [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
                idx = parent;
            }
            else {
                break;
            }
        }
    }
    siftDown(idx) {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < n && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== idx) {
                [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
                idx = smallest;
            }
            else {
                break;
            }
        }
    }
}
main();
