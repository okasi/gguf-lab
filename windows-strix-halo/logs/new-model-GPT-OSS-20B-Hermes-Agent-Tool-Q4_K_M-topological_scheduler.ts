import * as fs from 'fs';

class MinHeap<T> {
    private data: T[];
    private cmp: (a: T, b: T) => boolean;

    constructor(cmp: (a: T, b: T) => boolean) {
        this.data = [];
        this.cmp = cmp;
    }

    size(): number {
        return this.data.length;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }

    push(item: T): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): T | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const end = this.data.pop();
        if (this.data.length > 0 && end !== undefined) {
            this.data[0] = end;
            this.bubbleDown(0);
        }
        return top;
    }

    private bubbleUp(idx: number): void {
        const item = this.data[idx];
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.data[parentIdx];
            if (this.cmp(item, parent)) {
                this.data[idx] = parent;
                idx = parentIdx;
            } else {
                break;
            }
        }
        this.data[idx] = item;
    }

    private bubbleDown(idx: number): void {
        const length = this.data.length;
        const item = this.data[idx];
        while (true) {
            let leftIdx = 2 * idx + 1;
            let rightIdx = 2 * idx + 2;
            let smallestIdx = idx;

            if (leftIdx < length && this.cmp(this.data[leftIdx], this.data[smallestIdx])) {
                smallestIdx = leftIdx;
            }
            if (rightIdx < length && this.cmp(this.data[rightIdx], this.data[smallestIdx])) {
                smallestIdx = rightIdx;
            }
            if (smallestIdx === idx) break;
            this.data[idx] = this.data[smallestIdx];
            idx = smallestIdx;
        }
        this.data[idx] = item;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    const [N, M] = input[0].trim().split(/\s+/).map(Number);
    const tasks = input[1].trim().split(/\s+/);
    const adj: Map<string, string[]> = new Map();
    const indegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, []);
        indegree.set(task, 0);
    }

    for (let i = 2; i < 2 + M; i++) {
        const [A, B] = input[i].trim().split(/\s+/);
        adj.get(A)!.push(B);
        indegree.set(B, indegree.get(B)! + 1);
    }

    const heap = new MinHeap<string>((a, b) => a < b);
    for (const [task, deg] of indegree.entries()) {
        if (deg === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const current = heap.pop()!;
        result.push(current);
        for (const neighbor of adj.get(current)!) {
            indegree.set(neighbor, indegree.get(neighbor)! - 1);
            if (indegree.get(neighbor)! === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length !== tasks.length) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(result.join(' '));
    }
}

main();
