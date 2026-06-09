import * as fs from "fs";

type Cell = [number, number, number]; // cost, x, y

class MinHeap {
    private data: Cell[] = [];

    push(item: Cell): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): Cell | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    get size(): number {
        return this.data.length;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (this.data[i][0] < this.data[p][0]) {
                [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
                i = p;
            } else {
                break;
            }
        }
    }

    private bubbleDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n && this.data[left][0] < this.data[smallest][0]) {
                smallest = left;
            }
            if (right < n && this.data[right][0] < this.data[smallest][0]) {
                smallest = right;
            }

            if (smallest !== i) {
                [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
                i = smallest;
            } else {
                break;
            }
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [H, W] = lines[0].split(" ").map(Number);

const grid: string[] = lines.slice(1, H + 1);
let start: [number, number] = [-1, -1];

for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
        if (grid[i][j] === "S") {
            start = [i, j];
        }
    }
}

const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
const pq = new MinHeap();

dist[start[0]][start[1]] = 0;
pq.push([0, start[0], start[1]]);

const dirs: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];

while (pq.size > 0) {
    const [d, x, y] = pq.pop()!;

    if (d > dist[x][y]) continue;

    if (grid[x][y] === "T") {
        console.log(d);
        process.exit(0);
    }

    for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < H && ny >= 0 && ny < W && grid[nx][ny] !== "#") {
            const cost = grid[nx][ny] === "T" || grid[nx][ny] === "S" ? 0 : parseInt(grid[nx][ny], 10);
            const newDist = d + cost;

            if (newDist < dist[nx][ny]) {
                dist[nx][ny] = newDist;
                pq.push([newDist, nx, ny]);
            }
        }
    }
}

console.log(-1);
