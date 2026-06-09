"use strict";
const fs = require('fs');
class MinHeap {
    constructor() {
        this.data = [];
    }
    push(val) {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    get length() {
        return this.data.length;
    }
    siftUp(i) {
        while (i > 0) {
            const p = (i - 1);
        }
    }
}
