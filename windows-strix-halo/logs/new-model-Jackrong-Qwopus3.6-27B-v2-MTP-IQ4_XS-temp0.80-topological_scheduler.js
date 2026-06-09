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
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    get length() {
        return this.data.length;
    }
    siftUp(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.data[p] > this.data[i]) {
                [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
                i = p;
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
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.data[l] < this.data[smallest])
                smallest = l;
            if (r < n && this.data[r] < this.data[smallest])
                smallest = r;
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
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
const [N, M] = lines[0].split(/\s+/).map(Number);
const tasks = lines[1].split(/\s+/);
const adj = new Map();
const inDegree = new Map();
for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}
for (let i = 0; i < M; i++) {
    const [A, B] = lines[2 + i].split(/\s+/);
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
while (pq.length > 0) {
    const u = pq.pop();
    result.push(u);
    for (const v of adj.get(u)) {
        inDegree.set(v, inDegree.get(v) - 1);
        if (inDegree.get(v) === 0) {
            pq.push(v);
        }
    }
}
if (result.length === N) {
    console.log(result.join(' '));
}
else {
    console.log('IMPOSSIBLE');
}
