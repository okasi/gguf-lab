"use strict";
const fs = require('fs');
/**
 * Finds the minimum cost path in a rectangular grid using Dijkstra's algorithm.
 * @param H Height of the grid.
 * @param W Width of the grid.
 * @param grid The 2D character array representing the grid.
 * @returns The minimum cost, or -1 if unreachable.
 */
function solve(H, W, grid) {
    // 1. Parse the grid and identify S and T locations
    let start = null;
    let target = null;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                start = { r, c };
            }
            else if (grid[r][c] === 'T') {
                target = { r, c };
            }
        }
    }
    if (!start || !target)
        return -1; // Should not happen based on problem description
    // 2. Initialization for Dijkstra's
    // Distance map: stores the minimum cost to reach (r, c)
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    // Priority Queue: stores [cost, r, c]. Min-heap based on cost.
    // Using an array and sorting/manual heap management is simpler for competitive programming
    // environments if performance constraints allow, but a proper MinPriorityQueue is ideal.
    // We'll simulate the priority queue behavior using an array and sorting for simplicity.
    const pq = [];
    // Start cell cost is 0
    dist[start.r][start.c] = 0;
    pq.push([0, start.r, start.c]);
    // Directions: up, down, left, right
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    // 3. Dijkstra's Algorithm
    while (pq.length > 0) {
        // Extract minimum cost element (Simulating Extract-Min from Priority Queue)
        pq.sort((a, b) => a[0] - b[0]);
        const [currentCost, r, c] = pq.shift();
        if (currentCost > dist[r][c]) {
            continue;
        }
        // Check if we reached the target
        if (r === target.r && c === target.c) {
            return currentCost;
        }
        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            // Check bounds
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                // Check if it's a wall
                if (cell === '#') {
                    continue;
                }
                // Calculate cost to enter the new cell
                let moveCost = 0;
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell);
                }
                // S and T have cost 0 to enter (as per problem statement)
                const newDist = currentCost + moveCost;
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.push([newDist, nr, nc]);
                }
            }
        }
    }
    // 4. If target is unreachable
    return -1;
}
// Main execution block
function main() {
    try {
        // Read all input from stdin
        const input = fs.readFileSync(0, "utf8").trim().split('\n');
        if (input.length === 0 || input[0].trim() === "") {
            return;
        }
        // First line: H W
        const [H, W] = input[0].trim().split(/\s+/).map(Number);
        // Next H lines: grid characters
        const grid = [];
        for (let i = 1; i <= H; i++) {
            if (input[i]) {
                grid.push(input[i].trim().split(''));
            }
        }
        if (grid.length !== H) {
            // Handle case where input might be malformed (e.g., missing lines)
            // For strict adherence, we assume valid input format is provided.
            return;
        }
        const result = solve(H, W, grid);
        console.log(result);
    }
    catch (e) {
        // console.error("Error:", e); // Suppress error output for clean execution if strictly required
    }
}
main();
