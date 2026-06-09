import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split(/\r?\n/).filter(l => l.trim() !== '');
    let lineIdx = 0;
    
    const [N, M] = lines[lineIdx++].trim().split(/\s+/).map(Number);
    const tasks = lines[lineIdx++].trim().split(/\s+/);
    
    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();
    
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }
    
    for (let i = 0; i < M; i++) {
        const parts = lines[lineIdx++].trim().split(/\s+/);
        const A = parts[0];
        const B = parts[1];
        if (adj.has(A) && adj.has(B)) {
            adj.get(A)!.push(B);
            inDegree.set(B, inDegree.get(B)! + 1);
        }
    }
    
    class MinHeap {
        private heap: string[];
        
        constructor() {
            this.heap = [];
        }
        
        get size(): number {
            return this.heap.length;
        }
        
        insert(val: string): void {
            this.heap.push(val);
            this.bubbleUp(this.size - 1);
        }
        
        extract(): string | undefined {
            if (this.size === 0) return undefined;
            if (this.size === 1) return this.heap.pop();
            
            const top = this.heap[0];
            this.heap[0] = this.heap[this.size - 1];
            this.heap.pop();
            this.bubbleDown(0);
            return top;
        }
        
        private bubbleUp(idx: number): void {
            while (idx > 0) {
                const parent = Math.floor((idx - 1) / 2);
                if (this.heap[idx] < this.heap[parent]) {
                    [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                    idx = parent;
                } else {
                    break;
                }
            }
        }
        
        private bubbleDown(idx: number): void {
            const size = this.size;
            while (true) {
                let smallest = idx;
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;
                
                if (left < size && this.heap[left] < this.heap[smallest]) {
                    smallest = left;
                }
                if (right < size && this.heap[right] < this.heap[smallest]) {
                    smallest = right;
                }
                
                if (smallest !== idx) {
                    [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                    idx = smallest;
                } else {
                    break;
                }
            }
        }
    }
    
    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.insert(task);
        }
    }
    
    const result: string[] = [];
    while (heap.size > 0) {
        const current = heap.extract()!;
        result.push(current);
        
        for (const neighbor of adj.get(current)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.insert(neighbor);
            }
        }
    }
    
    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

main();
