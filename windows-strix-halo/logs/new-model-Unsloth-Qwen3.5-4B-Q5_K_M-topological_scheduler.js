"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function topologicalSort() {
    const input = fs_1.default.readFileSync(0, "utf8");
    const lines = input.trim().split("\n");
    const [nLine, namesLine, edgesLines] = lines;
    const [N, M] = nLine.split(/\s+/).map(Number);
    const names = namesLine.trim().split(/\s+/);
    const taskToIdx = new Map();
    names.forEach((name, idx) => taskToIdx.set(name, idx));
    const inDegree = new Array(N).fill(0);
    const adj = Array.from({ length: N }, () => []);
    const edgeCount = new Array(N).fill(0);
    edgesLines.forEach((line) => {
        if (!line.trim())
            return;
        const parts = line.trim().split(/\s+/);
        const u = taskToIdx.get(parts[0]);
        const v = taskToIdx.get(parts[1]);
        if (u === undefined || v === undefined)
            return;
        adj[u].push(v);
        edgeCount[v]++;
    });
    const heap = [];
    const compare = (a, b) => {
        return a.name.localeCompare(b.name);
    };
    function pushHeap(node) {
        heap.push(node);
        let i = heap.length - 1;
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (compare(heap[p], heap[i]) > 0) {
                [heap[p], heap[i]] = [heap[i], heap[p]];
                i = p;
            }
            else {
                break;
            }
        }
    }
    function popHeap() {
        if (heap.length === 0)
            return undefined;
        const result = heap[0];
        heap[0] = heap[heap.length - 1];
        heap.pop();
        let i = 0;
        const len = heap.length;
        while (true) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let smallest = i;
            if (left < len && compare(heap[left], heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < len && compare(heap[right], heap[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== i) {
                [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
                i = smallest;
            }
            else {
                break;
            }
        }
        return result;
    }
    const available = [];
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            available.push({ idx: i, name: names[i] });
        }
    }
    available.forEach((node) => pushHeap(node));
    const result = [];
    const visited = new Array(N).fill(false);
    while (available.length > 0) {
        const current = popHeap();
        if (current === undefined)
            break;
        visited[current.idx] = true;
        result.push(current.name);
        for (const neighborIdx of adj[current.idx]) {
            inDegree[neighborIdx]--;
            if (inDegree[neighborIdx] === 0) {
                available.push({ idx: neighborIdx, name: names[neighborIdx] });
                pushHeap(available[available.length - 1]);
            }
        }
    }
    if (result.length !== N) {
        return "IMPOSSIBLE";
    }
    return result.join(" ");
}
console.log(topologicalSort());
