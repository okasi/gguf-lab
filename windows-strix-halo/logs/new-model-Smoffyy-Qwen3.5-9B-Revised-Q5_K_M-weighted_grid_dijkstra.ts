import * as fs from 'fs';

interface Node {
    cost: number;
    r: number;
    c: number;
}

class MinHeap {
    private heap: Node[] = [];

    push(node: Node) {
        this.heap.push(node);
        this.siftUp(this.heap.length - 1);
    }

    pop(): Node | null {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return min;
    }

    private siftUp(index: number) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].cost < this.heap[parentIndex].cost) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private siftDown(index: number) {
        const length = this.heap.length;
        while (true) {
            let left = index * 2 + 1;
            let right = index * 2 + 2;
            let smallest = index;

            if (left < length && this.heap[left].cost < this.heap[smallest].cost) {
                smallest = left;
            }
            if (right < length && this.heap[right].cost < this.heap[smallest].cost) {
                smallest = right;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

const rawData = fs.readFileSync(0, 'utf8');
if (!rawData.trim()) {
    console.log(-1);
    process.exit(0);
}

const lines = rawData.trim().split('\n');
const firstLine = lines[0].trim().split(/\s+/);
const H = parseInt(firstLine[0]);
const W = parseInt(firstLine[1]);

if (isNaN(H) || isNaN(W)) {
    console.log(-1);
    process.exit(0);
}

const grid: string[][] = lines.slice(1).map((line, i) => {
    if (i >= H) return [];
    return line.trim().split('');
});

// Pad grid to H rows if necessary, though input is assumed valid
for (let r = 0; r < H; r++) {
    while (grid[r].length < W) {
        grid[r].push('#');
    }
}

let startPos: [number, number] | null = null;
let endPos: [number, number] | null = null;

const costMap: number[][] = Array(H).fill(null).map(() => Array(W).fill(0));

for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        const char = grid[r][c];
        if (char === 'S') {
            startPos = [r, c];
            costMap[r][c] = 0;
        } else if (char === 'T') {
            endPos = [r, c];
            costMap[r][c] = 0;
        } else if (char === '#') {
            costMap[r][c] = Infinity;
        } else {
            costMap[r][c] = parseInt(char);
        }
    }
}

if (!startPos || !endPos) {
    console.log(-1);
    process.exit(0);
}

const dist: number[][] = Array(H).fill(null).map(() => Array(W).fill(Infinity));
const pq = new MinHeap();

const startR = startPos[0];
const startC = startPos[1];
const endR = endPos[0];
const endC = endPos[1];

dist[startR][startC] = 0;
pq.push({ cost: 0, r: startR, c: startC });

const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

while (true) {
    const current = pq.pop();
    if (!current) break;

    const { cost, r, c } = current;

    if (cost > dist[r][c]) continue;
    if (r === endR && c === endC) {
        console.log(cost);
        process.exit(0);
    }

    for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
            const edgeCost = costMap[nr][nc];
            if (edgeCost !== Infinity && dist[r][c] + edgeCost < dist[nr][nc]) {
                dist[nr][nc] = dist[r][c] + edgeCost;
                pq.push({ cost: dist[nr][nc], r: nr, c: nc });
            }
        }
    }
}

console.log(-1);
