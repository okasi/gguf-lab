import * as fs from "fs";

class MinHeap {
    private data: string[] = [];

    push(item: string): void {
        this.data.push(item);
        this.swim(this.data.length - 1);
    }

    pop(): string {
        if (this.data.length === 0) {
            throw new Error("Heap is empty");
        }
        const top = this.data[0];
        this.data[0] = this.data[this.data.length - 1];
        this.data.pop();
        this.sink(0);
        return top;
    }

    get size(): number {
        return this.data.length;
    }

    private swim(index: number): void {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.data[parent], this.data[index]) <= 0) {
                break;
            }
            this.swap(index, parent);
            index = parent;
        }
    }

    private sink(index: number): void {
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < this.data.length && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.data.length && this.compare(this.data[right], this.data[smallest]) < 0) {
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
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }

    private compare(a: string, b: string): number {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.trim().split(/\s+/);
    if (tokens.length === 0) return;

    const N = parseInt(tokens[0]);
    const M = parseInt(tokens[1]);

    const tasks = tokens.slice(2, 2 + N);
    const edges = tokens.slice(2 + N);

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const from = edges[i * 2];
        const to = edges[i * 2 + 1];
        adj.get(from)!.push(to);
        inDegree.set(to, (inDegree.get(to) || 0) + 1);
    }

    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (heap.size > 0) {
        const current = heap.pop();
        result.push(current);

        for (const neighbor of adj.get(current)!) {
            const newDegree = inDegree.get(neighbor)! - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

solve();
