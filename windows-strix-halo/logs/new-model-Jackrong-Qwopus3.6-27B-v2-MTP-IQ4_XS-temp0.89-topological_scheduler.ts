import * as fs from "fs";

class MinHeap {
    private heap: string[];

    constructor() {
        this.heap = [];
    }

    push(val: string): void {
        this.heap.push(val);
        this._bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const min = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._bubbleDown(0);
        }
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private _bubbleUp(index: number): void {
        const val = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] <= val) break;
            this.heap[index] = this.heap[parentIndex];
            index = parentIndex;
        }
        this.heap[index] = val;
    }

    private _bubbleDown(index: number): void {
        const val = this.heap[index];
        const halfLength = Math.floor(this.heap.length / 2);
        while (index < halfLength) {
            let leftIndex = 2 * index + 1;
            let rightIndex = 2 * index + 2;
            let smallestIndex = leftIndex;
            if (rightIndex < this.heap.length && this.heap[rightIndex] < this.heap[leftIndex]) {
                smallestIndex = rightIndex;
            }
            if (val <= this.heap[smallestIndex]) break;
            this.heap[index] = this.heap[smallestIndex];
            index = smallestIndex;
        }
        this.heap[index] = val;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const lines = input.split(/\r?\n/);
    const [n, m] = lines[0].trim().split(" ").map(Number);
    const tasks = lines[1].trim().split(" ");

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < 2 + m; i++) {
        const [a, b] = lines[i].trim().split(" ");
        if (!adj.has(a) || !adj.has(b)) continue; // Should not happen based on problem description, but safe.
        adj.get(a)!.push(b);
        inDegree.set(b, inDegree.get(b)! + 1);
    }

    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const task = heap.pop()!;
        result.push(task);

        const neighbors = adj.get(task);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newDegree = inDegree.get(neighbor)! - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0) {
                    heap.push(neighbor);
                }
            }
        }
    }

    if (result.length !== n) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

main();
