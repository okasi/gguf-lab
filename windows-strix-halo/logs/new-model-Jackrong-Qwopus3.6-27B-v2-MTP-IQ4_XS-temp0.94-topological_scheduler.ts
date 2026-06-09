import * as fs from 'fs';

class MinHeap {
    private elements: string[];

    constructor() {
        this.elements = [];
    }

    public push(value: string): void {
        this.elements.push(value);
        this._siftUp(this.elements.length - 1);
    }

    public pop(): string | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const top = this.elements[0];
        const last = this.elements.pop();
        if (!this.isEmpty() && last !== undefined) {
            this.elements[0] = last;
            this._siftDown(0);
        }
        return top;
    }

    public isEmpty(): boolean {
        return this.elements.length === 0;
    }

    private _siftUp(index: number): void {
        const value = this.elements[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parentValue = this.elements[parentIndex];
            if (value < parentValue) {
                this.elements[index] = parentValue;
                index = parentIndex;
            } else {
                break;
            }
        }
        this.elements[index] = value;
    }

    private _siftDown(index: number): void {
        const length = this.elements.length;
        const value = this.elements[index];
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let swapIndex = index;

            if (leftChildIndex < length && this.elements[leftChildIndex] < value) {
                swapIndex = leftChildIndex;
            }
            if (rightChildIndex < length && this.elements[rightChildIndex] < this.elements[swapIndex]) {
                swapIndex = rightChildIndex;
            }

            if (swapIndex !== index) {
                this.elements[index] = this.elements[swapIndex];
                index = swapIndex;
            } else {
                break;
            }
        }
        this.elements[index] = value;
    }
}

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;
    const lines = input.split('\n');
    const [N, M] = lines[0].trim().split(/\s+/).map(Number);
    const tasks = lines[1].trim().split(/\s+/);

    const adjacencyList: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adjacencyList.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;
        const parts = line.split(/\s+/).filter(s => s !== '');
        if (parts.length < 2) continue;
        const [A, B] = parts;
        adjacencyList.get(A)!.push(B);
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
        for (const neighbor of adjacencyList.get(task)!) {
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
