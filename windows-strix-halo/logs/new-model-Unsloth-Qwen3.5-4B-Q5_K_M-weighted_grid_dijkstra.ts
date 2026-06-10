import fs from 'fs';

function solve(): number {
	const input = fs.readFileSync(0, 'utf8');
	const lines = input.trim().split('\n');
	const [H, W] = lines[0].split(' ').map(Number);
	
	const grid: string[] = [];
	for (let i = 1; i <= H; i++) {
		grid.push(lines[i]);
	}
	
	type Cell = { r: number, c: number };
	const start: Cell = { r: -1, c: -1 };
	const target: Cell = { r: -1, c: -1 };
	
	for (let r = 0; r < H; r++) {
		const row = grid[r];
		for (let c = 0; c < W; c++) {
			const char = row[c];
			if (char === 'S') {
				start = { r, c };
			} else if (char === 'T') {
				target = { r, c };
			}
		}
	}
	
	const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
	const dist = Array.from({ length: H }, () => Array(W).fill(null as number));
	
	type Node = { r: number; c: number; cost: number };
	const pq: Node[] = [];
	
	dist[start.r][start.c] = 0;
	pq.push({ ...start, cost: 0 });
	
	while (pq.length > 0) {
		const { r, c, cost } = pq.shift()!;
		
		if (cost > dist[r][c]) continue;
		if (r === target.r && c === target.c) return cost;
		
		for (const [dr, dc] of dirs) {
			const nr = r + dr;
			const nc = c + dc;
			
			if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
				const char = grid[nr][nc];
				if (char === '#') continue;
				
				let moveCost = 0;
				if (char >= '0' && char <= '9') {
					moveCost = parseInt(char);
				} else if (char === 'S' || char === 'T') {
					moveCost = 0;
				}
				
				const newCost = cost + moveCost;
				if (newCost < dist[nr][nc]) {
					dist[nr][nc] = newCost;
					pq.push({ r: nr, c: nc, cost: newCost });
				}
			}
		}
	}
	
	return -1;
}

console.log(solve());
