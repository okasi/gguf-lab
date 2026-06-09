import * as fs from 'fs';

class MinHeap<T> {
    private items: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    push(item: T): void {
        this.items.push(item);
        this.siftUp(this.items.length - 1);
    }

    pop(): T | undefined {
        if (this.items.length === 0) return undefined;
        const top = this.items[0];
        const last = this.items.pop()!;
        if (this.items.length > 0) {
            this.items[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    peek(): T | undefined {
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    private siftUp(index: number): void {
        const item = this.items[index];
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.compare(item, this.items[parentIndex]) < 0) {
                this.items[index] = this.items[parentIndex];
                index = parentIndex;
            } else {
                break;
            }
        }
        this.items[index] = item;
    }

    private siftDown(index: number): void {
        const item = this.items[index];
        const halfLength = this.items.length >> 1;
        while (index < halfLength) {
            let leftChild = (index << 1) + 1;
            let rightChild = leftChild + 1;
            let smallest = leftChild;
            if (rightChild < this.items.length && this.compare(this.items[rightChild], this.items[leftChild]) < 0) {
                smallest = rightChild;
            }
            if (this.compare(item, this.items[smallest]) <= 0) {
                break;
            }
            this.items[index] = this.items[smallest];
            index = smallest;
        }
        this.items[index] = item;
    }
}

type Item = { cost: number; r: number; c: number };

const data = fs.readFileSync(0, 'utf8').trim();
const lines = data.split(/\r?\n/);
const firstLine = lines[0].trim().split(/\s+/).map(Number);
const H = firstLine[0];
const W = firstLine[1];

const grid: string[] = lines.slice(1, H + 1).map(line => line.trim());

let sr = -1, sc = -1, tr = -1, tc = -1;
for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
        const ch = grid[i][j];
        if (ch === 'S') { sr = i; sc = j; }
        else if (ch === 'T') { tr = i; tc = j; }
    }
}

const dist: number[][] = Array.from({ length: H }, () => new Array(W).fill(Infinity));
dist[sr][sc] = 0;

const heap = new MinHeap<Item>((a, b) => a.cost - b.cost);
heap.push({ cost: 0, r: sr, c: sc });

const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

while (!heap.isEmpty()) {
    const { cost: d, r, c } = heap.pop()!;
    if (d > dist[r][c]) continue;
    if (r === tr && c === tc) {
        console.log(d);
        process.exit(0);
    }
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
        const ch = grid[nr][nc];
        if (ch === '#') continue;
        let enterCost = 0;
        if (ch >= '0' && ch <= '9') {
            enterCost = parseInt(ch);
        } else if (ch === 'T' || ch === 'S') {
            enterCost = 0;
        } else {
            enterCost = 0;
        }
        const newDist = d + enterCost;
        if (newDist < dist[nr][nc]) {
            dist[nr][nc] = newDist;
            heap.push({ cost: newDist, r: nr, c: nc });
        }
    }
}

if (dist[tr][tc] !== Infinity) {
    console.log(dist[tr][tc]);
} else {
    console.log(-1);
}
