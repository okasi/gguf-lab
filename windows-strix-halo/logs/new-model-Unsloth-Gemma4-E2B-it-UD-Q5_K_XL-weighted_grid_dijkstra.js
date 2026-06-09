"use strict";
const fs = require('fs');
/**
 * Simple MinPriorityQueue implementation for Dijkstra's algorithm.
 * Stores elements as [cost, row, col].
 */
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    enqueue(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }
    dequeue() {
        if (this.isEmpty())
            return null;
        if (this.heap.length === 1)
            return this.heap.pop();
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return min;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            // Compare based on cost (element[0])
            if (this.heap[index][0] < this.heap[parentIndex][0]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;
            // Check left child
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallest][0]) {
                smallest = leftChildIndex;
            }
            // Check right child
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex][0] < this.heap[smallest][0]) {
                smallest = rightChildIndex;
            }
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0) {
        console.log(-1);
        return;
    }
    // Parse H and W
    const [H, W] = input[0].trim().split(' ').map(Number);
    if (H === 0 || W === 0) {
        console.log(-1);
        return;
    }
    const grid = [];
    let start = null;
    let target = null;
    // Parse the grid
    for (let i = 1; i <= H; i++) {
        const line = input[i].trim();
        if (line.length !== W) {
            // Handle malformed input line length (though usually guaranteed in CP context)
            continue;
        }
        const row = line.split('');
        grid.push(row);
        // Identify S and T
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S') {
                start = { r: i - 1, c: j };
            }
            else if (row[j] === 'T') {
                target = { r: i - 1, c: j };
            }
        }
    }
    if (!start || !target) {
        // Should not happen based on problem constraints, but good practice
        console.log(-1);
        return;
    }
    // Dijkstra Initialization
    const INF = Infinity;
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new MinPriorityQueue();
    // Start state initialization
    dist[start.r][start.c] = 0;
    // PQ stores [cost, r, c]
    pq.enqueue([0, start.r, start.c]);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (!pq.isEmpty()) {
        const [d, r, c] = pq.dequeue();
        if (d > dist[r][c]) {
            continue;
        }
        // Check if we reached the target
        if (r === target.r && c === target.c) {
            console.log(d);
            return;
        }
        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            // Check boundaries
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                // Check for wall
                if (cell === '#') {
                    continue;
                }
                let costToEnter;
                if (cell === 'S' || cell === 'T') {
                    // Entering S or T costs 0
                    costToEnter = 0;
                }
                else if (/\d/.test(cell)) {
                    // Passable cell with digit cost
                    costToEnter = parseInt(cell);
                }
                else {
                    // Should not happen if input is valid
                    continue;
                }
                const newDist = d + costToEnter;
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.enqueue([newDist, nr, nc]);
                }
            }
        }
    }
    // If loop finishes without reaching target
    console.log(-1);
}
solve();
