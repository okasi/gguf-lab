import { readFileSync } from 'fs';

const data = readFileSync(0, 'utf8').trim().split('\n');
const [H, W] = data[0].split(/\s+/).map(Number);
const grid: string[] = data.slice(1);

const dx = [0, 0, 1, -1];
const dy = [1, -1, 0, 0];

const INF = Infinity;
const dist: number[][] = Array.from({ length: H }, () => new Array(W).fill(INF));

class MinHeap {
    private data: any[] = [];
    private key: (item: any) => number;

    constructor(key: (item: any) => number) {
        this.key = key;
    }

    push(item: any): void {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }

    pop(): any | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const bottom = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = bottom;
            this.siftDown(0);
        }
        return top;
    }

    private siftUp(index: number): void {
        const item = this.data[index];
        const k = this.key(item);
        while (index > 0) {
            const parent = (index - 1) >> 1;
            const parentItem = this.data[parent];
            if (k >= this.key(parentItem)) break;
            this.data[index] = parentItem;
            index = parent;
        }
        this.data[index] = item;
    }

    private siftDown(index: number): void {
        const half = this.data.length >> 1;
        let item = this.data[index];
        let k = this.key(item);
        while (index < half) {
            let child = (index << 1) + 1;
            const rightChild = child + 1;
            let childItem = this.data[child];
            if (rightChild < this.data.length && this.key(childItem) > this.key(this.data[rightChild])) {
                child = rightChild;
                childItem = this.data[child];
            }
            if (k <= this.key(childItem)) break;
            this.data[index] = childItem;
            index = child;
        }
        this.data[index] = item;
    }
}

const pq = new MinHeap(item => item[0]);

let startX = -1, startY = -1;
for (let x = 0; x < H; x++) {
    for (let y = 0; y < W; y++) {
        if (grid[x][y] === 'S') {
            startX = x;
            startY = y;
        }
    }
}

dist[startX][startY] = 0;
pq.push([0, startX, startY]);

while (true) {
    const top = pq.pop();
    if (!top) break;
    const [d, x, y] = top;

    if (d > dist[x][y]) continue;

    if (grid[x][y] === 'T') {
        console.log(d);
        process.exit(0);
    }

    for (let i = 0; i < 4; i++) {
        const nx = x + dx[i];
        const ny = y + dy[i];

        if (nx >= 0 && nx < H && ny >= 0 && ny < W) {
            const cell = grid[nx][ny];
            if (cell !== '#') {
                const cost = (cell === 'S' || cell === 'T') ? 0 : parseInt(cell);
                const newDist = d + cost;
