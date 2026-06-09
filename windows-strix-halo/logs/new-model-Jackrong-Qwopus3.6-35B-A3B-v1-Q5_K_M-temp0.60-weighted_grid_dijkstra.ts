import * as fs from "fs";

class MinHeap {
    private data: [number, number, number][] = [];

    push(item: [number, number, number]): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): [number, number, number] | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    get size(): number {
        return this.data.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[parentIndex][0] <= this.data[index][0]) break;
            [this.data[parentIndex], this.data[index]] = [this.data[index], this.data[parentIndex]];
            index = parentIndex;
        }
    }

    private sinkDown(index: number): void {
        const length = this.data.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex < length && this.data[leftChildIndex][0] < this.data[smallest][0]) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < length && this.data[rightChildIndex][0] < this.data[smallest][0]) {
                smallest = rightChildIndex;
            }

            if (smallest === index) break;
            [this.data[smallest], this.data[index]] = [this.data[index], this.data[smallest]];
            index = smallest;
        }
    }
}

const input = fs.readFileSync(0, "utf8").trim().split("\n");
const [H, W] = input[0].split(" ").map(Number);
const grid = input.slice(1).map(row => row.split(""));

let start: [number, number] | null = null;
let target: [number, number] | null = null;

for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === "S") start = [r, c];
        if (grid[r][c] === "T") target = [r, c];
    }
}

if (!start || !target) {
    console.log(-1);
} else {
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const visited: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));
    const pq = new MinHeap();

    const [sx, sy] = start;
    dist[sx][sy] = 0;
    pq.push([0, sx, sy]);

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (pq.size > 0) {
        const item = pq.pop();
        if (!item) break;

        const [cost, x, y] = item;

        if (visited[x][y]) continue;
        visited[x][y] = true;

        if (x === target![0] && y === target![1]) {
            console.log(cost);
            process.exit(0);
        }

        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < H && ny >= 0 && ny < W && !visited[nx][ny]) {
                const cell = grid[nx][ny];
                if (cell !== "#") {
                    const weight = cell === "S" || cell === "T" ? 0 : +cell;
                    const newCost = cost + weight;
                    if (newCost < dist[nx][ny]) {
                        dist[nx][ny] = newCost;
                        pq.push([newCost, nx, ny]);
                    }
                }
            }
        }
    }

    console.log(-1);
}
