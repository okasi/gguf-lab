const fs = require('fs');

class MinHeap {
    private heap: string[];

    constructor() {
        this.heap = [];
    }

    push(val: string): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.heap[parentIdx] <= this.heap[idx]) break;
            [this.heap[parentIdx], this.heap[idx]] = [this.heap[idx], this.heap[parentIdx]];
            idx = parentIdx;
        }
    }

    private bubbleDown(idx: number): void {
        const length = this.heap.length;
        while (true) {
            let smallest = idx;
            const leftIdx = 2 * idx + 1;
            const rightIdx = 2 * idx + 2;
            if (leftIdx < length && this.heap[leftIdx] < this.heap[smallest]) smallest = leftIdx;
            if (rightIdx < length && this.heap[rightIdx] < this.heap[smallest]) smallest = rightIdx;
            if (smallest === idx) break;
            [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
            idx = smallest;
        }
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;
    const lines = input.split('\n');
    const [N, M] = lines[0].split(/\s+/).map(Number);
    const tasks = lines[1].split(/\s+/);

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length < 2) continue;
        const A = parts[0];
        const B = parts[1];
        if (adj.has(A) && adj.has(B)) {
            adj.get(A)!.push(B);
            inDegree.set(B, inDegree.get(B)! + 1);
        }
    }

    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (heap.size() > 0) {
        const task = heap.pop()!;
        result.push(task);
        for (const neighbor of adj.get(task)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length !== N) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(result.join(' '));
    }
}

main();
