import * as fs from 'fs';

    class MinHeap {
        private heap: [number, number, number][] = [];
        push(val: [number, number, number]) {
            this.heap.push(val);
            this.bubbleUp();
        }
        pop(): [number, number, number] | undefined {
            if (this.heap.length === 0) return undefined;
            const top = this.heap[0];
            const last = this.heap.pop()!;
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this.bubbleDown();
            }
            return top;
        }
        private bubbleUp() {
            let idx = this.heap.length - 1;
            while (idx > 0) {
                let parentIdx = Math.floor((idx - 1) / 2);
                if (this.heap[idx][0] < this.heap[parentIdx][0]) {
                    [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]]!;
                    idx = parentIdx;
                } else break;
            }
        }
        private bubbleDown() {
            let idx = 0;
            while (true) {
                let left = 2 * idx + 1;
                let right = 2 * idx + 2;
                let smallest = idx;
                if (left < this.heap.length && this.heap[left][0] < this.heap[smallest][0]]) smallest = left;
                if (right < this.heap.length && this.heap[right][0] < this.heap[smallest][0]]) smallest = right;
                if (smallest !== idx) {
                    [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]]!;
                    idx = smallest;
                } else break;
            }
        }
        isEmpty(): boolean {
            return this.heap.length === 0;
        }
    }

    function solve() {
        const input = fs.readFileSync(0, "utf8");
         const lines = input.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
         if (lines.length === 0) return;

         const [H, W] = lines[0].split(/\s+/).map(Number);
         const grid = lines.slice(1, H + 1)];

         let start: [number, number] | null = null;
         let target: [number, number] | null = null;

         for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                if (grid[r][c] === 'S') start = [r, c];
                if (grid[r][c] === 'T') target = [r, c];
            }
         }

         if (!start || !target) {
             console.log("-1");
             return;
         }

         const dist = Array.from({ length: H }, () => new Array(W).fill(Infinity));
         const pq = new MinHeap();

         dist[start[0]][start[1]]] = 0;
         pq.push([0, start[0], start[1]]!);

         const dr = [0, 0, 1, -1];
         const dc = [1, -1, 0, 0];

         while (!pq.isEmpty()) {
             const [d, r, c] = pq.pop()!;
             
             if (d > dist[r][c]]) continue;
             if (grid[r][c] === 'T') {
                 console.log(d);
                 return;
             }

             for (let i = 0; i < 4; i++) {
                 const nr = r + dr[i]);
                 const nc = c + dc[i]);

                 if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                     let weight = 0;
                     if (grid[nr][nc]) {
                         if (grid[nr][nc]) {
                             // Wait, the logic needs to be careful here.
                             // If it's a digit, weight is the digit.
                             // If it's 'T' or 'S', weight is 0.
                             const char = grid[nr][nc]);
                             if (char >= '0' && char <= '9') {
                                weight = parseInt(char);
                             } else {
                                weight = 0;
                             }
                             }
                             
                             if (dist[r][c] + weight < dist[nr][nc]]) {
                                dist[nr][nc]] = dist[r][c]] + weight;
                                pq.push([dist[nr][nc]], nr, nc]);
                             }
                             }
                             }
                             }
        }
        console.log("-1");
    }
