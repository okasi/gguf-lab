"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const MaxBinaryHeap_1 = require("./MaxBinaryHeap");
function solve() {
    const input = (0, fs_1.readFileSync)(0, 'utf8').trim().split(/\r?\n/);
    const [N, M] = input[0].split(' ').map(Number);
    const taskNames = input[1].split(' ').sort(); // lexicographically smallest when available
    const taskMap = new Map(taskNames.map((name, index) => [name, index]));
    const inDegree = new Array(N).fill(0);
    const graph = new Array(N).fill(0).map(() => []);
    for (let i = 2; i <= M + 1; i++) {
        const [A, B] = input[i].split(' ').map(Number);
        graph[taskMap.get(input[A])]?.push(taskMap.get(input[B]));
        inDegree[taskMap.get(input[B])]++;
    }
    const heap = new MaxBinaryHeap_1.MaxBinaryHeap(taskNames.filter((_, i) => inDegree[i] === 0));
    while (heap.size() > 0) {
        const current = heap.poll();
        console.log(current, ' ');
        for (const neighbor of graph[taskMap.get(current)]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                heap.enqueue(currentNames[neighbor]);
            }
        }
    }
    if (heap.size() === 0 && inDegree.some(deg => deg !== 0)) {
        console.log('IMPOSSIBLE');
    }
}
solve();
