import * as fs from 'fs';

class MinBinaryHeap {
    private data: string[] = [];

    private getLeftIndex(i: number): number {
        return 2 * i + 1;
    }

    private getRightIndex(i: number): number {
        return 2 * i + 2;
    }

    private getParentIndex(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private swap(i: number, j: number): void {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }

    private siftUp(): void {
        let currentIndex = 0;
        while (currentIndex > 0) {
            const parentIndex = this.getParentIndex(currentIndex);
            if (this.data[parentIndex] <= this.data[currentIndex]) {
                break;
            }
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
        }
    }

    private siftDown(): void {
        let currentIndex = 0;
        const length = this.data.length;
        while (this.getLeftIndex(currentIndex) < length) {
            let leftIndex = this.getLeftIndex(currentIndex);
            let rightIndex = this.getRightIndex(currentIndex);
            let smallerIndex = leftIndex;

            if (rightIndex < length && this.data[rightIndex] < this.data[leftIndex]) {
                smallerIndex = rightIndex;
            }

            if (this.data[currentIndex] <= this.data[smallerIndex]) {
                break;
            }

            this.swap(currentIndex, smallerIndex);
            currentIndex = smallerIndex;
        }
    }

    public push(item: string): void {
        this.data.push(item);
        this.siftUp();
    }

    public pop(): string | undefined {
        if (this.data.length === 0) {
            return undefined;
        }
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown();
        }
        return top;
    }

    public isEmpty(): boolean {
        return this.data.length === 0;
    }

    public size(): number {
        return this.data.length;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    let lineIndex = 0;

    const firstLine = lines[lineIndex++].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    const taskNames = lines[lineIndex++].trim().split(/\s+/);
    
    // Map task name to index
    const nameToIndex = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        nameToIndex.set(taskNames[i], i);
    }

    // Adjacency list and in-degree array
    const adj: number[][] = new Array(N).fill(null).map(() => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const edge = lines[lineIndex++].trim().split(/\s+/);
        const fromName = edge[0];
        const toName = edge[1];
        
        const fromIdx = nameToIndex.get(fromName)!;
        const toIdx = nameToIndex.get(toName)!;
        
        adj[fromIdx].push(toIdx);
        inDegree[toIdx]++;
    }

    const pq = new MinBinaryHeap();
    
    // Initialize heap with tasks that have no dependencies
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(taskNames[i]);
        }
    }

    const buildOrder: string[] = [];
    
    while (!pq.isEmpty()) {
        const currentName = pq.pop()!;
        const currentIdx = nameToIndex.get(currentName)!;
        
        buildOrder.push(currentName);
        
        for (const neighborIdx of adj[currentIdx]) {
            inDegree[neighborIdx]--;
            if (inDegree[neighborIdx] === 0) {
                pq.push(taskNames[neighborIdx]);
            }
        }
    }

    if (buildOrder.length !== N) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(buildOrder.join(' '));
    }
}

solve();
