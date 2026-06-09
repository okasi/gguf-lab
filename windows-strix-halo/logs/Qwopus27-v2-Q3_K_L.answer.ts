import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/);
const iterator = input[Symbol.iterator]();
const next = () => iterator.next().value;

const N = parseInt(next());
const Q = parseInt(next());

const intervals: [number, number][] = [];
for (let i = 0; i < N; i++) {
    intervals.push([parseInt(next()), parseInt(next())]);
}

const queries: [number, number][] = [];
for (let i = 0; i < Q; i++) {
    queries.push([parseInt(next()), i]);
}

intervals.sort((a, b) => a[0] - b[0]);
queries.sort((a, b) => a[0] - b[0]);

const answers: number[] = new Array(Q);

class MinHeap {
    private heap: number[] = [];
    push(value: number) {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        const min = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
    peek() { return this.heap[0]; }
    get size() { return this.heap.length; }
    private bubbleUp(index: number) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] > this.heap[index]) {
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            } else break;
        }
    }
    private bubbleDown(index: number) {
        const length = this.heap.length;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;
            if (leftIndex < length && this.heap[leftIndex] < this.heap[smallest]) smallest = leftIndex;
            if (rightIndex < length && this.heap[rightIndex] < this.heap[smallest]) smallest = rightIndex;
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else break;
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
