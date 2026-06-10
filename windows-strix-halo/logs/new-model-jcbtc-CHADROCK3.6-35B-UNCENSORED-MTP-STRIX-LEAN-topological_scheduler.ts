import fs from "fs";

interface MinHeap<T> {
    elements: T[];
    compare: (a: T, b: T) => number;
    swap(i: number, j: number): void;
    push(item: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    size(): number;
}

class BinaryMinHeap implements MinHeap<string> {
    public elements: string[] = [];
    private compare: (a: string, b: string) => number;

    constructor(compare: (a: string, b: string) => number) {
        this.compare = compare;
    }

    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private leftChild(i: number): number {
        return 2 * i + 1;
    }

    private rightChild(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        const temp = this.elements[i];
        this.elements[i] = this.elements[j];
        this.elements[j] = temp;
    }

    public push(item: string): void {
        this.elements.push(item);
        this.siftUp(this.elements.length - 1);
    }

    public pop(): string | undefined {
        if (this.elements.length === 0) {
            return undefined;
        }
        const result = this.elements[0];
        const last = this.elements.pop()!;
        if (this.elements.length > 0) {
            this.elements[0] = last;
            this.siftDown(0);
        }
        return result;
    }

    public peek(): string | undefined {
        return this.elements.length > 0 ? this.elements[0] : undefined;
    }

    public size(): number {
        return this.elements.length;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = this.parent(index);
            if (this.compare(this.elements[index], this.elements[parentIndex]) < 0) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private siftDown(index: number): void {
        const lastIndex = this.elements.length - 1;
        while (true) {
            const leftIndex = this.leftChild(index);
            const rightIndex = this.rightChild(index);
            let smallest = index;

            if (leftIndex <= lastIndex && this.compare(this.elements[leftIndex], this.elements[smallest]) < 0) {
                smallest = leftIndex;
            }
            if (rightIndex <= lastIndex && this.compare(this.elements[rightIndex], this.elements[smallest]) < 0) {
                smallest = rightIndex;
            }

            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split("\n").filter(line => line.trim() !== "");
    
    if (lines.length < 2) {
        console.log("IMPOSSIBLE");
        return;
    }

    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    if (isNaN(N) || isNaN(M) || N <= 0 || M < 0) {
        console.log("IMPOSSIBLE");
        return;
    }

    const taskNamesLine = lines[1].trim().split(/\s+/);
    const taskNames = taskNamesLine.filter(name => name.length > 0);

    if (taskNames.length !== N) {
        console.log("IMPOSSIBLE");
        return;
    }

    const adjacencyList: Map<string, Set<string>> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const name of taskNames) {
        adjacencyList.set(name, new Set());
        inDegree.set(name, 0);
    }

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) continue;
        const parts = line.split(/\s+/);
        if (parts.length < 2) continue;
        const from = parts[0];
        const to = parts[1];

        if (!adjacencyList.has(from) || !adjacencyList.has(to)) {
            console.log("IMPOSSIBLE");
            return;
        }

        if (!adjacencyList.get(from)!.has(to)) {
            adjacencyList.get(from)!.add(to);
            inDegree.set(to, inDegree.get(to)! + 1);
        }
    }

    const minHeap = new BinaryMinHeap((a: string, b: string) => a.localeCompare(b));

    for (const name of taskNames) {
        if (inDegree.get(name)! === 0) {
            minHeap.push(name);
        }
    }

    const buildOrder: string[] = [];

    while (minHeap.size() > 0) {
        const current = minHeap.pop()!;
        buildOrder.push(current);

        const neighbors = adjacencyList.get(current)!;
        for (const neighbor of neighbors) {
            const newDegree = inDegree.get(neighbor)! - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
                minHeap.push(neighbor);
            }
        }
    }

    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(" "));
    }
}

solve();
