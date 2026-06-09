import * as fs from 'fs';

type Cell = {
    r: number;
    c: number;
    cost: number;
};

function compareCells(a: Cell, b: Cell): number {
    return a.cost - b.cost;
}

class PriorityQueue {
    private queue: Cell[];

    constructor() {
        this.queue = [];
    }

    push(item: Cell): void {
        this.queue.push(item);
        this.bubbleUp(this.queue.length - 1);
    }

    pop(): Cell | undefined {
        if (this.queue.length === 0) return undefined;
        const min = this.queue[0];
        this.queue[0] = this.queue.pop()!;
        if (this.queue.length > 0) {
            this.bubbleDown(0);
        }
        return min;
    }

    isEmpty(): boolean {
        return this.queue.length === 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (compareCells(this.queue[index], this.queue[parent]) < 0) {
                [this.queue[index], this.queue[parent]] = [this.queue[parent], this.queue[index]];
                index = parent;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        const length = this.queue.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < length && compareCells(this.queue[left], this.queue[smallest]) < 0) {
                smallest = left;
            }
            if (right < length && compareCells(this.queue[right], this.queue[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== index) {
                [this.queue[index], this.queue[smallest]] = [this.queue[smallest], this.queue[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve(): void {
    const { readFileSync } = require('fs');
    const input = readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');

    if (lines.length < 1) {
        console.log('-1');
        return;
    }

    const [H, W] = lines[0].trim().split(/\s+/).map(Number);
    const grid: string[] = [];

    for (let i = 0; i < H; i++) {
        grid.push(lines[i + 1]);
    }

    let start: { r: number; c: number } | null = null;
    let target: { r: number; c: number } | null = null;

    for (let i = 0; i < H; i++) {
        const row = grid[i];
        for (let j = 0; j < W; j++) {
            const char = row[j];
            if (char === 'S') start = { r: i, c: j };
            else if (char === 'T') target = { r: i, c: j };
        }
    }

    if (!start || !target) {
        console.log('-1');
        return;
    }

    const dist: number[][] = [];
    for (let i = 0; i < H; i++) {
        dist.push(new Array(W).fill(Infinity));
    }
    dist[start.r][start.c] = 0;

    const pq = new PriorityQueue();
    pq.push({ r: start.r, c: start.c, cost: 0 });

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (!pq.isEmpty()) {
        const { r, c, cost } = pq.pop()!;

        if (cost > dist[r][c
