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
    constructor(compare) {
        this.heap = [];
        this.compare = compare;
    }
    size() {
        return this.heap.length;
    }
    push(val) {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }
    pop() {
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return min;
    }
    siftUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.compare(this.heap[i], this.heap[parent]) < 0) {
                [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
                i = parent;
            }
            else {
                break;
            }
        }
    }
    siftDown(i) {
        while (i < this.heap.length) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;
            if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
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
    if (!input) {
        return;
    }
    const tokens = input.split(/\s+/);
    let idx = 0;
    const N = parseInt(tokens[idx++], 10);
    const M = parseInt(tokens[idx++], 10);
    const taskNames = [];
    const nameToId = new Map();
    for (let i = 0; i < N; i++) {
        const name = tokens[idx++];
        taskNames.push(name);
        nameToId.set(name, i);
    }
    const adj = Array.from({ length: N }, () => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 0; i < M; i++) {
        const a = tokens[idx++];
        const b = tokens[idx++];
        const u = nameToId.get(a);
        const v = nameToId.get(b);
        if (u !== undefined && v !== undefined) {
            adj[u].push(v);
            inDegree[v]++;
        }
    }
    const pq = new MinHeap((a, b) => a.localeCompare(b));
    const result = [];
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(taskNames[i]);
        }
    }
    while (pq.size() > 0) {
        const u = pq.pop();
        result.push(u);
        const uId = nameToId.get(u);
        for (const vId of adj[uId]) {
            inDegree[vId]--;
            if (inDegree[vId] === 0) {
                pq.push(taskNames[vId]);
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
main();
