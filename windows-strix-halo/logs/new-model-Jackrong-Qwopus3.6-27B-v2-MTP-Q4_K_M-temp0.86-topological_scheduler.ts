import * as fs from 'fs';

class MinHeap {
    private data: string[] = [];

    private parent(i: number): number { return (i - 1) >> 1; }
    private left(i: number): number { return 2 * i + 1; }
    private right(i: number): number { return 2 * i + 2; }

    private swap(i: number, j: number): void {
        const tmp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = tmp;
    }

    push(val: string): void {
        this.data.push(val);
        this.siftUp(this.data.length - 1);
    }

    pop(): string | null {
        if (this.data.length === 0) return null;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    get size(): number { return this.data.length; }
    get isEmpty(): boolean { return this.data.length === 0; }

    private siftUp(i: number): void {
        while (i > 0) {
            const p = this.parent(i);
            if (this.data[p] > this.data[i]) {
                this.swap(i, p);
                i = p;
            } else break;
        }
    }

    private siftDown(i: number): void {
        const n = this.data.length;
        while (true) {
            const l = this.left(i);
            const r = this.right(i);
            let smallest = i;
            if (l < n && this.data[l] < this.data[smallest]) smallest = l;
            if (r < n && this.data[r] < this.data[smallest]) smallest = r;
            if (smallest === i) break;
            this.swap(i, smallest);
            i = smallest;
        }
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const firstLine = lines[0].split(/\s+/);
const N = parseInt(firstLine[0], 10);
const M = parseInt(firstLine[1], 10);

const tasks = lines[1].split(/\s+/);

const adj = new Map<string, string[]>();
const inDegree = new Map<string, number>();

for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
}

for (let i = 0; i < M; i++) {
    const parts = lines[2 + i].split(/\s+/);
    const a = parts[0];
    const b = parts[1];
    adj.get(a)!.push(b);
    inDegree.set(b, inDegree.get(b)! + 1);
}

const heap = new MinHeap();
for (const t of tasks) {
    if (inDegree.get(t) === 0) {
        heap.push(t);
    }
}

const result: string[] = [];
while (!heap.isEmpty) {
    const task = heap.pop()!;
    result.push(task);
    for (const nb of adj.get(task)!) {
        inDegree.set(nb, inDegree.get(nb)! - 1);
        if (inDegree.get(nb) === 0) {
            heap.push(nb);
        }
    }
}

if (result.length < N) {
    console.log('IMPOSSIBLE');
} else {
    console.log(result.join(' '));
}
