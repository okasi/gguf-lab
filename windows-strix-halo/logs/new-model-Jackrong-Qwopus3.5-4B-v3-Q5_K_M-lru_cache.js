"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const input = (0, fs_1.readFileSync)(0, 'utf8');
const lines = input.split('\n');
const [C, N] = lines[0].split(' ').map(Number);
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.head = null;
        this.tail = null;
        this.map = new Map();
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            this.updateNode(node);
            node.value = value;
            return;
        }
        const newNode = new Node(key, value);
        this.addHead(newNode);
        this.map.set(key, newNode);
        this.size++;
        if (this.size > this.capacity) {
            this.removeTail();
            const evictedKey = this.tail?.key;
            if (evictedKey) {
                this.map.delete(evictedKey);
                this.size--;
            }
        }
    }
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.updateNode(node);
        return node.value;
    }
    del(key) {
        const node = this.map.get(key);
        if (!node) {
            return;
        }
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }
    updateNode(node) {
        this.removeNode(node);
        this.addHead(node);
    }
    addHead(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
    }
    removeNode(node) {
        if (!node.prev)
            return;
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }
    removeTail() {
        if (!this.tail)
            return;
        const node = this.tail;
        this.tail = this.tail.prev;
        if (this.tail) {
            this.tail.next = null;
        }
        else {
            this.head = null;
        }
        node.prev = null;
        node.next = null;
    }
}
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i < Math.min(lines.length, N + 1); i++) {
    const line = lines[i].trim();
    if (!line)
        continue;
    const parts = line.split(' ');
    const op = parts[0];
    if (op === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val);
    }
    else if (op === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (op === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}
const output1 = getResults.length === 0 ? 'EMPTY' : getResults.join(' ');
const remainingKeys = [];
let curr = cache.head;
while (curr) {
    remainingKeys.push(curr.key);
    curr = curr.next;
}
const output2 = remainingKeys.length === 0 ? 'EMPTY' : remainingKeys.join(' ');
console.log(output1);
console.log(output2);
