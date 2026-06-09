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
class MinBinaryHeap {
    constructor(compare) {
        this.data = [];
        this.compare = compare;
    }
    get size() {
        return this.data.length;
    }
    push(value) {
        this.data.push(value);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return root;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.data[index], this.data[parent]) >= 0)
                break;
            [this.data[index], this.data[parent]] = [this.data[parent], this.data[index]];
            index = parent;
        }
    }
    bubbleDown(index) {
        const length = this.data.length;
        while (true) {
            let smallest = index;
            const left = index * 2 + 1;
            const right = index * 2 + 2;
            if (left < length && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < length && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === index)
                break;
            [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
            index = smallest;
        }
    }
}
const input = fs.readFileSync(0, "utf8");
const tokens = input.trim().split(/\s+/);
if (tokens.length === 0) {
    process.stdout.write("");
    process.exit(0);
}
const N = Number(tokens[0]);
const M = Number(tokens[1]);
let index = 2;
const tasks = tokens.slice(index, index + N);
index += N;
const taskIndex = new Map();
for (let i = 0; i < N; i++) {
    taskIndex.set(tasks[i], i);
}
const indegree = new Array(N).fill(0);
const adjacency = new Map();
for (const task of tasks) {
    adjacency.set(task, []);
}
for (let i = 0; i < M; i++) {
    const a = tokens[index++];
    const b = tokens[index++];
    adjacency.get(a).push(b);
    indegree[taskIndex.get(b)]++;
}
const heap = new MinBinaryHeap((a, b) => a < b ? -1 : a > b ? 1 : 0);
for (const task of tasks) {
    if (indegree[taskIndex.get(task)] === 0) {
        heap.push(task);
    }
}
const order = [];
while (heap.size > 0) {
    const current = heap.pop();
    order.push(current);
    for (const next of adjacency.get(current)) {
        const nextIndex = taskIndex.get(next);
        indegree[nextIndex]--;
        if (indegree[nextIndex] === 0) {
            heap.push(next);
        }
    }
}
if (order.length < N) {
    process.stdout.write("IMPOSSIBLE\n");
}
else {
    process.stdout.write(order.join(" ") + "\n");
}
