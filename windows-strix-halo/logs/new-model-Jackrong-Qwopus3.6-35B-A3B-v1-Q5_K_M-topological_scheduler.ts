import { readFileSync } from 'fs';

// Min-heap implementation
class MinHeap<T> {
    private data: T[];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.data = [];
        this.compare = compare;
    }

    public push(item: T): void {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }

    public pop(): T {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    public peek(): T | undefined {
        return this.data[0];
    }

    public isEmpty(): boolean {
        return this.data.length === 0;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.data[index], this.data[parentIndex]) >= 0) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private siftDown(index: number): void {
        const length = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < length && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < length && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }

            if (smallest === index) {
                break;
            }

            this.swap(index, smallest);
            index = smallest;
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
}

function main(): void {
    const input = readFileSync(0, "utf8").trim().split('\n');
    let lineIndex = 0;

    if (lineIndex >= input.length) return;
    const firstLine = input[lineIndex++].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    if (lineIndex >= input.length) return;
    const taskNames = input[lineIndex++].trim().split(/\s+/);

    // Map task names to indices 0..N-1
    const nameToIdx: Map<string, number> = new Map();
    taskNames.forEach((name, idx) => {
        nameToIdx.set(name, idx);
    });

    // Build adjacency list and in-degree array
    const adj: number[][] = Array.from({ length: N }, () => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        if (lineIndex >= input.length) break;
        const parts = input[lineIndex++].trim().split(/\s+/);
        const fromName = parts[0];
        const toName = parts[1];
        const fromIdx = nameToIdx.get(fromName);
        const toIdx = nameToIdx.get(toName);

        if (fromIdx !== undefined && toIdx !== undefined) {
            adj[fromIdx].push(toIdx);
            inDegree[toIdx]++;
        }
    }

    // Min-heap of task indices, ordered by task name (lexicographically)
    const heap = new MinHeap<number>((a, b) => {
        return taskNames[a].localeCompare(taskNames[b]);
    });

    // Add all tasks with in-degree 0 to the heap
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(i);
        }
    }

    const result: number[] = [];

    while (!heap.isEmpty()) {
        const currentIdx = heap.pop();
        result.push(currentIdx);

        for (const neighbor of adj[currentIdx]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        const output = result.map(idx => taskNames[idx]).join(' ');
        console.log(output);
    }
}

main();
