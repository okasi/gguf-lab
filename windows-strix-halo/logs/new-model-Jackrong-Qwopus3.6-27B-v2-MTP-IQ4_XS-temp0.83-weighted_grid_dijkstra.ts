import * as fs from 'fs';

class MinHeap {
    private data: [number, number, number][] = [];

    push(item: [number, number, number]): void {
        this.data.push(item);
        this._siftUp(this.data.length - 1);
    }

    pop(): [number, number, number] | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const bottom = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = bottom;
            this._siftDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }

    private _siftUp(idx: number): void {
        const element = this.data[idx];
        while (idx > 0) {
            const parentIdx = (idx - 1) >> 1;
            const parent = this.data[parentIdx];
            if (element[0] >= parent[0]) break;
            this.data[idx] = parent;
            idx = parentIdx;
        }
        this.data[idx] = element;
    }

    private _siftDown(idx: number): void {
        const length = this.data.length;
        const element = this.data[idx];
        while (true) {
            let leftIdx = 2 * idx + 1;
            let rightIdx = 2 * idx + 2;
            let swapIdx = null;
            if (leftIdx < length) {
                if (this.data[leftIdx][0] < element[0]) {
                    swapIdx = leftIdx;
                }
            }
            if (rightIdx < length) {
                if (this.data[rightIdx][0] < (swapIdx === null ? element[0] : this.data[swapIdx][0])) {
                    swapIdx = rightIdx;
                }
            }
            if (swapIdx === null) break;
            this.data[idx] = this.data[swapIdx];
            idx = swapIdx;
        }
        this.data[idx] = element;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split(/\r?\n/);
    const [H, W] = input[0].split(' ').map(Number);
    const grid: string[] = input.slice(1, H + 1);

    let startRow = -1, startCol = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startRow = r;
                startCol = c;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startRow][startCol] = 0;
    const pq = new MinHeap();
    pq.push([0, startRow, startCol]);

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (!pq.isEmpty()) {
        const [cost, r, c] = pq.pop()!;
        if (cost > dist[r][c]) continue;
        if (grid[r][c] === 'T') {
            console.log(cost);
            return;
        }

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                let moveCost = 0;
                if (grid[nr][nc] >= '0' && grid[nr][nc] <= '9') {
                    moveCost = parseInt(grid[nr][nc], 10);
                }
                const newCost = cost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push([newCost, nr, nc]);
                }
            }
        }
    }

    console.log(-1);
}

main();
