import * as fs from "fs";

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    const firstLine = input[0].split(" ").map(Number);
    const H = firstLine[0];
    const W = firstLine[1];

    const grid: string[][] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].split(""));
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

    // Dijkstra's algorithm
    // dist[r][c] = minimum cost to reach (r, c)
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;

    // Priority queue: [cost, r, c]
    // Using a simple array-based min-heap or sorted array. Given constraints, a binary heap is better.
    // Let's implement a binary heap.

    interface HeapItem {
        cost: number;
        r: number;
        c: number;
    }

    class MinHeap {
        private data: HeapItem[] = [];

        push(item: HeapItem): void {
            this.data.push(item);
            this.bubbleUp(this.data.length - 1);
        }

        pop(): HeapItem | undefined {
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
                if (this.compare(this.data[index], this.data[parentIndex]) >= 0) break;
                this.swap(index, parentIndex);
                index = parentIndex;
            }
        }

        private sinkDown(index: number): void {
            const length = this.data.length;
            while (true) {
                let smallest = index;
                const left = 2 * index + 1;
                const right = 2 * index + 2;

                if (left < length && this.compare(this.data[left], this.data[smallest]) < 0) {
                    smallest = left;
                }
                if (right < length && this.compare(this.data[right], this.data[smallest]) < 0) {
                    smallest = right;
                }
                if (smallest === index) break;
                this.swap(index, smallest);
                index = smallest;
            }
        }

        private compare(a: HeapItem, b: HeapItem): number {
            return a.cost - b.cost;
        }

        private swap(i: number, j: number): void {
            const temp = this.data[i];
            this.data[i] = this.data[j];
            this.data[j] = temp;
        }
    }

    const heap = new MinHeap();
    heap.push({ cost: 0, r: startR, c: startC });

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (heap.size > 0) {
        const current = heap.pop();
        if (!current) break;

        const { cost, r, c } = current;

        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }

        if (cost > dist[r][c]) continue;

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell === "#") continue;

                let newCost = cost;
                if (cell >= "0" && cell <= "9") {
                    newCost += parseInt(cell, 10);
                }
                // S and T cost 0 to enter

                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    heap.push({ cost: newCost, r: nr, c: nc });
                }
            }
        }
    }

    console.log(-1);
}

solve();
