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
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input)
        return;
    const tokens = input.split(/\s+/);
    let idx = 0;
    const N = parseInt(tokens[idx++], 10);
    const M = parseInt(tokens[idx++], 10);
    const nameToIdx = new Map();
    const idxToName = new Array(N);
    for (let i = 0; i < N; i++) {
        const name = tokens[idx++];
        nameToIdx.set(name, i);
        idxToName[i] = name;
    }
    const adj = new Array(N);
    for (let i = 0; i < N; i++)
        adj[i] = [];
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const uStr = tokens[idx++];
        const vStr = tokens[idx++];
        const u = nameToIdx.get(uStr);
        const v = nameToIdx.get(vStr);
        adj[u].push(v);
        inDegree[v]++;
    }
    class MinHeap {
        constructor(idxToName) {
            this.heap = [];
            this.idxToName = idxToName;
        }
        compare(a, b) {
            const nameA = this.idxToName[a];
            const nameB = this.idxToName[b];
            if (nameA < nameB)
                return -1;
            if (nameA > nameB)
                return 1;
            return 0;
        }
        swap(i, j) {
            [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
        }
        push(val) {
            this.heap.push(val);
            let i = this.heap.length - 1;
            while (i > 0) {
                const parent = Math.floor((i - 1) / 2);
                if (this.compare(this.heap[i], this.heap[parent]) < 0) {
                    this.swap(i, parent);
                    i = parent;
                }
                else {
                    break;
                }
            }
        }
        pop() {
            if (this.heap.length === 1)
                return this.heap.pop();
            const top = this.heap[0];
            this.heap[0] = this.heap.pop();
            let i = 0;
            const size = this.heap.length;
            while (true) {
                let smallest = i;
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                if (left < size && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                    smallest = left;
                }
                if (right < size && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                    smallest = right;
                }
                if (smallest === i)
                    break;
                this.swap(i, smallest);
                i = smallest;
            }
            return top;
        }
        isEmpty() {
            return this.heap.length === 0;
        }
    }
    const heap = new MinHeap(idxToName);
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(i);
        }
    }
    const result = [];
    while (!heap.isEmpty()) {
        const u = heap.pop();
        result.push(idxToName[u]);
        for (const v of adj[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                heap.push(v);
            }
        }
    }
    if (result.length < N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(result.join(" "));
    }
}
solve();
