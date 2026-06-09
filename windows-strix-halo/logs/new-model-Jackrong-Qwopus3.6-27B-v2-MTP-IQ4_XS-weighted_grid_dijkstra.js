"use strict";
class PriorityQueue {
    constructor(compare) {
        this.heap = [];
        this.compare = compare;
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return top;
    }
    bubbleUp(index) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            const parent = this.heap[parentIndex];
            if (this.compare(element, parent) >= 0)
                break;
            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = element;
    }
    sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let swapIndex = null;
            if (leftIndex < length) {
                swapIndex = leftIndex;
                if (rightIndex < length && this.compare(this.heap[rightIndex], this.heap[leftIndex]) < 0) {
                    swapIndex = rightIndex;
                }
                if (this.compare(element, this.heap[swapIndex]) <= 0)
                    break;
            }
            else {
                break;
            }
            this.heap[index] = this.heap[swapIndex];
            index = swapIndex;
        }
        this.heap[index] = element;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
}
