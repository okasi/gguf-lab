import fs from "fs";

function solve(): void {
    const input: string = fs.readFileSync(0, "utf8").trim();
    const lines: string[] = input.split("\n");
    const [HStr, WStr]: string[] = lines[0].split(" ");
    const H: number = parseInt(HStr);
    const W: number = parseInt(WStr);
    const grid: string[] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(lines[i]);
    }

    let startX: number = -1;
    let startY: number = -1;
    let endX: number = -1;
    let endY: number = -1;

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const ch: string = grid[y][x];
            if (ch === 'S') {
                startX = x;
                startY = y;
            } else if (ch === 'T') {
                endX = x;
                endY = y;
            }
        }
    }

    const INF: number = Number.MAX_SAFE_INTEGER;
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(INF));
    dist[startY][startX] = 0;

    const pq: { cost: number; x: number; y: number }[] = [];
    const push: (cost: number, x: number, y: number) => void = (cost: number, x: number, y: number) => {
        pq.push({ cost, x, y });
    };

    const pop: () => { cost: number; x: number; y: number } | undefined = () => {
        if (pq.length === 0) return undefined;
        let minIdx: number = 0;
        for (let i = 1; i < pq.length; i++) {
            if (pq[i].cost < pq[minIdx].cost) {
                minIdx = i;
            }
        }
        const item: { cost: number; x: number; y: number } = pq[minIdx];
        pq[minIdx] = pq[pq.length - 1];
        pq.pop();
        return item;
    };

    push(0, startX, startY);

    const dx: number[] = [0, 0, -1, 1];
    const dy: number[] = [-1, 1, 0, 0];

    while (pq.length > 0) {
        const curr: { cost: number; x: number; y: number } | undefined = pop();
        if (!curr) break;
        const { cost, x, y } = curr;

        if (cost > dist[y][x]) continue;
        if (x === endX && y === endY) {
            console.log(cost);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nx: number = x + dx[i];
            const ny: number = y + dy[i];

            if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;

            const cell: string = grid[ny][nx];
            if (cell === '#') continue;

            let weight: number = 0;
            if (cell >= '0' && cell <= '9') {
                weight = parseInt(cell);
            }

            const newCost: number = cost + weight;
            if (newCost < dist[ny][nx]) {
                dist[ny][nx] = newCost;
                push(newCost, nx, ny);
            }
        }
    }

    console.log(-1);
}

solve();
