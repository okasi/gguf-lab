import * as fs from "fs";

class MinHeap {
    private data: [number, number, number][] = [];
    push(item: [number, number, number]): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop(): [number, number, number] {
        if (this.data.length === 0) throw new Error("Heap is empty");
        const min = this.data[0];
        const end = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = end;
            this.sinkDown(0);
        }
        return min;
    }
    isEmpty(): boolean {
        return this.data.length === 0;
    }
    private swap(i: number, j: number): void {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.data[i][0] < this.data[parent][0]) {
                this.swap(i, parent);
                i = parent;
            } else {
                break;
            }
        }
    }
    private sinkDown(i: number): void {
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < this.data.length && this.data[left][0] < this.data[smallest][0]) {
                smallest = left;
            }
            if (right < this.data.length && this.data[right][0] < this.data[smallest][0]) {
                smallest = right;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }
}

const main = (): void => {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [H, W] = lines[0].split(" ").map(Number);
    const grid: string[] = lines.slice(1);

    let startX = 0, startY = 0;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (grid[y][x] === "S") {
                startX = x;
                startY = y;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startY][startX] = 0;
    const pq = new MinHeap();
    pq.push([0, startX, startY]);

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (!pq.isEmpty()) {
        const [cost, x, y] = pq.pop();
        if (cost > dist[y][x]) continue;
        if (grid[y][x] === "T") {
            console.log(cost);
            return;
        }
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] !== "#") {
                let newCost = cost;
                const cell = grid[ny][nx];
                if (cell >= "0" && cell <= "9") {
                    newCost += parseInt(cell);
                }
                // Entering S or T costs 0, so newCost remains 'cost'
                if (newCost < dist[ny][nx]) {
                    dist[ny][nx] = newCost;
                    pq.push([newCost, nx, ny]);
                }
            }
        }
    }
    console.log(-1);
};

main();
