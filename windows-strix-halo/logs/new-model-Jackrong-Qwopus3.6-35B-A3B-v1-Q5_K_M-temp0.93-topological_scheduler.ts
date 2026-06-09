import * as fs from 'fs';

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    public push(val: string): void {
        this.data.push(val);
        this.heapifyUp(this.data.length - 1);
    }

    public pop(): string | undefined {
        if (this.data.length === 0) {
            return undefined;
        }
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.heapifyDown(0);
        }
        return top;
    }

    public get size(): number {
        return this.data.length;
    }

    private heapifyUp(index: number): void {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.data[index] < this.data[parentIndex]) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private heapifyDown(index: number): void {
        const lastIndex = this.data.length - 1;
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            if (leftChild <= lastIndex && this.data[leftChild] < this.data[smallest]) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.data[rightChild] < this.data[smallest]) {
                smallest = rightChild;
            }
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }

    private swap(i: number, j: number): void {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0) return;

    const [N, M] = input[0].split(' ').map(Number);
    if (N === 0) {
        console.log('');
        return;
    }

    const tasks = input[1].split(' ');
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const task of tasks) {
        graph.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim().split(' ');
        const from = line[0];
        const to = line[1];
        if (graph.has(from) && graph.has(to)) {
            graph.get(from)!.push(to);
            inDegree.set(to, inDegree.get(to)! + 1);
        }
    }

    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (heap.size > 0) {
        const task = heap.pop()!;
        result.push(task);
        const dependents = graph.get(task)!;
        for (const dependent of dependents) {
            const deg = inDegree.get(dependent)!;
            inDegree.set(dependent, deg - 1);
            if (deg - 1 === 0) {
                heap.push(dependent);
            }
        }
    }

    if (result.length === N) {
        console.log(result.join(' '));
    } else {
        console.log("IMPOSSIBLE");
    }
}

main();
