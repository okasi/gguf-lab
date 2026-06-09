import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

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
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    push(item: string): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const top = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return top;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const p = this.parent(i);
            if (this.heap[p] <= this.heap[i]) {
                break;
            }
            this.swap(p, i);
            i = p;
        }
    }

    private bubbleDown(i: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);

            if (l < n && this.heap[l] < this.heap[smallest]) {
                smallest = l;
            }
            if (r < n && this.heap[r] < this.heap[smallest]) {
                smallest = r;
            }

            if (smallest === i) {
                break;
            }

            this.swap(i, smallest);
            i = smallest;
        }
    }

    get size(): number {
        return this.heap.length;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length === 0) {
        return;
    }

    const lines = input.split('\n');
    const [nStr, mStr] = lines[0].split(' ');
    const N = parseInt(nStr, 10);
    const M = parseInt(mStr, 10);

    const tasks = lines[1].split(' ');

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();
    const pq = new MinHeap();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < 2 + M; i++) {
        const parts = lines[i].trim().split(' ');
        const from = parts[0];
        const to = parts[1];
        adj.get(from)!.push(to);
        inDegree.set(to, inDegree.get(to)! + 1);
    }

    for (const task of tasks) {
        if (inDegree.get(task)! === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];

    while (pq.size > 0) {
        const task = pq.pop()!;
        result.push(task);

        for (const neighbor of adj.get(task)!) {
            const deg = inDegree.get(neighbor)!;
            if (deg === 1) {
                pq.push(neighbor);
            }
            inDegree.set(neighbor, deg - 1);
        }
    }

    if (result.length < N) {
        process.stdout.write("IMPOSSIBLE\n");
    } else {
        process.stdout.write(result.join(' ') + "\n");
    }
}

main();
