import { readFileSync } from "fs";

interface BinaryHeapItem {
    name: string;
}

class MinBinaryHeap {
    private heap: BinaryHeapItem[] = [];

    get size(): number {
        return this.heap.length;
    }

    peek(): BinaryHeapItem | null {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    push(item: BinaryHeapItem): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): BinaryHeapItem | null {
        if (this.heap.length === 0) return null;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    private bubbleUp(index: number): void {
        const item = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (item.name < parent.name) {
                this.heap[index] = parent;
                index = parentIndex;
            } else {
                break;
            }
        }
        this.heap[index] = item;
    }

    private sinkDown(index: number): void {
        const n = this.heap.length;
        const item = this.heap[index];
        while (true) {
            let leftIndex = 2 * index + 1;
            let rightIndex = 2 * index + 2;
            let smallestIndex = index;

            if (leftIndex < n && this.heap[leftIndex].name < item.name) {
                smallestIndex = leftIndex;
            }
            if (rightIndex < n && this.heap[rightIndex].name < this.heap[smallestIndex].name) {
                smallestIndex = rightIndex;
            }
            if (smallestIndex === index) break;
            this.heap[index] = this.heap[smallestIndex];
            index = smallestIndex;
        }
        this.heap[index] = item;
    }
}

function solve(): void {
    const input = readFileSync(0, "utf8").trim();
    const lines = input.split("\n");

    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    const secondLine = lines[1].trim().split(/\s+/);
    const taskNames = secondLine;

    // Build adjacency list and in-degree count
    const inDegree: { [key: string]: number } = {};
    const adjacencyList: { [key: string]: string[] } = {};

    for (const name of taskNames) {
        inDegree[name] = 0;
        adjacencyList[name] = [];
    }

    for (let i = 0; i < M; i++) {
        const edgeLine = lines[2 + i].trim().split(/\s+/);
        const A = edgeLine[0];
        const B = edgeLine[1];
        adjacencyList[A].push(B);
        inDegree[B]++;
    }

    // Initialize heap with all nodes having in-degree 0
    const pq = new MinBinaryHeap();
    for (const name of taskNames) {
        if (inDegree[name] === 0) {
            pq.push({ name });
        }
    }

    const result: string[] = [];

    while (pq.size > 0) {
        const item = pq.pop()!;
        const current = item.name;
        result.push(current);

        for (const neighbor of adjacencyList[current]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                pq.push({ name: neighbor });
            }
        }
    }

    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

solve();
