import fs from 'fs';

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    public push(item: string): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    public pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        if (this.data.length === 1) return this.data.pop();

        const item = this.data[0];
        const end = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = end;
            this.bubbleDown(0);
        }
        return item;
    }

    public isEmpty(): boolean {
        return this.data.length === 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.data[index] < this.data[parent]) {
                [this.data[index], this.data[parent]] = [this.data[parent], this.data[index]];
                index = parent;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        const length = this.data.length;
        while (2 * index + 1 < length) {
            let leftChild = 2 * index + 1;
            let rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < length && this.data[leftChild] < this.data[smallest]) {
                smallest = leftChild;
            }
            if (rightChild < length && this.data[rightChild] < this.data[smallest]) {
                smallest = rightChild;
            }

            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function main() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return;

    const [N, M] = lines[0].split(/\s+/).map(Number);
    const taskNames = lines[1].split(/\s+/);

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();
    const allTasks = new Set<string>();

    for (const task of taskNames) {
        allTasks.add(task);
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 2; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/);
        if (parts.length < 2) continue;
        const u = parts[0];
        const v = parts[1];

        if (!adj.has(u)) {
            adj.set(u, []);
            inDegree.set(u, 0);
        }
        if (!inDegree.has(v)) {
            inDegree.set(v, 0);
        }

        adj.get(u)!.push(v);
        inDegree.set(v, inDegree.get(v) + 1);
    }

    const heap = new MinHeap();
    for (const [task, degree] of inDegree) {
        if (degree === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const task = heap.pop();
        if (!task) break;
        result.push(task);

        const neighbors = adj.get(task) || [];
        for (const neighbor of neighbors) {
            const currentDegree = inDegree.get(neighbor)!;
            inDegree.set(neighbor, currentDegree - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length === taskNames.length) {
        console.log(result.join(' '));
    } else {
        console.log('IMPOSSIBLE');
    }
}

main();
