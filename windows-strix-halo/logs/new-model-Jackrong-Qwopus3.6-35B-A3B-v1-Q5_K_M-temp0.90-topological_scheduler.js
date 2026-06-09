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
        this.heap = [];
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
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return top;
    }
    bubbleUp(i) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.heap[p] <= this.heap[i]) {
                break;
            }
            this.swap(p, i);
            i = p;
        }
    }
    bubbleDown(i) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.heap[l] < this.heap[smallest]) {
                smallest = l;
            }
            if (r < n && this.heap[r] < this.heap[smallest]) {
                smallest = r;
            }
            if (smallest === i) {
                break;
            }
            this.swap(i, smallest);
            i = smallest;
        }
    }
    get size() {
        return this.heap.length;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length === 0) {
        return;
    }
    const lines = input.split('\n');
    const [nStr, mStr] = lines[0].split(' ');
    const N = parseInt(nStr, 10);
    const M = parseInt(mStr, 10);
    const tasks = lines[1].split(' ');
    const adj = new Map();
    const inDegree = new Map();
    const pq = new MinHeap();
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    for (let i = 2; i < 2 + M; i++) {
        const parts = lines[i].trim().split(' ');
        const from = parts[0];
        const to = parts[1];
        adj.get(from).push(to);
        inDegree.set(to, inDegree.get(to) + 1);
    }
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }
    const result = [];
    while (pq.size > 0) {
        const task = pq.pop();
        result.push(task);
        for (const neighbor of adj.get(task)) {
            const deg = inDegree.get(neighbor);
            if (deg === 1) {
                pq.push(neighbor);
            }
            inDegree.set(neighbor, deg - 1);
        }
    }
    if (result.length < N) {
        process.stdout.write("IMPOSSIBLE\n");
    }
    else {
        process.stdout.write(result.join(' ') + "\n");
    }
}
main();
