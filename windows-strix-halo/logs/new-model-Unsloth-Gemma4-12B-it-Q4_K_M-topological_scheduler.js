"use strict";
class MinHeap {
    constructor() {
        this.heap = [];
        // ... and so on
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return top;
    }
    bubbleUp(idx) {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.heap[idx] < this.heap[parent]) {
                [this.heap[idx], this.heap[parent]];
                [this.heap[parent]], [this.heap[idx]];
                ; // Wait, swap logic
                // Correct swap:
                const temp = this.heap[idx];
                this.heap[idx] = this.heap[parent];
                ;
                this.heap[parent];
                temp;
                idx = parent;
            }
            else
                break;
        }
    }
}
