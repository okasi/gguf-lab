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
    push(val) {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.data[parent] > this.data[i]) {
                [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
                i = parent;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < n && this.data[right] < this.data[smallest]) {
                smallest = right;
            }
            if (smallest !== i) {
                [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
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
    const lines = input.split('\n');
    const [N, M] = lines[0].trim().split(' ').map(Number);
    const tasks = lines[1].trim().split(' ');
    const taskToIdx = new Map();
    for (let i = 0; i < N; i++) {
        taskToIdx.set(tasks[i], i);
    }
    const adj = Array.from({ length: N }, () => []);
    const inDegree = new Array(N).fill(0);
    for (let i = 2; i < 2 + M && i < lines.length; i++) {
        const parts = lines[i].trim().split(' ');
        if (parts.length === 2) {
            const a = parts[0];
            const b = parts[1];
            const u = taskToIdx.get(a);
            const v = taskToIdx.get(b);
            if (u !== undefined && v !== undefined) {
                adj[u].push(v);
                inDegree[v]++;
            }
        }
    }
    const pq = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(tasks[i]);
        }
    }
    const result = [];
    while (!pq.isEmpty()) {
        const task = pq.pop();
        result.push(task);
        const u = taskToIdx.get(task);
        for (const v of adj[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                pq.push(tasks[v]);
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
