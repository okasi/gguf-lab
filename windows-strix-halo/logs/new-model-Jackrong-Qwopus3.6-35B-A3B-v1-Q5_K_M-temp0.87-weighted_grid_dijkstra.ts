import * as fs from "fs";

class MinPQ {
    private heap: [number, number, number][] = [];

    push(item: [number, number, number]): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): [number, number, number] {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0 && end) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return min;
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
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
            if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
            if (smallest === index) break;
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [H, W] = lines[0].trim().split(" ").map(Number);

    const grid: string[][] = [];
    let start: [number, number] | null = null;
    let target: [number, number] | null = null;

    for (let i = 0; i < H; i++) {
        grid.push(lines[i + 1].trim().split(""));
    }

    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === "S") start = [i, j];
            if (grid[i][j] === "T") target = [i, j];
        }
    }

    if (!start || !target) {
        console.log(-1);
        return;
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[start[0]][start[1]] = 0;

    const pq = new MinPQ();
    pq.push([0, start[0], start[1]]);

    const dirs: number[][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (pq.size > 0) {
        const [cost, r, c] = pq.pop();

        if (r === target[0] && c === target[1]) {
            console.log(cost);
            return;
        }

        if (cost > dist[r][c]) continue;

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== "#") {
                const cell = grid[nr][nc];
                const moveCost = (cell === "S" || cell === "T") ? 0 : Number(cell);
                if (cost + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = cost + moveCost;
                    pq.push([dist[nr][nc], nr, nc]);
                }
            }
        }
    }

    console.log(-1);
}

solve();
