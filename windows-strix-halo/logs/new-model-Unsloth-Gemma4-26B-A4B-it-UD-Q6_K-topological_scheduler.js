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
        this.compare = compare;
        this.heap = [];
    }
    push(val) {
        this.heap.push(val);
        let idx = this.heap.length - 1;
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.compare(this.heap[idx], this.heap[parent]) < 0) {
                const tmp = this.heap[idx];
                this.heap[idx] = this.heap[parent];
                this.heap[parent] = tmp;
                idx = parent;
            }
            else {
                break;
            }
        }
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            let idx = 0;
            while (true) {
                const left = (idx << 1) + 1;
                const right = (idx << 1) + 2;
                let smallest = idx;
                if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                    smallest = left;
                }
                if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                    smallest = right;
                }
                if (smallest !== idx) {
                    const tmp = this.heap[idx];
                    this.heap[idx] = this.heap[smallest];
                    this.heap[smallest] = tmp;
                    idx = smallest;
                }
                else {
                    break;
                }
            }
        }
        return top;
    }
    size() {
        return this.heap.length;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 2)
        return;
    let cursor = 0;
    const N = parseInt(tokens[cursor++]);
    const M = parseInt(tokens[cursor++]);
    const taskNames = [];
    for (let i = 0; i < N; i++) {
        taskNames.push(tokens[cursor++]);
    }
    const adj = new Map();
    const inDegree = new Map();
    for (const name of taskNames) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }
    for (let i = 0; i < M; i++) {
        const u = tokens[cursor++];
        const v = tokens[cursor++];
        if (u !== undefined && v !== undefined) {
            adj.get(u).push(v);
            inDegree.set(v, (inDegree.get(v) || 0) + 1);
        }
    }
    const pq = new MinHeap((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const name of taskNames) {
        if ((inDegree.get(name) || 0) === 0) {
            pq.push(name);
        }
    }
    const result = [];
    while (pq.size() > 0) {
        const u = pq.pop();
        result.push(u);
        const neighbors = adj.get(u);
        if (neighbors) {
            for (const v of neighbors) {
                const currentInDegree = inDegree.get(v) - 1;
                inDegree.set(v, currentInDegree);
                if (currentInDegree === 0) {
                    pq.push(v);
                }
            }
        }
    }
    if (result.length === N) {
        process.stdout.write(result.join(" ") + "\n");
    }
    else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}
main();
