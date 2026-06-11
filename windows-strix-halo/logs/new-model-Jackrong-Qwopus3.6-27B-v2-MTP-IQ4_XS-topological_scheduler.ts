import fs from "fs";

class MinHeap {
    private items: string[];

    constructor() {
        this.items = [];
    }

    get size(): number {
        return this.items.length;
    }

    push(item: string): void {
        this.items.push(item);
        this._bubbleUp(this.items.length - 1);
    }

    pop(): string | undefined {
        if (this.items.length === 0) return undefined;
        const top = this.items[0];
        const last = this.items.pop()!;
        if (this.items.length > 0) {
            this.items[0] = last;
            this._sinkDown(0);
        }
        return top;
    }

    peek(): string | undefined {
        return this.items[0];
    }

    private _bubbleUp(idx: number): void {
        while (idx > 0) {
            const parentIdx = (idx - 1) >> 1;
            if (this.items[idx] < this.items[parentIdx]) {
                this._swap(idx, parentIdx);
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    private _sinkDown(idx: number): void {
        const n = this.items.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.items[left] < this.items[smallest]) {
                smallest = left;
            }
            if (right < n && this.items[right] < this.items[smallest]) {
                smallest = right;
            }
            if (smallest !== idx) {
                this._swap(idx, smallest);
                idx = smallest;
            } else {
                break;
            }
        }
    }

    private _swap(i: number, j: number): void {
        const temp = this.items[i];
        this.items[i] = this.items[j];
        this.items[j] = temp;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split(/\r?\n/);
    let idx = 0;

    const firstLineParts = lines[idx++].trim().split(/\s+/);
    const N = parseInt(firstLineParts[0], 10);
    const M = parseInt(firstLineParts[1], 10);

    const taskNames = lines[idx++].trim().split(/\s+/);

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const parts = lines[idx++].trim().split(/\s+/);
        const from = parts[0];
        const to = parts[1];
        adj.get(from)!.push(to);
        inDegree.set(to, inDegree.get(to)! + 1);
    }

    const pq = new MinHeap();
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (pq.size > 0) {
        const task = pq.pop()!;
        result.push(task);
        const neighbors = adj.get(task);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newInDegree = inDegree.get(neighbor)! - 1;
                inDegree.set(neighbor, newInDegree);
                if (newInDegree === 0) {
                    pq.push(neighbor);
                }
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

solve();
