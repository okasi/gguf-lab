import * as fs from 'fs';

    class BinaryHeap<T> {
        private heap: T[];
        private comparator: (a: T, b: T) => number;

        constructor(comparator: (a: T, b: T) => number) {
            this.heap = [];
            this.comparator = comparator;
        }

        push(item: T): void {
            this.heap.push(item);
            this.bubbleUp(this.heap.length - 1);
        }

        pop(): T | null {
            if (this.heap.length === 0) return null;
            const result = this.heap[0];
            const last = this.heap.pop()!;
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this.bubbleDown(0);
            }
            return result;
        }

        private bubbleUp(index: number): void {
            const parent = Math.floor((index - 1) / 2);
            if (index > 0 && this.comparator(this.heap[index], this.heap[parent]) < 0) {
                [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
                this.bubbleUp(parent);
            }
        }

        private bubbleDown(index: number): void {
            const length = this.heap.length;
            while (true) {
                const left = 2 * index + 1;
                const right = 2 * index + 2;
                let smallest = index;

                if (left < length && this.comparator(this.heap[left], this.heap[smallest]) < 0) {
                    smallest = left;
                }
                if (right < length && this.comparator(this.heap[right], this.heap[smallest]) < 0) {
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

    // Main execution
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
        console.log('');
        return;
    }

    const [N, M] = lines[0].split(/\s+/).map(Number);
    const taskNames = lines[1].split(/\s+/);
    // Validate N
    if (taskNames.length !== N) {
        // Handle mismatch if input is weird, but assume valid per spec
        // Actually spec says "N distinct task names".
    }

    const nameToId = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        nameToId.set(taskNames[i], i);
    }

    const adj: number[][] = Array.from({ length: N }, () => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 2; i < lines.length; i++) {
        const [A, B] = lines[i].split(/\s+/);
        const idA = nameToId.get(A);
        const idB = nameToId.get(B);
        if (idA !== undefined && idB !== undefined) {
            adj[idA].push(idB);
            inDegree[idB]++;
        }
    }

    const heap = new BinaryHeap<number>((a, b) => {
        const nameA = taskNames[a];
        const nameB = taskNames[b];
        return nameA.localeCompare(nameB);
    });

    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(i);
        }
    }

    const result: number[] = [];
    while (heap.length > 0) {
        const u = heap.pop();
        if (u === null) break;
        result.push(u);
        for (const v of adj[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                heap.push(v);
            }
        }
    }

    if (result.length === N) {
        console.log(result.map(id => taskNames[id]).join(' '));
    } else {
        console.log('IMPOSSIBLE');
    }
