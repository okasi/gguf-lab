const fs = require('fs');
const { performance } = require('perf_hooks');

/**
 * Simple Priority Queue implementation using an array heap.
 * Stores elements as [cost, r, c].
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    _compare(a, b) {
        // Compare based on cost (index 0)
        return a[0] < b[0];
    }

    push(element) {
        this.heap.push(element);
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._bubbleDown(0);
        return min;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this._compare(this.heap[index], this.heap[parentIndex])) {
                this._swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    _bubbleDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            // Check left child
            if (leftChildIndex <= lastIndex && this._compare(this.heap[leftChildIndex], this.heap[smallest])) {
                smallest = leftChildIndex;
            }

            // Check right child
            if (rightChildIndex <= lastIndex && this._compare(this.heap[rightChildIndex], this.heap[smallest])) {
                smallest = rightChildIndex;
            }

            if (smallest !== index) {
                this._swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }
}

/**
 * Calculates the cost associated with entering a specific cell (r, c).
 * @param {string} char The character at the cell.
 * @returns {number} The cost.
 */
function getCellCost(char) {
    if (char === 'S' || char === 'T') {
        return 0;
    }
    if (char >= '0' && char <= '9') {
        return parseInt(char);
    }
    return Infinity; // Should not happen if input is valid
}

/**
 * Solves the minimum cost path problem using Dijkstra's algorithm.
 * @param {number} H Height of the grid.
 * @param {number} W Width of the grid.
 * @param {string[][]} grid The grid map.
 * @param {number} startR Start row.
 * @param {number} startC Start column.
 * @param {number} targetR Target row.
 * @param {number} targetC Target column.
 * @returns {number} Minimum cost or -1 if unreachable.
 */
function dijkstra(H, W, grid, startR, startC, targetR, targetC) {
    // Initialize distances to infinity
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    
    const pq = new PriorityQueue();

    // Start setup
    dist[startR][startC] = 0;
    // Push [cost, r, c]
    pq.push([0, startR, startC]);

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.pop();

        if (currentCost > dist[r][c]) {
            continue; // Stale entry
        }

        if (r === targetR && c === targetC) {
            return currentCost;
        }

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cellChar = grid[nr][nc];

                if (cellChar === '#') {
                    continue; // Wall
                }

                // The cost to move to (nr, nc) is the cost associated with entering that cell.
                const moveCost = getCellCost(cellChar);
                const newCost = currentCost + moveCost;

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

function solve() {
    try {
        const input = fs.readFileSync(0, "utf8").trim().split('\n');
        
        if (input.length === 0) {
            console.log(-1);
            return;
        }

        // Parse H W
        const [H_str, W_str] = input[0].split(/\s+/);
        const H = parseInt(H_str);
        const W = parseInt(W_str);

        if (isNaN(H) || isNaN(W) || H <= 0 || W <= 0) {
            console.log(-1);
            return;
        }

        const grid = [];
        for (let i = 0; i < H; i++) {
            grid.push(input[i + 1].split(''));
        }

        let startR = -1, startC = -1;
        let targetR = -1, targetC = -1;

        // Find S and T
        for (let i = 0; i < H; i++) {
            for (let j = 0; j < W; j++) {
                if (grid[i][j] === 'S') {
                    startR = i;
                    startC = j;
                } else if (grid[i][j] === 'T') {
                    targetR = i;
                    targetC = j;
                }
            }
        }

        if (startR === -1 || targetR === -1) {
             console.log(-1);
             return;
        }

        const result = dijkstra(H, W, grid, startR, startC, targetR, targetC);
        console.log(result);

    } catch (e) {
        // Handle potential file read errors or parsing issues gracefully
        // console.error(e);
        // In a strict contest environment, just ensure the program exits cleanly.
    }
}

solve();
