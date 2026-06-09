"use strict";
class MinHeap {
    constructor() {
        this.data = [];
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    get size() { return this.data.length; }
    bubbleUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.data[i][0] >= this.data[parent][0])
                break;
            [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
            i = parent;
        }
    }
    sinkDown(i) {
        const n = this.data.length;
        while (true) {
            let min = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.data[l][0] < this.data[min][0])
                min = l;
            if (r < n && this.data[r][0] < this.data[min][0])
                min = r;
            if (min === i)
                break;
            [this.data[i], this.data[min]] = [this.data[min], this.data[i]];
            i = min;
        }
    }
}
