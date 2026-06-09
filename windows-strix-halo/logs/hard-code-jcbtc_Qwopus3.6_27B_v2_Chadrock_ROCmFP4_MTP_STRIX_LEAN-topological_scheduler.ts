import { readFileSync } from 'fs';

class MinHeap<T> {
    private heap: T[];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.heap = [];
        this.compare = compare;
    }

    get size(): number {
        return this.heap.length;
    }

    peek(): T | undefined {
        if (this.size === 0) return undefined;
        return this.heap[0];
    }

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.size - 1);
    }

    pop(): T | undefined {
        if (this.size === 0) return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop()!;
        if (this.size > 0) {
            this.heap[0] = bottom;
            this.sinkDown(0);
        }
        return top;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        const lastIndex = this.size - 1;
        while (true) {
            let leftChild = 2 * index + 1;
            let rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild <= lastIndex && this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve(): void {
    const input = readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');

    if (lines.length === 0) {
        return;
    }

    const firstLine = lines[0].split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    const taskNames = lines[1].split(/\s+/);

    const nameToIndex = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        nameToIndex.set(taskNames[i], i);
    }

    const inDegree = new Array(N).fill(0);
    const adjList: number[][][] = [];
    for (let i = 0; i < N; i++) {
        adjList.push([]);
    }

    for (let i = 2; i < 2 + M; i++) {
        const parts = lines[i].split(/\s+/);
        const u = parts[0];
        const v = parts[1];
        const uIdx = nameToIndex.get(u);
        const vIdx = nameToIndex.get(v);
        if (uIdx !== undefined && vIdx !== undefined) {
            adjList[uIdx].push(vIdx);
            inDegree[vIdx]++;
        }
    }

    const heap = new MinHeap<string>((a, b) => a.localeCompare(b));

    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(taskNames[i]);
        }
    }

    const result: string[] = [];

    while (heap.size > 0) {
        const current = heap.pop();
        if (current === undefined) break;

        result.push(current);
        const idx = nameToIndex.get(current);
        if (idx !== undefined) {
            for (const neighbor of adjList[idx]) {
                inDegree[neighbor]--;
                if (inDegree[neighbor] === 0) {
                    heap.push(taskNames[neighbor]);
                }
            }
        }
    }

    if (result.length !== N) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(result.join(' '));
    }
}

solve();
