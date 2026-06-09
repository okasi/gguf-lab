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
const input = fs.readFileSync(0, "utf8").trim().split(/\s+/);
const iterator = input[Symbol.iterator]();
const next = () => iterator.next().value;
const N = parseInt(next());
const Q = parseInt(next());
const intervals = [];
for (let i = 0; i < N; i++) {
    intervals.push([parseInt(next()), parseInt(next())]);
}
const queries = [];
for (let i = 0; i < Q; i++) {
    queries.push([parseInt(next()), i]);
}
intervals.sort((a, b) => a[0] - b[0]);
queries.sort((a, b) => a[0] - b[0]);
const answers = new Array(Q);
class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(value) {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
    peek() { return this.heap[0]; }
    get size() { return this.heap.length; }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] > this.heap[index]) {
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            }
            else
                break;
        }
    }
    bubbleDown(index) {
        const length = this.heap.length;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;
            if (leftIndex < length && this.heap[leftIndex] < this.heap[smallest])
                smallest = leftIndex;
            if (rightIndex < length && this.heap[rightIndex] < this.heap[smallest])
                smallest = rightIndex;
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            }
            else
                break;
        }
    }
}
const heap = new MinHeap();
let intervalIndex = 0;
for (const [x, originalIndex] of queries) {
    while (intervalIndex < N && intervals[intervalIndex][0] <= x) {
        heap.push(intervals[intervalIndex][1]);
        intervalIndex++;
    }
    while (heap.size > 0 && heap.peek() < x) {
        heap.pop();
    }
    answers[originalIndex] = heap.size;
}
console.log(answers.join(" "));
