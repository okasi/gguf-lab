import * as fs from 'fs';

interface Node {
    cost: number;
    r: number;
    c: number;
}

class MinHeap {
    private data: Node[] = [];
    private compare: (a: Node, b: Node) => number;

    constructor(compare: (a: Node, b: Node) => number) {
        this.compare = compare;
    }

    push(item: Node): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): Node | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const bottom = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = bottom;
            this.bubbleDown(0);
        }
        return top;
    }

    get size(): number {
        return this.data.length;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.compare(this.data[i], this.data[parent]) >= 0) break;
            [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
            i = parent;
        }
    }

    private bubbleDown(i: number): void {
        while (true) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;

            if (left < this.data.length && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.data.length && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }

            if (smallest === i) break;
            [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
            i = smallest;
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length < 2) return;

    const [firstLine, ...gridLines] = input;
    const [H, W] = firstLine.split(' ').map(Number);
    const grid = gridLines.slice(0, H).map(line => line.split(''));

    let startR = -1, startC = -1;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            }
        }
    }

    if (startR === -1) {
        console.log("-1");
        return;
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;

    const pq = new MinHeap((a: Node, b: Node) => a.cost - b.cost);
    pq.push({ cost: 0, r: startR, c: startC });

    const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
    ];

    while (pq.size > 0) {
        const curr = pq.pop()!;
        if (curr.cost > dist[curr.r][curr.c]) continue;
        if (grid[curr.r][curr.c] === 'T') {
            console.log(curr.cost);
            return;
        }

        for (const [dr, dc] of dirs) {
            const nr = curr.r + dr;
            const nc = curr.c + dc;

            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
            const cell = grid[nr][nc];
            if (cell === '#') continue;

            const moveCost = (cell >= '0' && cell <= '9') ? parseInt(cell, 10) : 0;
            const newCost = curr.cost + moveCost;

            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.push({ cost: newCost, r: nr, c: nc });
            }
        }
    }

    console.log("-1");
}

solve();
