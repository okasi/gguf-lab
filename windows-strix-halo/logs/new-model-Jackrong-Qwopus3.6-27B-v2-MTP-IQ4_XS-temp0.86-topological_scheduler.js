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
class MinHeap {
    constructor() {
        this.data = [];
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    parent(i) {
        return (i - 1) >> 1;
    }
    left(i) {
        return 2 * i + 1;
    }
    right(i) {
        return 2 * i + 2;
    }
    push(val) {
        this.data.push(val);
        this._siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this._siftDown(0);
        }
        return root;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    _siftUp(i) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.data[p] > this.data[i]) {
                this.swap(p, i);
                i = p;
            }
            else {
                break;
            }
        }
    }
    _siftDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l] < this.data[smallest]) {
                smallest = l;
            }
            if (r < n && this.data[r] < this.data[smallest]) {
                smallest = r;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            }
            else {
                break;
            }
        }
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const tokens = input.split(/\s+/);
    let idx = 0;
    const N = parseInt(tokens[idx++], 10);
    const M = parseInt(tokens[idx++], 10);
    const tasks = new Array(N);
    const nameToIndex = new Map();
    for (let i = 0; i < N; i++) {
        tasks[i] = tokens[idx++];
        nameToIndex.set(tasks[i], i);
    }
    const adj = Array.from({ length: N }, () => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const u = tokens[idx++];
        const v = tokens[idx++];
        const uIdx = nameToIndex.get(u);
        const vIdx = nameToIndex.get(v);
        adj[uIdx].push(vIdx);
        inDegree[vIdx]++;
    }
    const heap = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(tasks[i]);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const u = heap.pop();
        if (u === undefined)
            break;
        const uIdx = nameToIndex.get(u);
        result.push(u);
        for (const vIdx of adj[uIdx]) {
            inDegree[vIdx]--;
            if (inDegree[vIdx] === 0) {
                heap.push(tasks[vIdx]);
            }
        }
    }
    if (result.length < N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(' '));
    }
}
main();
