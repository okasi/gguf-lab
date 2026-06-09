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
    push(item) {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    peek() {
        return this.heap[0];
    }
    get size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    leftChild(i) {
        return 2 * i + 1;
    }
    rightChild(i) {
        return 2 * i + 2;
    }
    siftUp(i) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.compare(this.heap[p], this.heap[i]) <= 0)
                break;
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }
    siftDown(i) {
        while (this.leftChild(i) < this.heap.length) {
            let smallest = i;
            const l = this.leftChild(i);
            const r = this.rightChild(i);
            if (this.compare(this.heap[l], this.heap[smallest]) < 0)
                smallest = l;
            if (r < this.heap.length && this.compare(this.heap[r], this.heap[smallest]) < 0)
                smallest = r;
            if (smallest === i)
                break;
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }
}
const input = fs.readFileSync(0, "utf8").trim();
if (!input) {
    console.log("IMPOSSIBLE");
}
else {
    const lines = input.split("\n");
    const [N, M] = lines[0].split(" ").map(Number);
    const names = lines[1].split(" ");
    const adj = new Map();
    const inDegree = new Map();
    for (const name of names) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const [a, b] = line.split(" ");
        if (!a || !b)
            continue;
        if (!adj.has(a))
            adj.set(a, []);
        if (!adj.has(b))
            adj.set(b, []);
        adj.get(a).push(b);
        inDegree.set(b, (inDegree.get(b) || 0) + 1);
    }
    const pq = new MinHeap((a, b) => a.localeCompare(b));
    for (const name of names) {
        if (inDegree.get(name) === 0) {
            pq.push(name);
        }
    }
    const order = [];
    while (!pq.isEmpty()) {
        const u = pq.pop();
        order.push(u);
        const neighbors = adj.get(u);
        for (const v of neighbors) {
            inDegree.set(v, inDegree.get(v) - 1);
            if (inDegree.get(v) === 0) {
                pq.push(v);
            }
        }
    }
    if (order.length < N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(order.join(" "));
    }
}
