import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [H, W] = input[0].split(' ').map(Number);
const grid: string[][] = [];
for (let i = 1; i <= H; i++) {
    grid.push(input[i].split(''));
}

// locate S and T
let sR = -1, sC = -1, tR = -1, tC = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === 'S') {
            sR = r; sC = c;
        } else if (grid[r][c] === 'T') {
            tR = r; tC = c;
        }
    }
}

// cost to enter cell
const cost: number[][] = [];
for (let r = 0; r < H; r++) {
    const row: number[] = [];
    for (let c = 0; c < W; c++) {
        const ch = grid[r][c];
        if (ch === '#') {
            row.push(Infinity); // blocked
        } else if (ch >= '0' && ch <= '9') {
            row.push(parseInt(ch));
        } else { // S or T
            row.push(0);
        }
    }
    cost.push(row);
}

// Dijkstra
const dist: number[][] = [];
for (let r = 0; r < H; r++) {
    dist.push(new Array(W).fill(Infinity));
}
dist[sR][sC] = 0;

// Min-heap
class MinHeap {
    private heap: [number, number, number][] = [];
    private parent(i: number): number { return Math.floor((i - 1) / 2); }
    private left(i: number): number { return 2 * i + 1; }
    private right(i: number): number { return 2 * i + 2; }
    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    private bubbleUp(i: number) {
        while (i > 0 && this.heap[i][0] < this.heap[this.parent(i)][0]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }
    private bubbleDown(i: number) {
        let size = this.heap.length;
        while (true) {
            let smallest = i;
            let l = this.left(i);
            let r = this.right(i);
            if (l < size && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
            if (r < size && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }
    push(item: [number, number, number]) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop(): [number, number, number] | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    peek(): [number, number, number] | undefined {
        return this.heap[0];
    }
    size(): number {
        return this.heap.length;
    }
}

const pq = new MinHeap();
pq.push([0, sR, sC]);

const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

while (pq.size() > 0) {
    const [d, r, c] = pq.pop()!;
    if (d > dist[r][c]) continue; // stale
    if (r === tR && c === tC) {
        console.log(d);
        return; // exit
    }
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
        const cellCost = cost[nr][nc];
        if (cellCost === Infinity) continue; // wall
        const newDist = d + cellCost;
        if (newDist < dist[nr][nc]) {
            dist[nr][nc] = newDist;
            pq.push([newDist, nr, nc]);
        }
    }
}
console.log(-1);
