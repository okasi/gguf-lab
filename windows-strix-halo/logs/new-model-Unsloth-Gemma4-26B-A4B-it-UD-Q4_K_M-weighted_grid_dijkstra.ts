import * as fs from 'fs';

class MinHeap {
    private heap: { r: number; c: number; cost: number }[] = [];

    push(val: { r: number; c: number; cost: number }) {
        this.heap.push(val);
        this.bubbleUp();
    }

    pop() {
        if (this.heap.length === 0) return null;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp() {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            let parentIdx = (idx - 1) >> 1;
            if (this.heap[idx].cost < this.heap[parentIdx].cost) {
                const temp = this.heap[idx];
                this.heap[idx] = this.heap[parentIdx];
                this.heap[parentIdx] = temp;
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    private bubbleDown() {
        let idx = 0;
        const n = this.heap.length;
        while (true) {
            let left = (idx << 1) + 1;
            let right = (idx << 1) + 2;
            let smallest = idx;

            if (left < n && this.heap[left].cost < this.heap[smallest].cost) {
                smallest = left;
            }
            if (right < n && this.heap[right].cost < this.heap[smallest].cost) {
                smallest = right;
            }

            if (smallest !== idx) {
                const temp = this.heap[idx];
                this.heap[idx] = this.heap[smallest];
                this.heap[smallest] = temp;
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

function solve() {
    let input = "";
    try {
        input = fs.readFileSync(0, "utf8");
    } catch (e) {
        return;
    }
    const tokens = input.split(/\s+/);
    if (tokens.length < 2) return;

    let tokenIdx = 0;
    while (tokenIdx < tokens.length && tokens[tokenIdx] === "") tokenIdx++;
    if (tokenIdx >= tokens.length) return;

    const H = parseInt(tokens[tokenIdx++]);
    const W = parseInt(tokens[tokenIdx++]);
    if (isNaN(H) || isNaN(W)) return;

    const gridChars: string[] = [];
    while (tokenIdx < tokens.length && gridChars.length < H * W) {
        const token = tokens[tokenIdx++];
        if (token.length > 0) {
            for (let j = 0; j < token.length && gridChars.length < H * W; j++) {
                gridChars.push(token[j]);
            }
        }
    }

    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;

    for (let i = 0; i < gridChars.length; i++) {
        if (gridChars[i] === 'S') {
            startR = Math.floor(i / W);
            startC = i % W;
        } else if (gridChars[i] === 'T') {
            targetR = Math.floor(i / W);
            targetC = i % W;
        }
    }

    if (startR === -1 || targetR === -1) {
        console.log("-1");
        return;
    }

    const dist = new Float64Array(H * W).fill(Infinity);
    const pq = new MinHeap();

    dist[startR * W + startC] = 0;
    pq.push({ r: startR, c: startC, cost: 0 });

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
        const curr = pq.pop();
        if (!curr) break;
        const { r, c, cost } = curr;

        if (cost > dist[r * W + c]) continue;
        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const idx = nr * W + nc;
                const char = gridChars[idx];
                if (char === '#') continue;

                let cellCost = 0;
                if (char >= '0' && char <= '9') {
                    cellCost = char.charCodeAt(0) - 48;
                } else if (char === 'S' || char === 'T') {
                    cellCost = 0;
                }

                if (dist[r * W + c] + cellCost < dist[idx]) {
                    dist[idx] = dist[r * W + c] + cellCost;
                    pq.push({ r: nr, c: nc, cost: dist[idx] });
                }
            }
        }
    }

    console.log("-1");
}

solve();
