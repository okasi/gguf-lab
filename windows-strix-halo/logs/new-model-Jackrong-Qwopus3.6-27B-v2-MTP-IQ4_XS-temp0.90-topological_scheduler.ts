import * as fs from 'fs';

class MinHeap {
    private items: string[];

    constructor() {
        this.items = [];
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.items[parentIndex] <= this.items[index]) break;
            [this.items[parentIndex], this.items[index]] = [this.items[index], this.items[parentIndex]];
            index = parentIndex;
        }
    }

    private bubbleDown(index: number): void {
        const length = this.items.length;
        while (true) {
            let smallest = index;
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;

            if (leftIndex < length && this.items[leftIndex] < this.items[smallest]) {
                smallest = leftIndex;
            }
            if (rightIndex < length && this.items[rightIndex] < this.items[smallest]) {
                smallest = rightIndex;
            }

            if (smallest === index) break;
            [this.items[smallest], this.items[index]] = [this.items[index], this.items[smallest]];
            index = smallest;
        }
    }

    insert(val: string): void {
        this.items.push(val);
        this.bubbleUp(this.items.length - 1);
    }

    extractMin(): string | null {
        if (this.items.length === 0) return null;
        const minVal = this.items[0];
        const lastVal = this.items.pop()!;
        if (this.items.length > 0) {
            this.items[0] = lastVal;
            this.bubbleDown(0);
        }
        return minVal;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n').filter(line => line.trim() !== '');
    
    const [N, M] = lines[0].split(' ').map(Number);
    const tasks = lines[1].split(' ');

    const adj: Map<string, Set<string>> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, new Set());
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const [A, B] = lines[2 + i].split(' ');
        if (adj.has(A) && adj.has(B)) {
            adj.get(A)!.add(B);
            inDegree.set(B, inDegree.get(B)! + 1);
        }
    }

    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.insert(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const task = heap.extractMin()!;
        result.push(task);
        for (const neighbor of adj.get(task)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.insert(neighbor);
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
