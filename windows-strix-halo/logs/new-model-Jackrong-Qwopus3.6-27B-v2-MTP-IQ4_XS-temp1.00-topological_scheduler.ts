import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    private pushUp(index: number): void {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.heap[parent] <= this.heap[index]) break;
            this.swap(parent, index);
            index = parent;
        }
    }

    private pushDown(index: number): void {
        const size = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < size && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < size && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest === index) break;
            this.swap(index, smallest);
            index = smallest;
        }
    }

    push(val: string): void {
        this.heap.push(val);
        this.pushUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const min = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.pushDown(0);
        }
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n').map(line => line.split(/\s+/).filter(s => s.length > 0));
    const [N, M] = lines[0].map(Number);
    
    if
