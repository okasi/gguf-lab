import * as fs from "fs";

class MinHeap {
    private data: [number, number, number][] = [];

    push(item: [number, number, number]): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): [number, number, number] | undefined {
        if (this.data.length === 0) return undefined;
        if (this.data.length === 1) return this.data.pop()!;

        const top = this.data[0];
        this.data[0] = this.data.pop()!;
        this.bubbleDown(0);
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parentIndex = Math.floor((i - 1) / 2);
            if (this.data[parentIndex][0] <= this.data[i][0]) break;
            const temp = this.data[i];
            this.data[i] = this.data[parentIndex];
            this.data[parentIndex] = temp;
            i = parentIndex;
        }
    }

    private bubbleDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n && this.data[left][0] < this.data[smallest][0]) smallest = left;
            if (right < n && this.data[right][0] < this.data[smallest][0]) smallest = right;

            if (smallest === i) break;
            const temp = this.data[i];
            this.data[i] = this.data[smallest];
            this.data[smallest] = temp;
            i = smallest;
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [H, W] = lines[0].trim().split(/\s+/).map(Number);

const grid: string[][] = [];
let start: [number, number] = [-1, -1];
let target: [number, number] = [-1, -1];

for (let i = 0; i < H; i++) {
    const line = lines[i + 1];
    grid.push(line.split(""));
    for (let j = 0; j < line.length; j++) {
        if (line[j] === 'S') start = [i, j];
        if (line[j] === 'T') target = [i, j];
    }
}

const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[start[0]][start[1]] = 0;

const pq = new MinHeap();
pq.push([0, start[0], start[1]]);

while (!pq.isEmpty()) {
    const [d, r, c] = pq.pop()!;

    if (r === target[0] && c === target[1]) {
        console.log(d);
        process.exit(0);
    }

    if (d > dist[r][c]) continue;

    for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
            const cell = grid[nr][nc];
            if (cell !== '#') {
                const cost = (cell === 'S' || cell === 'T') ? 0 : parseInt(cell);
                const newDist = d + cost;
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.push([newDist, nr, nc]);
                }
            }
        }
    }
}

console.log(-1);
