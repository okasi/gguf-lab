import * as fs from 'fs';

class MinHeap<T> {
    private heap: { val: T; priority: number }[] = [];

    push(val: T, priority: number) {
        this.heap.push({ val, priority });
        this.bubbleUp();
    }

    pop(): { val: T; priority: number } | undefined {
        if (this.heap.length === 0) return undefined;
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
            let pIdx = (idx - 1) >> 1;
            if (this.heap[idx].priority >= this.heap[pIdx].priority) break;
            const tmp = this.heap[idx];
            this.heap[idx] = this.heap[pIdx];
            this.heap[pIdx] = tmp;
            idx = pIdx;
        }
    }

    private bubbleDown() {
        let idx = 0;
        const n = this.heap.length;
        while (true) {
            let left = (idx << 1) + 1;
            let right = (idx << 1) + 2;
            let smallest = idx;
            if (left < n && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
            if (right < n && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
            if (smallest === idx) break;
            const tmp = this.heap[idx];
            this.heap[idx] = this.heap[smallest];
            this.heap[smallest] = tmp;
            idx = smallest;
        }
    }
}

function solve() {
    const inputStr = fs.readFileSync(0, "utf8");
    const tokens = inputStr.trim().split(/\s+/);
    if (tokens.length < 2) return;

    const H = parseInt(tokens[0]);
    const W = parseInt(tokens[1]);
    if (isNaN(H) || isNaN(W)) return;

    const allChars = tokens.slice(2).join("");
    
    let startR = -1, startC = -1;
    for (let i = 0; i < H * W; i++) {
        if (allChars[i] === 'S') {
            startR = Math.floor(i / W);
            startC = i % W;
            break;
        }
    }

    if (startR === -1) {
        process.stdout.write("-1\n");
        return;
    }

    const dist = new Float64Array(H * W).fill(Infinity);
    const pq = new MinHeap<[number, number]>();

    dist[startR * W + startC] = 0;
    pq.push([startR, startC], 0);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
        const item = pq.pop();
        if (!item) break;
        const { val, priority: d } = item;
        const [r, c] = val;

        if (d > dist[r * W + c]) continue;
        if (allChars[r * W + c] === 'T') {
            process.stdout.write(d.toString() + "\n");
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const idx = nr * W + nc;
                const char = allChars[idx];
                if (char !== '#') {
                    let moveCost = 0;
                    if (char >= '0' && char <= '9') {
                        moveCost = char.charCodeAt(0) - 48;
                    }
                    
                    const newDist = d + moveCost;
                    if (newDist < dist[idx]) {
                        dist[idx] = newDist;
                        pq.push([nr, nc], newDist);
                    }
                }
            }
        }
    }

    process.stdout.write("-1\n");
}

solve();
