"use strict";
const fs = require('fs');
/**
 * Simple Min-Heap implementation for Dijkstra's algorithm.
 * Stores elements as [cost, row, col].
 */
class PriorityQueue {
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
    sinkDown(index) {
        const lastIndex = this.heap.length - 1;
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
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0)
        return -1;
    // 1. Parse H and W
    const [H, W] = input[0].trim().split(/\s+/).map(Number);
    const grid = [];
    let startR = -1;
    let startC = -1;
    // 2. Parse Grid and find Start
    for (let i = 1; i <= H; i++) {
        const line = input[i].trim();
        grid.push(line.split(''));
        for (let j = 0; j < W; j++) {
            if (grid[i - 1][j] === 'S') {
                startR = i - 1;
                startC = j;
            }
        }
    }
    if (startR === -1)
        return -1; // Should not happen based on problem statement
    // 3. Dijkstra Initialization
    const INF = Infinity;
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new PriorityQueue();
    dist[startR][startC] = 0;
    // PQ stores [cost, r, c]
    pq.enqueue([0, startR, startC]);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    // 4. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.dequeue();
        if (currentCost > dist[r][c]) {
            continue;
        }
        // Check if target reached
        if (grid[r][c] === 'T') {
            return currentCost;
        }
        // Explore neighbors
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
                // Calculate cost to enter the new cell
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell, 10);
                }
                // S and T cost 0 to enter (as per problem statement)
                const newCost = currentCost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.enqueue([newCost, nr, nc]);
                }
            }
        }
    }
    // If loop finishes and target was not reached
    return -1;
}
console.log(solve());
