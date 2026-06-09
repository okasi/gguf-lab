import * as fs from "fs";

class MinHeap {
    heap: [number, number, number][] = [];
    
    push(cost: number, y: number, x: number): void {
        this.heap.push([cost, y, x]);
        this.bubbleUp(this.heap.length - 1);
    }
    
    pop(): [number, number, number] | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    
    get size(): number {
        return this.heap.length;
    }
    
    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex][0] <= this.heap[index][0]) break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }
    
    private sinkDown(index: number): void {
        const length = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
            if (right < length && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
            if (smallest === index) break;
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split(/\s+/);
const H = parseInt(lines[0]);
const W = parseInt(lines[1]);
const grid: string[][] = [];
let startX = -1, startY = -1, endX = -1, endY = -1;

for (let i = 0; i < H; i++) {
    const row = lines[2 + i];
    grid.push(row.split(''));
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === 'S') {
            startX = j;
            startY = i;
        } else if (grid[i][j] === 'T') {
            endX = j;
            endY = i;
        }
    }
}

const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[startY][startX] = 0;
const heap = new MinHeap();
heap.push(0, startY, startX);

while (heap.size > 0) {
    const [cost, y, x] = heap.pop()!;
    if (cost > dist[y][x]) continue;
    if (y === endY && x === endX) {
        console.log(cost);
        process.exit(0);
    }

    for (const [dy, dx] of directions) {
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < H && nx >= 0 && nx < W && grid[ny][nx] !== '#') {
            const cell = grid[ny][nx];
            const cellCost = cell >= '0' && cell <= '9' ? parseInt(cell) : 0;
            const newCost = cost + cellCost;
            if (newCost < dist[ny][nx]) {
                dist[ny][nx] = newCost;
                heap.push(newCost, ny, nx);
            }
        }
    }
}

console.log(-1);
