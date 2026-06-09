import * as fs from 'fs';

class MinHeap<T> {
    private heap: T[] = [];
    constructor(private compare: (a: T, b: T) => number) {}

    push(val: T): void {
        this.heap.push(val);
        let idx = this.heap.length - 1;
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.compare(this.heap[idx], this.heap[parent]) < 0) {
                const tmp = this.heap[idx];
                this.heap[idx] = this.heap[parent];
                this.heap[parent] = tmp;
                idx = parent;
            } else {
                break;
            }
        }
    }

    pop(): T | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            let idx = 0;
            while (true) {
                const left = (idx << 1) + 1;
                const right = (idx << 1) + 2;
                let smallest = idx;
                if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                    smallest = left;
                }
                if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                    smallest = right;
                }
                if (smallest !== idx) {
                    const tmp = this.heap[idx];
                    this.heap[idx] = this.heap[smallest];
                    this.heap[smallest] = tmp;
                    idx = smallest;
                } else {
                    break;
                }
            }
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }
}

function main() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 2) return;

    let cursor = 0;
    const N = parseInt(tokens[cursor++]);
    const M = parseInt(tokens[cursor++]);

    const taskNames: string[] = [];
    for (let i = 0; i < N; i++) {
        taskNames.push(tokens[cursor++]);
    }

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const name of taskNames) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }

    for (let i = 0; i < M; i++) {
        const u = tokens[cursor++];
        const v = tokens[cursor++];
        if (u !== undefined && v !== undefined) {
            adj.get(u)!.push(v);
            inDegree.set(v, (inDegree.get(v) || 0) + 1);
        }
    }

    const pq = new MinHeap<string>((a, b) => (a < b ? -1 : a > b ? 1 : 0));

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
                const currentInDegree = inDegree.get(v)! - 1;
                inDegree.set(v, currentInDegree);
                if (currentInDegree === 0) {
                    pq.push(v);
                }
            }
        }
    }

    if (result.length === N) {
        process.stdout.write(result.join(" ") + "\n");
    } else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}

main();
