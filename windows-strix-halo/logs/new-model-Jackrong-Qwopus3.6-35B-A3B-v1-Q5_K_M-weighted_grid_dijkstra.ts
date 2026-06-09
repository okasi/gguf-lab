import * as fs from "fs";

class MinHeap {
    private heap: [number[], number][] = [];
    private size: number = 0;

    push(value: number[], priority: number): void {
        this.heap.push([value, priority]);
        this.size++;
        this.bubbleUp(this.size - 1);
    }

    pop(): number[] | undefined {
        if (this.size === 0) return undefined;
        const top = this.heap[0];
        this.heap[0] = this.heap[this.size - 1];
        this.heap.pop();
        this.size--;
        this.sinkDown(0);
        return top?.[0];
    }

    isEmpty(): boolean {
        return this.size === 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.heap[parentIndex][1] <= this.heap[index][1]) break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private sinkDown(index: number): void {
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        let smallest = index;

        if (left < this.size && this.heap[left][1] < this.heap[smallest][1]) {
            smallest = left;
        }
        if (right < this.size && this.heap[right][1] < this.heap[smallest][1]) {
            smallest = right;
        }

        if (smallest !== index) {
            this.swap(index, smallest);
            this.sinkDown(smallest);
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [h, w] = lines[0].split(" ").map(Number);

    const grid: string[][] = [];
    let startRow = -1, startCol = -1;

    for (let i = 1; i <= h; i++) {
        grid.push(lines[i].split(""));
    }

    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            if (grid[r][c] === "S") {
                startRow = r;
                startCol = c;
            }
        }
    }

    const dist: number[][] = Array.from({ length: h }, () => Array(w).fill(Infinity));
    dist[startRow][startCol] = 0;

    const pq = new MinHeap();
    pq.push([startRow, startCol], 0);

    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    while (!pq.isEmpty()) {
        const pos = pq.pop()!;
        const [r, c] = pos;
        const currentCost = dist[r][c];

        if (grid[r][c] === "T") {
            process.stdout.write(String(currentCost));
            return;
        }

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < h && nc >= 0 && nc < w && grid[nr][nc] !== "#") {
                const stepCost = grid[nr][nc] === "S" || grid[nr][nc] === "T" ? 0 : parseInt(grid[nr][nc]);
                const newCost = currentCost + stepCost;

                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push([nr, nc], newCost);
                }
            }
        }
    }

    process.stdout.write("-1");
}

solve();
