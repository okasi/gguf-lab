const fs = require('fs');

class MinHeap {
    private heap: [number, number, number][] = [];
    private size: number = 0;

    push(dist: number, x: number, y: number): void {
        this.heap.push([dist, x, y]);
        this.size++;
        this.siftUp(this.size - 1);
    }

    pop(): [number, number, number] | undefined {
        if (this.size === 0) return undefined;
        const top = this.heap[0];
        this.size--;
        if (this.size > 0) {
            this.heap[0] = this.heap[this.size];
            this
