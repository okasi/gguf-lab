"use strict";
const fs = require('fs');
/**
 * Finds the minimum cost path in a rectangular grid using Dijkstra's algorithm.
 */
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0)
        return;
    // Parse H and W
    const [H, W] = input[0].trim().split(/\s+/).map(Number);
    // Parse grid
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(''));
    }
    let startPos = null;
    let targetPos = null;
    // Identify S and T
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startPos = { r, c };
            }
            else if (grid[r][c] === 'T') {
                targetPos = { r, c };
            }
        }
    }
    if (!startPos || !targetPos)
        return; // Should not happen based on problem description
    // --- Dijkstra's Algorithm Setup ---
    // distance[r][c] stores the minimum cost to reach cell (r, c)
    const distance = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    // Priority Queue: stores [cost, r, c]
    // Using an array and sorting/finding min for simplicity in this constrained environment,
    // though a proper Min-Heap would be more efficient.
    const pq = [];
    // Initialize start
    distance[startPos.r][startPos.c] = 0;
    // The cost of entering S is 0.
    pq.push([0, startPos.r, startPos.c]);
    // Directions: Up, Down, Left, Right
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (pq.length > 0) {
        // Simulate Min-Heap extraction: find the element with the minimum cost
        pq.sort((a, b) => a[0] - b[0]);
        const [d, r, c] = pq.shift();
        if (d > distance[r][c])
            continue;
        // Check if target reached
        if (r === targetPos.r && c === targetPos.c) {
            console.log(d);
            return;
        }
        // Explore neighbors
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            // Check bounds
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                // Check for wall
                if (cell === '#')
                    continue;
                let moveCost = 0;
                // Calculate cost of entering the neighbor cell
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell);
                }
                // S and T cost 0 to enter (or are handled by initialization, but we check here for safety)
                // If the target is reached, its cost is the cost to *arrive* at it.
                // Since we initialize S to 0, and only add cost upon *entering* a cell:
                // Moving from S to neighbor X costs cost(X).
                // The problem states: "Entering S or T costs 0."
                // Since S is the start, its cost is already accounted for (0).
                // If the neighbor is T, we should add its cost (which is 0 if T is represented as a cell type, 
                // but T is treated like any other cell with cost 0 implicitly by the problem statement).
                // For simplicity: If the neighbor is a digit, use its value. Otherwise, cost is 0.
                if (cell === 'S' || cell === 'T') {
                    moveCost = 0;
                }
                const newDist = d + moveCost;
                if (newDist < distance[nr][nc]) {
                    distance[nr][nc] = newDist;
                    pq.push([newDist, nr, nc]);
                }
            }
        }
    }
    // If the loop finishes without finding T
    console.log(-1);
}
solve();
