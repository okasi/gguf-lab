import * as fs from 'fs';

class MinHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    get size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const top = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.sinkDown(0);
        return top;
    }

    peek(): T | undefined {
        return this.heap[0];
    }

    private bubbleUp(index: number): void {
        const item = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (this.compare(item, parent) >= 0) {
                break;
            }
            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = item;
    }

    private sinkDown(index: number): void {
        const length = this.heap.length;
        const item = this.heap[index];
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let swapIndex: number | null = null;

            if (leftIndex < length) {
                const left = this.heap[leftIndex];
                if (this.compare(item, left) > 0) {
                    swapIndex = leftIndex;
                }
            }

            if (rightIndex < length) {
                const right = this.heap[rightIndex];
                if (swapIndex === null || this.compare(right, this.heap[swapIndex]) < 0) {
                    swapIndex = rightIndex;
                }
            }

            if (swapIndex === null) {
                break;
            }

            this.heap[index] = this.heap[swapIndex];
            index = swapIndex;
        }
        this.heap[index] = item;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n');
    
    let lineIndex = 0;
    const [N_str, M_str] = lines[lineIndex++].split(' ');
    const N = parseInt(N_str, 10);
    const M = parseInt(M_str, 10);

    const tasks = lines[lineIndex++].split(' ');
    
    const inDegree: Map<string, number> = new Map();
    const adjList: Map<string, string[]> = new Map();

    for (const task of tasks) {
        inDegree.set(task, 0);
        adjList.set(task, []);
    }

    for (let i = 0; i < M; i++) {
        const parts = lines[lineIndex++].split(' ');
        const from = parts[0];
        const to = parts[1];
        adjList.get(from)!.push(to);
        inDegree.set(to, inDegree.get(to)! + 1);
    }

    const pq = new MinHeap<string>((a, b) => a.localeCompare(b));

    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }

    const order: string[] = [];
    let processedCount = 0;

    while (!pq.isEmpty()) {
        const current = pq.pop()!;
        order.push(current);
        processedCount++;

        const neighbors = adjList.get(current)!;
        for (const neighbor of neighbors) {
            const deg = inDegree.get(neighbor)! - 1;
            inDegree.set(neighbor, deg);
            if (deg === 0) {
                pq.push(neighbor);
            }
        }
    }

    if (processedCount !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(order.join(' '));
    }
}

solve();
