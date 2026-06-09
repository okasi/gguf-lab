import * as fs from 'fs';

class MinHeap {
    private data: string[];
    constructor() {
        this.data = [];
    }
    push(val: string) {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }
    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    get length(): number {
        return this.data.length;
    }
    private siftUp(i: number) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.data[p] > this.data[i]) {
                [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
                i = p;
            } else {
                break;
            }
        }
    }
    private siftDown(i: number) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.data[l] < this.data[smallest]) smallest = l;
            if (r < n && this.data[r] < this.data[smallest]) smallest = r;
            if (smallest !== i) {
                [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
                i = smallest;
            } else {
                break;
            }
        }
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);

const [N, M] = lines[0].split(/\s+/).map(Number);
const tasks = lines[1].split(/\s+/);

const adj: Map<string, string[]> = new Map();
const inDegree: Map<string, number> = new Map();

for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const [A, B] = lines[2 + i].split(/\s+/);
    adj.get(A)!.push(B);
    inDegree.set(B, inDegree.get(B)! + 1);
}

const pq = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}

const result: string[] = [];
while (pq.length > 0) {
    const u = pq.pop()!;
    result.push(u);
    for (const v of adj.get(u)!) {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) {
            pq.push(v);
        }
    }
}

if (result.length === N) {
    console.log(result.join(' '));
} else {
    console.log('IMPOSSIBLE');
}
