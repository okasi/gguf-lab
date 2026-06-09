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
    push(task) {
        this.heap.push(task);
        this._bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return "";
        const result = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._bubbleDown(0);
        }
        return result;
    }
    _bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[i] < this.heap[parent]) {
                [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
                i = parent;
            }
            else {
                break;
            }
        }
    }
    _bubbleDown(i) {
        const length = this.heap.length;
        while (2 * i + 1 < length) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;
            if (left < length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            }
            else {
                break;
            }
        }
    }
}
function main() {
    const data = fs.readFileSync(0, "utf8");
    const trimmedData = data.trim();
    if (trimmedData === "") {
        return;
    }
    const lines = trimmedData.split("\n").filter(line => line.trim() !== "");
    const [N, M] = lines[0].split(" ").map(Number);
    const taskNames = lines[1].split(" ").map(String);
    const adj = new Map();
    const inDegree = new Map();
    for (let i = 0; i < N; i++) {
        if (!adj.has(taskNames[i])) {
            adj.set(taskNames[i], []);
        }
        if (!inDegree.has(taskNames[i])) {
            inDegree.set(taskNames[i], 0);
        }
    }
    for (let i = 2; i < lines.length; i++) {
        const [A, B] = lines[i].split(" ").map(String);
        if (!adj.has(A)) {
            adj.set(A, []);
        }
        if (!adj.has(B)) {
            adj.set(B, []);
        }
        adj.get(A).push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }
    const heap = new MinHeap();
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }
    const buildOrder = [];
    while (heap.heap.length > 0) {
        const current = heap.pop();
        buildOrder.push(current);
        const neighbors = adj.get(current);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newInDegree = inDegree.get(neighbor) - 1;
                inDegree.set(neighbor, newInDegree);
                if (newInDegree === 0) {
                    heap.push(neighbor);
                }
            }
        }
    }
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(buildOrder.join(" "));
    }
}
main();
