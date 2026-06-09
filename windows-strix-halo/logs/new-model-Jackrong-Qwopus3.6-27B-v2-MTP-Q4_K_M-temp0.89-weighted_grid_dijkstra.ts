import * as fs from 'fs';

class PriorityQueue<T> {
    private heap: T[];
    private compare: (a: T, b: T) => boolean;

    constructor(compare: (a: T, b: T) => boolean) {
        this.heap = [];
        this.compare = compare;
    }

    push(value: T): void {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T {
        const root = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last!;
            this.sinkDown(0);
        }
        return root;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.compare(this.heap[index], this.heap[parent])) {
                [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
                index = parent;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.compare(this.heap[left], this.heap[smallest])) {
                smallest = left;
            }
            if (right < n && this.compare(this.heap[right], this.heap[smallest])) {
                smallest = right;
            }
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest
