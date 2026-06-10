"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class BinaryMinHeap {
    constructor(compare) {
        this.elements = [];
        this.compare = compare;
    }
    parent(i) {
        return Math.floor((i - 1) / 2);
    }
    leftChild(i) {
        return 2 * i + 1;
    }
    rightChild(i) {
        return 2 * i + 2;
    }
    swap(i, j) {
        const temp = this.elements[i];
        this.elements[i] = this.elements[j];
        this.elements[j] = temp;
    }
    push(item) {
        this.elements.push(item);
        this.siftUp(this.elements.length - 1);
    }
    pop() {
        if (this.elements.length === 0) {
            return undefined;
        }
        const result = this.elements[0];
        const last = this.elements.pop();
        if (this.elements.length > 0) {
            this.elements[0] = last;
            this.siftDown(0);
        }
        return result;
    }
    peek() {
        return this.elements.length > 0 ? this.elements[0] : undefined;
    }
    size() {
        return this.elements.length;
    }
    siftUp(index) {
        while (index > 0) {
            const parentIndex = this.parent(index);
            if (this.compare(this.elements[index], this.elements[parentIndex]) < 0) {
                this.swap(index, parentIndex);
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    siftDown(index) {
        const lastIndex = this.elements.length - 1;
        while (true) {
            const leftIndex = this.leftChild(index);
            const rightIndex = this.rightChild(index);
            let smallest = index;
            if (leftIndex <= lastIndex && this.compare(this.elements[leftIndex], this.elements[smallest]) < 0) {
                smallest = leftIndex;
            }
            if (rightIndex <= lastIndex && this.compare(this.elements[rightIndex], this.elements[smallest]) < 0) {
                smallest = rightIndex;
            }
            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs_1.default.readFileSync(0, "utf8");
    const lines = input.split("\n").filter(line => line.trim() !== "");
    if (lines.length < 2) {
        console.log("IMPOSSIBLE");
        return;
    }
    const firstLine = lines[0].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);
    if (isNaN(N) || isNaN(M) || N <= 0 || M < 0) {
        console.log("IMPOSSIBLE");
        return;
    }
    const taskNamesLine = lines[1].trim().split(/\s+/);
    const taskNames = taskNamesLine.filter(name => name.length > 0);
    if (taskNames.length !== N) {
        console.log("IMPOSSIBLE");
        return;
    }
    const adjacencyList = new Map();
    const inDegree = new Map();
    for (const name of taskNames) {
        adjacencyList.set(name, new Set());
        inDegree.set(name, 0);
    }
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0)
            continue;
        const parts = line.split(/\s+/);
        if (parts.length < 2)
            continue;
        const from = parts[0];
        const to = parts[1];
        if (!adjacencyList.has(from) || !adjacencyList.has(to)) {
            console.log("IMPOSSIBLE");
            return;
        }
        if (!adjacencyList.get(from).has(to)) {
            adjacencyList.get(from).add(to);
            inDegree.set(to, inDegree.get(to) + 1);
        }
    }
    const minHeap = new BinaryMinHeap((a, b) => a.localeCompare(b));
    for (const name of taskNames) {
        if (inDegree.get(name) === 0) {
            minHeap.push(name);
        }
    }
    const buildOrder = [];
    while (minHeap.size() > 0) {
        const current = minHeap.pop();
        buildOrder.push(current);
        const neighbors = adjacencyList.get(current);
        for (const neighbor of neighbors) {
            const newDegree = inDegree.get(neighbor) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
                minHeap.push(neighbor);
            }
        }
    }
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    }
    else {
        console.log(buildOrder.join(" "));
    }
}
solve();
