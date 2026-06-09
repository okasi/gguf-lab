import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private leftChild(i: number): number {
        return 2 * i + 1;
    }

    private rightChild(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    public push(task: string): void {
        this.heap.push(task);
        this.bubbleUp(this.heap.length - 1);
    }

    public pop(): string | null {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop() ?? null;

        const min = this.heap[0];
        this.heap[0] = this.heap.pop() ?? null;
        this.bubbleDown(0);
        return min;
    }

    public size(): number {
        return this.heap.length;
    }

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const p = this.parent(i);
            if (this.heap[i] < this.heap[p]) {
                this.swap(i, p);
                i = p;
            } else {
                break;
            }
        }
    }

    private bubbleDown(i: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.leftChild(i);
            const r = this.rightChild(i);

            if (l < n && this.heap[l] < this.heap[smallest]) {
                smallest = l;
            }
            if (r < n && this.heap[r] < this.heap[smallest]) {
                smallest = r;
            }

            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim();
if (!input) process.exit(0);

const tokens = input.split(/\s+/);
let idx = 0;

const N = parseInt(tokens[idx++], 10);
const M = parseInt(tokens[idx++], 10);

const tasks = new Array<string>(N);
for (let i = 0; i < N; i++) {
    tasks[i] = tokens[idx++];
}

const adj = new Map<string, string[]>();
const inDegree = new Map<string, number>();

for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const A = tokens[idx++];
    const B = tokens[idx++];
    adj.get(A)!.push(B);
    inDegree.set(B, (inDegree.get(B) ?? 0) + 1);
}

const pq = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}

const result: string[] = [];
while (!pq.isEmpty()) {
    const task = pq.pop()!;
    result.push(task);

    for (const dependent of adj.get(task)!) {
        const deg = inDegree.get(dependent)! - 1;
        inDegree.set(dependent, deg);
        if (deg === 0) {
            pq.push(dependent);
        }
    }
}

if (result.length < N) {
    console.log("IMPOSSIBLE");
} else {
    console.log(result.join(" "));
}
