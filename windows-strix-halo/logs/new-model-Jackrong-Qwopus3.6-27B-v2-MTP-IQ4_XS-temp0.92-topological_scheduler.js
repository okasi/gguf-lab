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
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');
const [N, M] = lines[0].split(' ').map(Number);
const tasks = lines.length > 1 ? lines[1].split(' ').filter(s => s !== '') : [];
const adj = new Map();
const inDegree = new Map();
for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
}
for (let i = 0; i < M; i++) {
    const idx = 2 + i;
    if (idx < lines.length) {
        const parts = lines[idx].split(' ');
        const u = parts[0];
        const v = parts[1];
        if (adj.has(u) && adj.has(v)) {
            adj.get(u).push(v);
            inDegree.set(v, inDegree.get(v) + 1);
        }
    }
}
class MinHeap {
    constructor() {
        this.data = [];
    }
    push(val) {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const root = this.data[0];
        const end = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = end;
            this.bubbleDown(0);
        }
        return root;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.data[idx] < this.data[parent]) {
                [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
                idx = parent;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(idx) {
        const n = this.data.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < n && this.data[right] < this.data[smallest]) {
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
const heap = new MinHeap();
for (const t of tasks) {
    if (inDegree.get(t) === 0) {
        heap.push(t);
    }
}
const result = [];
while (!heap.isEmpty()) {
    const u = heap.pop();
    result.push(u);
    const neighbors = adj.get(u);
    for (const v of neighbors) {
        const d = inDegree.get(v) - 1;
        inDegree.set(v, d);
        if (d === 0) {
            heap.push(v);
        }
    }
}
if (result.length < N) {
    console.log("IMPOSSIBLE");
}
else {
    console.log(result.join(' '));
}
