"use strict";
const fs = require('fs');
/**
 * A simple MinPriorityQueue implementation for Dijkstra's algorithm.
 * Stores [cost, row, col] tuples.
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
        this.bubbleDown(0);
        return min;
    }
    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index][0] < this.heap[parentIndex][0]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(index) {
        let lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallest][0]) {
                smallest = leftChildIndex;
            }
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
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0)
        return;
    // Parse H and W
    const dimensions = input[0].trim().split(/\s+/).map(Number);
    const H = dimensions[0];
    const W = dimensions[1];
    if (H === 0 || W === 0) {
        console.log(-1);
        return;
    }
    // Parse the grid
    const grid = [];
    for (let i = 1; i <= H; i++) {
        if (input[i]) {
            grid.push(input[i].trim().split(''));
        }
    }
    let start = null;
    let target = null;
    // Find Start (S) and Target (T)
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
    if (!start || !target) {
        // Should not happen based on problem description, but good check.
        console.log(-1);
        return;
    }
    // Dijkstra Initialization
    const INF = Infinity;
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new MinPriorityQueue();
    // Start condition: Cost to reach 'S' is 0
    dist[start.r][start.c] = 0;
    // Priority Queue stores [cost, row, col]
    pq.enqueue([0, start.r, start.c]);
    const dr = [0, 0, 1, -1]; // Right, Left, Down, Up
    const dc = [1, -1, 0, 0];
    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.dequeue();
        if (currentCost > dist[r][c]) {
            continue;
        }
        // Check if target reached
        if (r === target.r && c === target.c) {
            console.log(currentCost);
            return;
        }
        // Explore neighbors
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            // Check boundaries
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                // Check wall
                if (cell === '#') {
                    continue;
                }
                // Determine the cost of entering (nr, nc)
                let entryCost = 0;
                if (cell >= '0' && cell <= '9') {
                    entryCost = parseInt(cell);
                }
                // 'S' and 'T' cost 0 to enter.
                const newCost = currentCost + entryCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.enqueue([newCost, nr, nc]);
                }
            }
        }
    }
    // If the loop finishes and target was not reached
    console.log(-1);
}
solve();
