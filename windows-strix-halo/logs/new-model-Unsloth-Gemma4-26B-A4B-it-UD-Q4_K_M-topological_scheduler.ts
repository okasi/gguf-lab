import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    push(val: string): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parent]) {
                const temp = this.heap[index];
                this.heap[index] = this.heap[parent];
                this.heap[parent] = temp;
                index = parent;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest !== index) {
                const temp = this.heap[index];
                this.heap[index] = this.heap[smallest];
                this.heap[smallest] = temp;
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function main(): void {
    let input: string;
    try {
        input = fs.readFileSync(0, "utf8");
    } catch (e) {
        return;
    }
    
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 2) return;

    let idx = 0;
    const N = parseInt(tokens[idx++]);
    const M = parseInt(tokens[idx++]);

    const taskNames: string[] = [];
    for (let i = 0; i < N; i++) {
        taskNames.push(tokens[idx++]);
    }

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const name of taskNames) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }

    for (let i = 0; i < M; i++) {
        const u = tokens[idx++];
        const v = tokens[idx++];
        if (u !== undefined && v !== undefined) {
            const uAdj = adj.get(u);
            if (uAdj !== undefined) {
                uAdj.push(v);
            }
            const currentInDegree = inDegree.get(v) || 0;
            inDegree.set(v, currentInDegree + 1);
        }
    }

    const pq = new MinHeap();
    for (const name of taskNames) {
        if ((inDegree.get(name) || 0) === 0) {
            pq.push(name);
        }
    }

    const result: string[] = [];
    while (pq.size() > 0) {
        const u = pq.pop()!;
        result.push(u);

        const neighbors = adj.get(u);
        if (neighbors) {
            for (const v of neighbors) {
                const currentDegree = inDegree.get(v) || 0;
                const newDegree = currentDegree - 1;
                inDegree.set(v, newDegree);
                if (newDegree === 0) {
                    pq.push(v);
                }
            }
        }
    }

    if (result.length === N) {
        process.stdout.write(result.join(' ') + '\n');
    } else {
        process.stdout.write('IMPOSSIBLE\n');
    }
}

main();
