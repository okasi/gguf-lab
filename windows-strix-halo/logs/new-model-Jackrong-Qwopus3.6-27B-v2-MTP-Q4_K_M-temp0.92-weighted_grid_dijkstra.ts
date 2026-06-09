import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0];
    const [H, W] = firstLine.split(/\s+/).map(Number);

    let grid: string[] = [];
    let lineIndex = 1;
    while (grid.length < H && lineIndex < lines.length) {
        const line = lines[lineIndex].trim();
        if (line.length > 0) {
            grid.push(line);
        }
        lineIndex++;
    }

    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        const row = grid[r];
        for (let c = 0; c < W; c++) {
            const ch = row[c];
            if (ch === 'S') {
                startR = r; startC = c;
            } else if (ch === 'T') {
                targetR = r; targetC = c;
            }
        }
    }

    if (startR === -1 || targetR === -1) {
        console.log(-1);
        return;
    }

    const dist: number[][] = Array.from({ length: H }, () => new Array(W).fill(Infinity));
    dist[startR][startC] = 0;

    const heap = new MinHeap();
    heap.push([0, startR, startC]);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (heap.size > 0) {
        const [cost, r, c] = heap.pop()!;
        if (cost > dist[r][c]) continue;
        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
            const ch = grid[nr][nc];
            if (ch === '#') continue;
            let nextCost = cost;
            if (ch !== 'S' && ch !== 'T') {
                nextCost += parseInt(ch);
            }
            if (nextCost < dist[nr][nc]) {
                dist[nr][nc] = nextCost;
                heap.push([nextCost, nr, nc]);
            }
        }
    }

    console.log(-1);
}

class MinHeap {
    private data: [number, number, number][] = [];
    public get size(): number {
        return this.data.length;
    }
    push(item: [number, number, number]) {
        this.data.push(item);
        this._bubbleUp(this.data.length - 1);
    }
    pop(): [number, number, number] | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this._bubbleDown(0);
        }
        return top;
    }
    private _bubbleUp(index: number) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.data[index][0] < this.data[parent][0]) {
                [this.data[index], this.data[parent]] = [this.data[parent], this.data[index]];
                index = parent;
            } else break;
        }
    }
    private _bubbleDown(index: number) {
        const len = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < len && this.data[left][0] < this.data[smallest][0]) smallest = left;
            if (right < len && this.data[right][0] < this.data[smallest][0]) smallest = right;
            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            } else break;
        }
    }
}

main();
