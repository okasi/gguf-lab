import * as fs from "fs";

class MinHeap<T> {
    private data: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    push(item: T): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): T {
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
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
            if (this.compare(this.data[index], this.data[parentIndex]) < 0) {
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
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < length && this.compare(this.data[leftChild], this.data[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild < length && this.compare(this.data[rightChild], this.data[smallest]) < 0) {
                smallest = rightChild;
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
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    if (input.length < 1) return;

    const [H, W] = input[0].split(" ").map(Number);
    const grid: string[] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i] || "");
    }

    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === "S") {
                startR = r;
                startC = c;
            } else if (grid[r][c] === "T") {
                targetR = r;
                targetC = c;
            }
        }
    }

    if (startR === -1 || targetR === -1) {
        console.log("-1");
        return;
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;

    const dir = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    const heap = new MinHeap<{ r: number; c: number; cost: number }>((a, b) => a.cost - b.cost);
    heap.push({ r: startR, c: startC, cost: 0 });

    while (heap.size > 0) {
        const curr = heap.pop();
        const { r, c, cost } = curr;

        if (cost > dist[r][c]) continue;
        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }

        for (const [dr, dc] of dir) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell === "#") continue;

                let enterCost = 0;
                if (cell >= "0" && cell <= "9") {
                    enterCost = parseInt(cell, 10);
                }

                const newCost = cost + enterCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    heap.push({ r: nr, c: nc, cost: newCost });
                }
            }
        }
    }

    console.log("-1");
}

solve();
