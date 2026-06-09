"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MinHeap {
    constructor() {
        this.heap = [];
        this.items = [];
    }
    push(cost, r, c) {
        const item = [cost, r, c];
        this.items.push(item);
        this.heap.push(cost);
        // This is inefficient if costs are not unique. Let's just use a single array of tuples.
    }
}
