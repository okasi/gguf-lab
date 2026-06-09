import * as fs from 'fs';

class MinHeap<T> {
    private heap: T[] = [];

    public insert(val: T): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    public extractMin(): T | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return min;
    }

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parentIndex]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        const length = this.heap.length;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;

            if (leftIndex < length && this.heap[leftIndex] < this.heap[smallest]) {
                smallest = leftIndex;
            }
            if (rightIndex < length && this.heap[rightIndex] < this.heap[smallest]) {
                smallest = rightIndex;
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

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0) return;

    const [N, M] = input[0].split(' ').map(Number);
    const tasks = input[1].split(' ');

    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const task of tasks) {
        graph.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const [A, B] = input[i + 2].split(' ');
        graph.get(A)!.push(B);
        inDegree.set(B, inDegree.get(B)! + 1);
    }

    const heap = new MinHeap<string>();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.insert(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const u = heap.extractMin()!;
        result.push(u);

        for (const v of graph.get(u)!) {
            inDegree.set(v, inDegree.get(v)! - 1);
            if (inDegree.get(v) === 0) {
                heap.insert(v);
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
