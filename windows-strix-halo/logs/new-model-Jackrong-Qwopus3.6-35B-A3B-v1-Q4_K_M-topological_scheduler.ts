import * as fs from "fs";

class MinHeap {
    private heap: string[] = [];

    get size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    push(item: string): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last !== undefined) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return min;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parentIndex]) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        const length = this.heap.length;
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallestIndex = index;

            if (leftChildIndex < length && this.heap[leftChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = leftChildIndex;
            }

            if (rightChildIndex < length && this.heap[rightChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex !== index) {
                this.swap(index, smallestIndex);
                index = smallestIndex;
            } else {
                break;
            }
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    if (input.length === 0) {
        return;
    }

    const [nStr, mStr] = input[0].split(" ");
    const n = parseInt(nStr, 10);
    const m = parseInt(mStr, 10);

    const taskNames = input[1].split(" ");

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < m; i++) {
        const [from, to] = input[1 + i + 1].split(" ");
        adj.get(from)!.push(to);
        inDegree.set(to, inDegree.get(to)! + 1);
    }

    const heap = new MinHeap();
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const task = heap.pop()!;
        result.push(task);

        const neighbors = adj.get(task);
        for (const neighbor of neighbors) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length !== n) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

solve();
