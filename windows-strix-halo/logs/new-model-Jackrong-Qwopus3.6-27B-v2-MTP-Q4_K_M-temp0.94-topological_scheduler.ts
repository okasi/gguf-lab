import * as fs from 'fs';

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    private swap(i: number, j: number): void {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.data[index] < this.data[parent]) {
                this.swap(index, parent);
                index = parent;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        const size = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < size && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < size && this.data[right] < this.data[smallest]) {
                smallest = right;
            }
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }

    push(value: string): void {
        this.data.push(value);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): string {
        const min = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');

    const firstLine = lines[0].split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    const tasks = lines[1].split(/\s+/);

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const t of tasks) {
        adj.set(t, []);
        inDegree.set(t, 0);
    }

    for (let i = 0; i < M; i++) {
        const parts = lines[2 + i].split(/\s+/);
        const A = parts[0];
        const B = parts[1];
        adj.get(A)!.push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }

    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t)! === 0) {
            heap.push(t);
        }
    }

    const result: string[] = [];

    while (!heap.isEmpty()) {
        const current = heap.pop();
        result.push(current);
        for (const neighbor of adj.get(current)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor)! === 0) {
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
