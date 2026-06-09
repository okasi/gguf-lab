import * as fs from 'fs';

type Node = [number, number, number];

class Heap {
    data: Node[] = [];
    push(item: Node) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop(): Node | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const bottom = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = bottom!;
            this.bubbleDown(0);
        }
        return top;
    }
    bubbleUp(i: number) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.data[p][0] <= this.data[i][0]) break;
            [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
            i = p;
        }
    }
    bubbleDown(i: number) {
        const n = this.data.length;
        while (true) {
            let l = 2 * i + 1, r = 2 * i + 2, s = i;
            if (l < n && this.data[l][0] < this.data[s][0]) s = l;
            if (r < n && this.data[r][0] < this.data[s][0]) s = r;
            if (s === i) break;
            [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
            i = s;
        }
    }
}

const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [H, W] = input[0].split(/\s+/).map(Number);
const grid = input.slice(1).map(line => line.split(''));

let sr = 0, sc = 0;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === 'S') {
            sr = r; sc = c;
        }
    }
}

const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[sr][sc] = 0;

const heap = new Heap();
heap.push([0, sr, sc]);

const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];

let ans = -1;

while (heap.data.length > 0) {
    const [d, r, c] = heap.pop()!;
    if (d > dist[r][c]) continue;
    if (grid[r][c] === 'T') {
        ans = d;
        break;
    }
    for (let i = 0; i < 4; i++) {
        const nr = r + dr[i];
        const nc = c + dc[i];
        if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
            let cost = 0;
            const ch = grid[nr][nc];
            if (ch >= '0' && ch <= '9') {
                cost = parseInt(ch, 10);
            }
            const nd = d + cost;
            if (nd < dist[nr][nc]) {
                dist[nr][nc] = nd;
                heap.push([nd, nr, nc]);
            }
        }
    }
}

console.log(ans);
