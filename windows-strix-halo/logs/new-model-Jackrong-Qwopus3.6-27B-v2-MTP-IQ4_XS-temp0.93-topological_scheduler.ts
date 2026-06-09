import * as fs from 'fs';

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    public push(value: string): void {
        this.data.push(value);
        this._siftUp(this.data.length - 1);
    }

    public pop(): string | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const min = this.data[0];
        const last = this.data.pop();
        if (!this.isEmpty() && last !== undefined) {
            this.data[0] = last;
            this._siftDown(0);
        }
        return min;
    }

    public isEmpty(): boolean {
        return this.data.length === 0;
    }

    private _siftUp(index: number): void {
        const value = this.data[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parentValue = this.data[parentIndex];
            if (value < parentValue) {
                this.data[index] = parentValue;
                index = parentIndex;
            } else {
                break;
            }
        }
        this.data[index] = value;
    }

    private _siftDown(index: number): void {
        const length = this.data.length;
        const value = this.data[index];
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let swapIndex = index;

            if (leftIndex < length && this.data[leftIndex] < value) {
                swapIndex = leftIndex;
            }
            if (rightIndex < length && this.data[rightIndex] < this.data[swapIndex]) {
                swapIndex = rightIndex;
            }

            if (swapIndex !== index) {
                this.data[index] = this.data[swapIndex];
                index = swapIndex;
            } else {
                break;
            }
        }
        this.data[index] = value;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const lines = input.split('\n');
    const [N, M] = lines[0].split(/\s+/).map(Number);
    const tasks = lines[1].split(/\s+/);

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [A, B] = line.split(/\s+/);
        adj.get(A)!.push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }

    const heap = new MinHeap();
    for (const [task, degree] of inDegree) {
        if (degree === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const task = heap.pop()!;
        result.push(task);
        for (const neighbor of adj.get(task)!) {
            const newDegree = (inDegree.get(neighbor) || 0) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length === N) {
        console.log(result.join(' '));
    } else {
        console.log('IMPOSSIBLE');
    }
}

main();
