import fs from "fs";

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    if (input.length < 2) {
        console.log(-1);
        return;
    }

    const [hStr, wStr] = input[0].split(" ").map(Number);
    const H = hStr;
    const W = wStr;
    const grid: string[] = input.slice(1, H + 1);

    let start: [number, number] | null = null;
    let target: [number, number] | null = null;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const cell = grid[r][c];
            if (cell === "S") {
                start = [r, c];
            } else if (cell === "T") {
                target = [r, c];
            }
        }
    }

    if (!start || !target) {
        console.log(-1);
        return;
    }

    const [sr, sc] = start;
    const [tr, tc] = target;

    // Directions: up, down, left, right
    const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // Distance array initialized to infinity
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[sr][sc] = 0;

    // Min-heap using a priority queue
    // Each element: [cost, row, col]
    const pq: { cost: number; row: number; col: number }[] = [];
    // We'll use a simple array and sort, or implement a proper heap.
    // For correctness and efficiency, let's use a simple array-based min-heap.

    function pushHeap(item: { cost: number; row: number; col: number }): void {
        pq.push(item);
        // Bubble up
        let idx = pq.length - 1;
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (pq[parentIdx].cost <= pq[idx].cost) break;
            [pq[parentIdx], pq[idx]] = [pq[idx], pq[parentIdx]];
            idx = parentIdx;
        }
    }

    function popHeap(): { cost: number; row: number; col: number } | null {
        if (pq.length === 0) return null;
        if (pq.length === 1) return pq.pop()!;

        const top = pq[0];
        pq[0] = pq.pop()!;
        // Bubble down
        let idx = 0;
        const n = pq.length;
        while (true) {
            let smallest = idx;
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;

            if (left < n && pq[left].cost < pq[smallest].cost) {
                smallest = left;
            }
            if (right < n && pq[right].cost < pq[smallest].cost) {
                smallest = right;
            }

            if (smallest === idx) break;
            [pq[idx], pq[smallest]] = [pq[smallest], pq[idx]];
            idx = smallest;
        }
        return top;
    }

    pushHeap({ cost: 0, row: sr, col: sc });

    while (pq.length > 0) {
        const { cost, row, col } = popHeap()!;

        // If we popped a node with cost greater than the known shortest distance, skip
        if (cost > dist[row][col]) continue;

        // If we reached the target
        if (row === tr && col === tc) {
            console.log(cost);
            return;
        }

        // Explore neighbors
        for (const [dr, dc] of dirs) {
            const nr = row + dr;
            const nc = col + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell === "#") continue; // Wall

                let moveCost = 0;
                if (cell >= "0" && cell <= "9") {
                    moveCost = parseInt(cell, 10);
                }
                // S and T cost 0 to enter

                const newCost = cost + moveCost;

                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pushHeap({ cost: newCost, row: nr, col: nc });
                }
            }
        }
    }

    // If target is unreachable
    console.log(-1);
}

solve();
