import * as fs from 'fs';

class MinHeap {
    private data: [number, number, number][] = [];

    push(item: [number, number, number]): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): [number, number, number] {
        const min = this.data[0];
        const end = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = end;
            this.sinkDown(0);
        }
        return min;
    }

    get length(): number {
        return this.data.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[index][0] < this.data[parentIndex][0]) {
                [this.data[index], this.data[parentIndex]] = [this.data[parentIndex], this.data[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        const length = this.data.length;
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex < length && this.data[leftChildIndex][0] < this.data[smallest][0]) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < length && this.data[rightChildIndex][0] < this.data[smallest][0]) {
                smallest = rightChildIndex;
            }
            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);
    const grid = lines.slice(1, H + 1).map(row => row.trim().split(""));

    let startR = -1;
    let startC = -1;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === "S") {
                startR = i;
                startC = j;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;

    const pq = new MinHeap();
    pq.push([0, startR, startC]);

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (pq.length > 0) {
        const [cost, r, c] = pq.pop();

        if (cost > dist[r][c]) continue;
        if (grid[r][c] === "T") {
            console.log(cost);
            return;
        }

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== "#") {
                const cell = grid[nr][nc];
                const addCost = (cell >= "0" && cell <= "9") ? parseInt(cell) : 0;
                const newCost = cost + addCost;

                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push([newCost, nr, nc]);
                }
            }
        }
    }

    console.log(-1);
}

solve();
