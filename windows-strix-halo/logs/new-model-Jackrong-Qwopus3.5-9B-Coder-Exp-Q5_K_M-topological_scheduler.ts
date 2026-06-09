import * as fs from "fs";

class MinHeap {
    private heap: string[];

    constructor() {
        this.heap = [];
    }

    push(task: string) {
        this.heap.push(task);
        this._bubbleUp(this.heap.length - 1);
    }

    pop(): string {
        if (this.heap.length === 0) return "";
        const result = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._bubbleDown(0);
        }
        return result;
    }

    private _bubbleUp(i: number) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[i] < this.heap[parent]) {
                [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
                i = parent;
            } else {
                break;
            }
        }
    }

    private _bubbleDown(i: number) {
        const length = this.heap.length;
        while (2 * i + 1 < length) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;
            if (left < length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            } else {
                break;
            }
        }
    }
}

function main() {
    const data = fs.readFileSync(0, "utf8");
    const trimmedData = data.trim();
    if (trimmedData === "") {
        return;
    }
    const lines = trimmedData.split("\n").filter(line => line.trim() !== "");

    const [N, M] = lines[0].split(" ").map(Number);
    const taskNames = lines[1].split(" ").map(String);

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (let i = 0; i < N; i++) {
        if (!adj.has(taskNames[i])) {
            adj.set(taskNames[i], []);
        }
        if (!inDegree.has(taskNames[i])) {
            inDegree.set(taskNames[i], 0);
        }
    }

    for (let i = 2; i < lines.length; i++) {
        const [A, B] = lines[i].split(" ").map(String);
        if (!adj.has(A)) {
            adj.set(A, []);
        }
        if (!adj.has(B)) {
            adj.set(B, []);
        }
        adj.get(A)!.push(B);
        inDegree.set(B, (inDegree.get(B) || 0) + 1);
    }

    const heap = new MinHeap();
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }

    const buildOrder: string[] = [];
    while (heap.heap.length > 0) {
        const current = heap.pop();
        buildOrder.push(current);
        const neighbors = adj.get(current);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newInDegree = inDegree.get(neighbor) - 1;
                inDegree.set(neighbor, newInDegree);
                if (newInDegree === 0) {
                    heap.push(neighbor);
                }
            }
        }
    }

    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(" "));
    }
}

main();
