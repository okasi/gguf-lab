"use strict";
const fs = require('fs');
class MinHeap {
    constructor() {
        this.heap = [];
        this.size = 0;
    }
    push(dist, x, y) {
        this.heap.push([dist, x, y]);
        this.size++;
        this.siftUp(this.size - 1);
    }
    pop() {
        if (this.size === 0)
            return undefined;
        const top = this.heap[0];
        this.size--;
        if (this.size > 0) {
            this.heap[0] = this.heap[this.size];
            this;
        }
    }
}
