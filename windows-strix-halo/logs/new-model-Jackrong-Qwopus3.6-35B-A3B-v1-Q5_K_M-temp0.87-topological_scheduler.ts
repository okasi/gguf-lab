import * as fs from 'fs';

class MinHeap<T> {
    private data: T[] = [];

    private less(a: T, b: T): boolean {
        return a < b;
    }

    private swap(i: number, j: number): void {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }

    private siftUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.less(this.data[i], this.data[parent])) {
                this.swap(i, parent);
                i = parent;
            } else {
                break;
            }
        }
    }

    private siftDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.less(this.data[left], this.data[smallest])) {
                smallest = left;
            }
            if (right < n && this.less(this.data[right], this.data[smallest])) {
                smallest = right;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }

    push(item: T): void {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }

    pop(): T | undefined {
        if (this.data.length === 0) {
            return undefined;
        }
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last!;
            this.siftDown(0);
        }
        return root;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }
}

const input = fs.readFileSync(0, "utf8").trim();
if (!input) {
    process.exit(0);
}
const lines = input.split('\n');
const [N, M] = lines[0].trim().split(/\s+/).map(Number);
const tasks = lines[1].trim().split(/\s+/);
const adj = new Map<string, string[]>();
const inDegree = new Map<string, number>();

for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].trim().split(/\s+/);
    const [A, B] = parts;
    adj.get(A)!.push(B);
    inDegree.set(B, inDegree.get(B)! + 1);
}

const pq = new MinHeap<string>();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}

const result: string[] = [];
while (!pq.isEmpty()) {
    const task = pq.pop()!;
    result.push(task);
    const neighbors = adj.get(task)!;
    for (const neighbor of neighbors) {
        const deg = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, deg);
        if (deg === 0) {
            pq.push(neighbor);
        }
    }
}

if (result.length === N) {
    console.log(result.join(' '));
} else {
    console.log('IMPOSSIBLE');
}
