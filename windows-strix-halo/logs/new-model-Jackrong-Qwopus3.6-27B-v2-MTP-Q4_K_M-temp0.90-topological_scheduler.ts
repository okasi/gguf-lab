import * as fs from 'fs';

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    private parent(i: number): number {
        return (i - 1) >> 1;
    }

    private left(i: number): number {
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        const tmp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = tmp;
    }

    private siftUp(i: number): void {
        while (i > 0 && this.data[this.parent(i)] > this.data[i]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private siftDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l] < this.data[smallest]) smallest = l;
            if (r < n && this.data[r] < this.data[smallest]) smallest = r;
            if (smallest === i) break;
            this.swap(i, smallest);
            i = smallest;
        }
    }

    push(x: string): void {
        this.data.push(x);
        this.siftUp(this.data.length - 1);
    }

    pop(): string {
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    get empty(): boolean {
        return this.data.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [N, M] = lines[0].split(' ').map(Number);
    const tasks = lines[1].split(' ');

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const t of tasks) {
        adj.set(t, []);
        inDegree.set(t, 0);
    }

    for (let i = 2; i < 2 + M; i++) {
        const [a, b] = lines[i].split(' ');
        adj.get(a)!.push(b);
        inDegree.set(b, inDegree.get(b)! + 1);
    }

    const heap = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t)! === 0) {
            heap.push(t);
        }
    }

    const result: string[] = [];
    while (!heap.empty) {
        const current = heap.pop();
        result.push(current);
        for (const neighbor of adj.get(current)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor)! === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length !== N) {
        process.stdout.write('IMPOSSIBLE\n');
    } else {
        process.stdout.write(result.join(' ') + '\n');
    }
}

main();
