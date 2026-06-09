const fs = require('fs');

class MinHeap {
    private data: string[];
    constructor() {
        this.data = [];
    }
    push(val: string) {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }
    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    get length(): number {
        return this.data.length;
    }
    private siftUp(i: number) {
        while (i > 0) {
            const p = (i - 1)
