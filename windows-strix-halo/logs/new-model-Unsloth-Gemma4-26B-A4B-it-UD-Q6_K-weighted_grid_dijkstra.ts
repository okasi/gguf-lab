import * as fs from 'fs';

class MinHeap<T> {
    private heap: { val: T; priority: number }[] = [];

    push(val: T, priority: number): void {
        this.heap.push({ val, priority });
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): { val: T; priority: number } | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parentIdx = (idx - 1) >> 1;
            if (this.heap[idx].priority >= this.heap[parentIdx].priority) break;
            const tmp = this.heap[idx];
            this.heap[idx] = this.heap[parentIdx];
            this.heap[parentIdx] = tmp;
            idx = parentIdx;
        }
    }

    private bubbleDown(idx: number): void {
        while (true) {
            let smallest = idx;
            const left = (idx << 1) + 1;
            const right = (idx << 1) + 2;
            if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }
            if (smallest === idx) break;
            const tmp = this.heap[idx];
            this.heap[idx] = this.heap[smallest];
            this.heap[smallest] = tmp;
            idx = smallest;
        }
    }
}

function main(): void {
    let input = "";
    try {
        input = fs.readFileSync(0, "utf8");
    } catch (e) {
        return;
    }
    if (!input) return;

    const tokens = input.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length < 2) return;

    const H = parseInt(tokens[0]);
    const W = parseInt(tokens[1]);
    if (isNaN(H) || isNaN(W)) return;

    const allChars = tokens.slice(2).join('');
    const grid: string[][] = [];
    for (let r = 0; r < H; r++) {
        const row: string[] = [];
        for (let c = 0; c < W; c++) {
            const char = allChars[r * W + c];
            row.push(char !== undefined ? char : '#');
        }
        grid.push(row);
    }

    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            } else if (grid[r][c] === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }

    if (startR === -1 || targetR === -1) {
        process.stdout.write("-1\n");
        return;
    }

    const dist = Array.from({ length: H }, () => new Float64Array(W).fill(Infinity));
    const pq = new MinHeap<{ r: number; c: number }>();

    dist[startR][startC] = 0;
    pq.push({ r: startR, c: startC }, 0);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
        const curr = pq.pop();
        if (!curr) break;
        const { r, c } = curr.val;
        const d = curr.priority;

        if (d > dist[r][c]) continue;
        if (r === targetR && c === targetC) {
            process.stdout.write(d.toString() + "\n");
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#') continue;

                let cost = 0;
                if (char >= '0' && char <= '9') {
                    cost = char.charCodeAt(0) - 48;
                } else if (char === 'S' || char === 'T') {
                    cost = 0;
                } else {
                    continue;
                }

                if (dist[r][c] + cost < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + cost;
                    pq.push({ r: nr, c: nc }, dist[nr][nc]);
                }
            }
        }
    }

    process.stdout.write("-1\n");
}

main();
