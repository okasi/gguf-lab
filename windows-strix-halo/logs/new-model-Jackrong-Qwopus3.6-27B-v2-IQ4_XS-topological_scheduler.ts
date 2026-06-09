import * as fs from 'fs';

class BinaryHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    push(value: string): void {
        this.data.push(value);
        this.siftUp(this.data.length - 1);
    }

    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const bottom = this.data.pop();
        if (this.data.length > 0 && bottom !== undefined) {
            this.data[0] = bottom;
            this.siftDown(0);
        }
        return top;
    }

    peek(): string | undefined {
        return this.data.length > 0 ? this.data[0] : undefined;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[index] < this.data[parentIndex]) {
                [this.data[index], this.data[parentIndex]] = [this.data[parentIndex], this.data[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private siftDown(index: number): void {
        const length = this.data.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < length && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < length && this.data[right] < this.data[smallest]) {
                smallest = right;
            }

            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        return;
    }
    const lines = input.split('\n');
    const [N, M] = lines[0].trim().split(/\s+/).map(Number);
    const tasks = N > 0 ? lines[1].trim().split(/\s+/) : [];

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < 2 + M; i++) {
        if (!lines[i]) continue;
        const parts = lines[i].trim().split(/\s+/);
        const A = parts[0];
        const B = parts[1];
        if (A && B) {
            adj.get(A)!.push(B);
            inDegree.set(B, inDegree.get(B)! + 1);
        }
    }

    const heap = new BinaryHeap();
    const result: string[] = [];

    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }

    while (heap.peek() !== undefined) {
        const task = heap.pop()!;
        result.push(task);
        const neighbors = adj.get(task)!;
        for (const neighbor of neighbors) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

main();
