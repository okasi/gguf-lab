import * as fs from "fs";

class MinHeap {
    private heap: number[] = [];

    public push(val: number): void {
        this.heap.push(val);
        this.siftUp(this.heap.length - 1);
    }

    public pop(): number | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    public peek(): number | undefined {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }

    public get size(): number {
        return this.heap.length;
    }

    private siftUp(idx: number): void {
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.heap[parent] > this.heap[idx]) {
                const temp = this.heap[parent];
                this.heap[parent] = this.heap[idx];
                this.heap[idx] = temp;
                idx = parent;
            } else {
                break;
            }
        }
    }

    private siftDown(idx: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;

            if (left < n && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < n && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest !== idx) {
                const temp = this.heap[idx];
                this.heap[idx] = this.heap[smallest];
                this.heap[smallest] = temp;
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim();
if (!input) {
    process.exit(0);
}

const lines = input.split("\n");
const [N, M] = lines[0].trim().split(/\s+/).map(Number);
const tasks = lines[1].trim().split(/\s+/);

const sortedTasks = [...tasks].sort();
const idToTask = new Array<string>(N);
const taskToId = new Map<string, number>();
for (let i = 0; i < N; i++) {
    idToTask[i] = sortedTasks[i];
    taskToId.set(sortedTasks[i], i);
}

const adj: number[][] = new Array(N).fill(null).map(() => []);
const inDegree = new Array(N).fill(0);

for (let i = 0; i < M; i++) {
    const parts = lines[i + 2].trim().split(/\s+/);
    const u = taskToId.get(parts[0]);
    const v = taskToId.get(parts[1]);
    if (u !== undefined && v !== undefined) {
        adj[u].push(v);
        inDegree[v]++;
    }
}

const pq = new MinHeap();
for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0) {
        pq.push(i);
    }
}

const result: number[] = [];
while (pq.size > 0) {
    const u = pq.pop()!;
    result.push(u);

    for (const v of adj[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
            pq.push(v);
        }
    }
}

if (result.length < N) {
    console.log("IMPOSSIBLE");
} else {
    console.log(result.map(id => idToTask[id]).join(" "));
}
