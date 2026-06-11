"use strict";
const fs = require('fs');
/**
 * Finds the minimum cost path in a rectangular grid using Dijkstra's algorithm.
 * @param H Height of the grid.
 * @param W Width of the grid.
 * @param grid The 2D array representing the grid.
 * @returns The minimum cost or -1 if unreachable.
 */
function solve(H, W, grid) {
    // Priority Queue stores [cost, row, col]
    const pq = new PriorityQueue((a, b) => a[0] - b[0]);
    // Distance map: dist[row][col] = minimum cost to reach (row, col)
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    let start = null;
    let target = null;
    // 1. Initialize distances and find start/target
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                start = [r, c];
            }
            else if (grid[r][c] === 'T') {
                target = [r, c];
            }
        }
    }
    if (!start || !target) {
        // Should not happen based on problem description, but good for robustness
        return -1;
    }
    // Initialize start cost to 0
    dist[start[0]][start[1]] = 0;
    pq.push([0, start[0], start[1]]);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    // 2. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const [cost, r, c] = pq.pop();
        if (cost > dist[r][c]) {
            continue;
        }
        if (r === target[0] && c === target[1]) {
            return cost;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            // Check bounds
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                // Check for wall
                if (cell === '#') {
                    continue;
                }
                let moveCost = 0;
                if (cell >= '0' && cell <= '9') {
                    // Cost to enter a digit cell is the digit value
                    moveCost = parseInt(cell);
                }
                // 'S' and 'T' cells cost 0 to enter (already handled by initialization/path logic)
                const newCost = cost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push([newCost, nr, nc]);
                }
            }
        }
    }
    // Target unreachable
    return -1;
}
/**
 * Simple Min-Heap implementation for the Priority Queue.
 * Stores [priority, item1, item2, ...]
 */
class PriorityQueue {
    constructor(comparator = (a, b) => a - b) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() === 0;
    }
    push(value) {
        this._heap.push(value);
        this._bubbleUp(this.size() - 1);
    }
    pop() {
        if (this.isEmpty())
            return undefined;
        if (this.size() === 1)
            return this._heap.pop();
        const top = this._heap[0];
        this._heap[0] = this._heap.pop();
        this._bubbleDown(0);
        return top;
    }
    _getParentIndex(i) { return Math.floor((i - 1) / 2); }
    _getLeftChildIndex(i) { return 2 * i + 1; }
    _getRightChildIndex(i) { return 2 * i + 2; }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _bubbleUp(i) {
        while (i > 0) {
            const p = this._getParentIndex(i);
            if (this._comparator(this._heap[i], this._heap[p]) < 0) {
                this._swap(i, p);
                i = p;
            }
            else {
                break;
            }
        }
    }
    _bubbleDown(i) {
        let minIndex = i;
        const size = this.size();
        while (true) {
            const left = this._getLeftChildIndex(i);
            const right = this._getRightChildIndex(i);
            if (left < size && this._comparator(this._heap[left], this._heap[minIndex]) < 0) {
                minIndex = left;
            }
            if (right < size && this._comparator(this._heap[right], this._heap[minIndex]) < 0) {
                minIndex = right;
            }
            if (minIndex !== i) {
                this._swap(i, minIndex);
                i = minIndex;
            }
            else {
                break;
            }
        }
    }
}
function main() {
    try {
        // Read all input from stdin
        const input = fs.readFileSync(0, "utf8").trim().split('\n');
        if (input.length === 0)
            return;
        // First line: H W
        const [H_str, W_str] = input[0].trim().split(/\s+/);
        const H = parseInt(H_str);
        const W = parseInt(W_str);
        if (isNaN(H) || isNaN(W) || H <= 0 || W <= 0) {
            // Handle malformed H W line if necessary, though constraints usually prevent this
            return;
        }
        // Next H lines: grid characters
        const grid = [];
        for (let i = 1; i <= H; i++) {
            if (i < input.length) {
                grid.push(input[i].trim().split(''));
            }
            else {
                // Premature EOF
                return;
            }
        }
        if (grid.length !== H) {
            // Incomplete grid input
            return;
        }
        const result = solve(H, W, grid);
        console.log(result);
    }
    catch (e) {
        // console.error(e); // Suppress error output for strict requirement compliance
    }
}
main();
