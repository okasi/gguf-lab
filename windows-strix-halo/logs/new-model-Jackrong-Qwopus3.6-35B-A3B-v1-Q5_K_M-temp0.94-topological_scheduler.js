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
    push(item) {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    siftUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[index] < this.data[parentIndex]) {
                this.swap(index, parentIndex);
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    siftDown(index) {
        const length = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < length && this.data[right] < this.data[smallest]) {
                smallest = right;
            }
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            }
            else {
                break;
            }
        }
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length === 0)
        return;
    const lines = input.split(/\r?\n/);
    const [N, M] = lines[0].split(" ").map(Number);
    if (N === 0) {
        console.log("");
        return;
    }
    const tasks = lines[1].split(" ");
    const inDegree = new Map();
    const adj = new Map();
    for (const t of tasks) {
        inDegree.set(t, 0);
        adj.set(t, []);
    }
    for (let i = 0; i < M; i++) {
        const [u, v] = lines[i + 2].split(" ");
        adj.get(u).push(v);
        inDegree.set(v, inDegree.get(v) + 1);
    }
    const pq = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            pq.push(t);
        }
    }
    const result = [];
    while (!pq.isEmpty()) {
        const current = pq.pop();
        result.push(current);
        for (const neighbor of adj.get(current)) {
            const newDegree = inDegree.get(neighbor) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
                pq.push(neighbor);
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
