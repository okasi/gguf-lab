import * as fs from 'fs';

class MinHeap {
    private heap: [number, number, number][] = [];

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.heap[parent][0] > this.heap[idx][0]) {
                this.swap(parent, idx);
                idx = parent;
            } else {
                break;
            }
        }
    }

    private sinkDown(idx: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
            if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
            if (smallest !== idx) {
                this.swap(idx, smallest);
                idx = smallest;
            } else {
                break;
            }
        }
    }

    push(item: [number, number, number]): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): [number, number, number] | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom!;
            this.sinkDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    const [H, W] = input[0].split(' ').map(Number);
    const grid = input.slice(1);

    let startR = -1, startC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;

    const pq = new MinHeap();
    pq.push([0, startR, startC]);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (!pq.isEmpty()) {
        const [d, r, c] = pq.pop()!;
        
        if (d > dist[r][c]) continue;
        
        if (grid[r][c] === 'T') {
            console.log(d);
            return;
        }
        
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
            
            const cell = grid[nr][nc];
            if (cell === '#') continue;
            
            const cost = (cell >= '0' && cell <= '9') ? parseInt(cell) : 0;
            const newDist = d + cost;
            
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                pq.push([newDist, nr, nc]);
            }
        }
    }

    console.log(-1);
}

main();
