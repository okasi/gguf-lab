import * as fs from 'fs';

class MinHeap {
    private data: number[];
    private tasks: string[];

    constructor(tasks: string[]) {
        this.data = [];
        this.tasks = tasks;
    }

    private compare(a: number, b: number): boolean {
        return this.tasks[a] < this.tasks[b];
    }

    size(): number {
        return this.data.length;
    }

    push(item: number): void {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }

    pop(): number {
        if (this.data.length === 0) throw new Error("Heap is empty");
        const root = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return root;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.compare(this.data[index], this.data[parent])) {
                [this.data[index], this.data[parent]] = [this.data[parent], this.data[index]];
                index = parent;
            } else {
                break;
            }
        }
    }

    private siftDown(index: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < n && this.compare(this.data[left], this.data[smallest])) {
                smallest = left;
            }
            if (right < n && this.compare(this.data[right], this.data[smallest])) {
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
    if (!input) return;

    const lines = input.split('\n');
    const [N, M] = lines[0].trim().split(/\s+/).map(Number);
    const tasks = lines[1].trim().split(/\s+/);

    const taskToIndex = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        taskToIndex.set(tasks[i], i);
    }

    const adj: number[][] = new Array(N);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < N; i++) {
        adj[i] = [];
    }

    for (let i = 2; i < 2 + M; i++) {
        const [u, v] = lines[i].trim().split(/\s+/);
        const uIdx = taskToIndex.get(u)!;
        const vIdx = taskToIndex.get(v)!;
        adj[uIdx].push(vIdx);
        inDegree[vIdx]++;
    }

    const heap = new MinHeap(tasks);
    const result: string[] = [];

    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(i);
        }
    }

    while (heap.size() > 0) {
        const idx = heap.pop();
        result.push(tasks[idx]);

        for (const next of adj[idx]) {
            inDegree[next]--;
            if (inDegree[next] === 0) {
                heap.push(next);
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

main();
