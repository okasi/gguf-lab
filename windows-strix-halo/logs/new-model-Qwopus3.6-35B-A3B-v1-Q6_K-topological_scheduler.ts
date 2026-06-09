import * as fs from 'fs';

// MinHeap implementation for lexicographical ordering
class MinHeap {
    private heap: string[] = [];

    push(item: string): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last !== undefined) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    get size(): number {
        return this.heap.length;
    }

    private compare(a: string, b: string): number {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left <= lastIndex && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right <= lastIndex && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n').filter(line => line.trim() !== '');

    if (lines.length < 2) {
        return;
    }

    const firstLine = lines[0].trim().split(/\s+/);
    const n = parseInt(firstLine[0], 10);
    const m = parseInt(firstLine[1], 10);

    const tasks = lines[1].trim().split(/\s+/);

    if (tasks.length !== n) {
        return;
    }

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length < 2) {
            continue;
        }
        const from = parts[0];
        const to = parts[1];

        if (adj.has(from) && adj.has(to)) {
            adj.get(from)!.push(to);
            inDegree.set(to, (inDegree.get(to) || 0) + 1);
        }
    }

    const heap = new MinHeap();

    for (const task of tasks) {
        if ((inDegree.get(task) || 0) === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];

    while (heap.size > 0) {
        const current = heap.pop();
        if (current === undefined) {
            break;
        }

        result.push(current);

        const neighbors = adj.get(current) || [];
        for (const neighbor of neighbors) {
            const degree = inDegree.get(neighbor) || 0;
            inDegree.set(neighbor, degree - 1);
            if (degree - 1 === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length !== n) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(result.join(' '));
    }
}

main();
