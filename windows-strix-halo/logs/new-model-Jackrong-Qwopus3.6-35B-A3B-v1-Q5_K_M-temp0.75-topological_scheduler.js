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
    heapifyUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[parentIndex] <= this.data[index])
                break;
            this.swap(parentIndex, index);
            index = parentIndex;
        }
    }
    heapifyDown(index) {
        const length = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.data[left] < this.data[smallest])
                smallest = left;
            if (right < length && this.data[right] < this.data[smallest])
                smallest = right;
            if (smallest === index)
                break;
            this.swap(index, smallest);
            index = smallest;
        }
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    push(value) {
        this.data.push(value);
        this.heapifyUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.heapifyDown(0);
        }
        return top;
    }
    peek() {
        return this.data[0];
    }
    isEmpty() {
        return this.data.length === 0;
    }
}
const input = fs.readFileSync(0, "utf8").trim().split(/\s+/);
let ptr = 0;
const N = Number(input[ptr++]);
const M = Number(input[ptr++]);
const tasks = [];
for (let i = 0; i < N; i++) {
    tasks.push(input[ptr++]);
}
const graph = new Map();
const inDegree = new Map();
for (const task of tasks) {
    graph.set(task, []);
    inDegree.set(task, 0);
}
for (let i = 0; i < M; i++) {
    const from = input[ptr++];
    const to = input[ptr++];
    graph.get(from).push(to);
    inDegree.set(to, inDegree.get(to) + 1);
}
const pq = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}
const order = [];
while (!pq.isEmpty()) {
    const task = pq.pop();
    order.push(task);
    for (const neighbor of graph.get(task)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
            pq.push(neighbor);
        }
    }
}
if (order.length !== N) {
    console.log("IMPOSSIBLE");
}
else {
    console.log(order.join(" "));
}
