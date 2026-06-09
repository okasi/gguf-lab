import * as fs from 'fs';

class MinHeap<T> {
    private data: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    push(item: T): void {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }

    pop(): T {
        if (this.data.length === 0) throw new Error("Empty heap");
        const root = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return root;
    }

    get size(): number {
        return this.data.length;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.data[index], this.data[parentIndex]) < 0) {
                const temp = this.data[index];
                this.data[index] = this.data[parentIndex];
                this.data[parentIndex] = temp;
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private siftDown(index: number): void {
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < this.data.length && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.data.length && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }

            if (smallest !== index) {
                const temp = this.data[index];
                this.data[index] = this.data[smallest];
                this.data[smallest] = temp;
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.trim().split(/\s+/);
    if (tokens.length === 0) return;

    const n = parseInt(tokens[0], 10);
    const m = parseInt(tokens[1], 10);

    const inDegree = new Map<string, number>();
    const adj = new Map<string, number[]>();

    for (let i = 0; i < n; i++) {
        const task = tokens[2 + i];
        inDegree.set(task, 0);
        adj.set(task, []);
    }

    for (let i = 0; i < m; i++) {
        const a = tokens[2 + n + i * 2];
        const b = tokens[2 + n + i * 2 + 1];
        adj.get(a)!.push(b);
        inDegree.set(b, (inDegree.get(b) || 0) + 1);
    }

    const heap = new MinHeap<string>((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const [task, deg] of inDegree) {
        if (deg === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (heap.size > 0) {
        const task = heap.pop();
        result.push(task);
        for (const neighbor of adj.get(task)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length !== n) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

main();
