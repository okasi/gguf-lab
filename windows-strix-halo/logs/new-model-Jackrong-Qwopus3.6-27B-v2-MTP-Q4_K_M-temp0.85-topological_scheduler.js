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
        const t = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = t;
    }
    push(val) {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return null;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    peek() {
        return this.data.length === 0 ? null : this.data[0];
    }
    size() {
        return this.data.length;
    }
    siftUp(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.data[p] > this.data[i]) {
                this.swap(i, p);
                i = p;
            }
            else
                break;
        }
    }
    siftDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.data[l] < this.data[smallest])
                smallest = l;
            if (r < n && this.data[r] < this.data[smallest])
                smallest = r;
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            }
            else
                break;
        }
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [N, M] = lines[0].split(/\s+/).map(Number);
    const tasks = lines[1].split(/\s+/).map(s => s.trim());
    const adj = new Map();
    const inDegree = new Map();
    for (const t of tasks) {
        adj.set(t, []);
        inDegree.set(t, 0);
    }
    for (let i = 0; i < M; i++) {
        const [A, B] = lines[2 + i].split(/\s+/);
        adj.get(A).push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }
    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            heap.push(t);
        }
    }
    const result = [];
    while (true) {
        const task = heap.pop();
        if (task === null)
            break;
        result.push(task);
        for (const neighbor of adj.get(task)) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }
    if (result.length < N) {
        console.log('IMPOSSIBLE');
    }
    else {
        console.log(result.join(' '));
    }
}
main();
