import * as fs from 'fs';

class MinHeap {
    private data: string[] = [];

    push(item: string): void {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }

    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return root;
    }

    get size(): number {
        return this.data.length;
    }

    get isEmpty(): boolean {
        return this.data.length === 0;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[parentIndex] <= this.data[index]) break;
            [this.data[parentIndex], this.data[index]] = [this.data[index], this.data[parentIndex]];
            index = parentIndex;
        }
    }

    private siftDown(index: number): void {
        const length = this.data.length;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;

            if (leftIndex < length && this.data[leftIndex] < this.data[smallest]) {
                smallest = leftIndex;
            }
            if (rightIndex < length && this.data[rightIndex] < this.data[smallest]) {
                smallest = rightIndex;
            }

            if (smallest === index) break;
            [this.data[smallest], this.data[index]] = [this.data[index], this.data[smallest]];
            index = smallest;
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;

    const tokens = input.split(/\s+/);
    let cursor = 0;

    const N = parseInt(tokens[cursor++], 10);
    const M = parseInt(tokens[cursor++], 10);

    const tasks: string[] = [];
    for (let i = 0; i < N; i++) {
        tasks.push(tokens[cursor++]);
    }

    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    for (const task of tasks) {
        adj[task] = [];
        inDegree[task] = 0;
    }

    for (let i = 0; i < M; i++) {
        const from = tokens[cursor++];
        const to = tokens[cursor++];
        adj[from].push(to);
        inDegree[to]++;
    }

    const pq = new MinHeap();
    for (const task of tasks) {
        if (inDegree[task] === 0) {
            pq.push(task);
        }
    }

    const order: string[] = [];
    while (!pq.isEmpty) {
        const current = pq.pop()!;
        order.push(current);

        for (const neighbor of adj[current]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                pq.push(neighbor);
            }
        }
    }

    if (order.length !== N) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(order.join(' '));
    }
}

solve();
