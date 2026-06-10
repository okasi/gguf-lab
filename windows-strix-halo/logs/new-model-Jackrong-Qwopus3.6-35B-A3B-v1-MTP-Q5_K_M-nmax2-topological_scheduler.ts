import * as fs from 'fs';

class MinHeap<T> {
    private data: T[];

    constructor(private compare: (a: T, b: T) => number) {
        this.data = [];
    }

    push(item: T): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): T | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.data[index], this.data[parentIndex]) < 0) {
                [this.data[index], this.data[parentIndex]] = [this.data[parentIndex], this.data[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        const length = this.data.length;
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex < length && this.compare(this.data[leftChildIndex], this.data[smallest]) < 0) {
                smallest = leftChildIndex;
            }

            if (rightChildIndex < length && this.compare(this.data[rightChildIndex], this.data[smallest]) < 0) {
                smallest = rightChildIndex;
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

function solve(): void {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    const secondLine = lines[1].trim().split(/\s+/);
    const tasks = secondLine;

    const taskIndexMap = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        taskIndexMap.set(tasks[i], i);
    }

    const adjacencyList: number[][] = Array.from({ length: N }, () => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const line = lines[2 + i].trim().split(/\s+/);
        const A = line[0];
        const B = line[1];
        const aIdx = taskIndexMap.get(A);
        const bIdx = taskIndexMap.get(B);
        if (aIdx === undefined || bIdx === undefined) continue;
        adjacencyList[aIdx].push(bIdx);
        inDegree[bIdx]++;
    }

    const pq = new MinHeap<number>((a, b) => tasks[a].localeCompare(tasks[b]));

    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(i);
        }
    }

    const result: string[] = [];
    let processedCount = 0;

    while (!pq.isEmpty()) {
        const current = pq.pop()!;
        result.push(tasks[current]);
        processedCount++;

        for (const neighbor of adjacencyList[current]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                pq.push(neighbor);
            }
        }
    }

    if (processedCount !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

solve();
