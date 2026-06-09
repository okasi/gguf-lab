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
    less(a, b) {
        return a < b;
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    siftUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.less(this.data[i], this.data[parent])) {
                this.swap(i, parent);
                i = parent;
            }
            else {
                break;
            }
        }
    }
    siftDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.less(this.data[left], this.data[smallest])) {
                smallest = left;
            }
            if (right < n && this.less(this.data[right], this.data[smallest])) {
                smallest = right;
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
    push(item) {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0) {
            return undefined;
        }
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return root;
    }
    isEmpty() {
        return this.data.length === 0;
    }
}
const input = fs.readFileSync(0, "utf8").trim();
if (!input) {
    process.exit(0);
}
const lines = input.split('\n');
const [N, M] = lines[0].trim().split(/\s+/).map(Number);
const tasks = lines[1].trim().split(/\s+/);
const adj = new Map();
const inDegree = new Map();
for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}
for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].trim().split(/\s+/);
    const [A, B] = parts;
    adj.get(A).push(B);
    inDegree.set(B, inDegree.get(B) + 1);
}
const pq = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}
const result = [];
while (!pq.isEmpty()) {
    const task = pq.pop();
    result.push(task);
    const neighbors = adj.get(task);
    for (const neighbor of neighbors) {
        const deg = inDegree.get(neighbor) - 1;
        inDegree.set(neighbor, deg);
        if (deg === 0) {
            pq.push(neighbor);
        }
    }
}
if (result.length === N) {
    console.log(result.join(' '));
}
else {
    console.log('IMPOSSIBLE');
}
