"use strict";
const fs = require('fs');
class Node {
    constructor(key, value) {
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}
class LRUCache {
    constructor(capacity) {
        this.cache = new Map();
        this.head = null; // Most Recently Used (MRU)
        this.tail = null; // Least Recently Used (LRU)
        this.capacity = capacity;
    }
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            // Node was the head
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            // Node was the tail
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }
    moveToHead(node) {
        if (node === this.head) {
            return; // Already MRU
        }
        // 1. Remove node from current position
        this.removeNode(node);
        // 2. Add to head
        if (this.head) {
            node.next = this.head;
            this.head.prev = node;
        }
        else {
            // List was empty
            this.head = node;
            this.tail = node;
        }
        node.prev = null;
    }
    addNodeToHead(node) {
        if (this.head) {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
        else {
            this.head = node;
            this.tail = node;
        }
        node.prev = null;
    }
    put(key, value) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            node.value = value;
            this.moveToHead(node);
            return;
        }
        const newNode = new Node(key, value);
        this.cache.set(key, newNode);
        this.addNodeToHead(newNode);
        // Check capacity and evict LRU if necessary
        if (this.cache.size > this.capacity) {
            const lruNode = this.tail;
            this.removeNode(lruNode);
            this.cache.delete(lruNode.key);
        }
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }
        this.moveToHead(node);
        return node.value;
    }
    del(key) {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
        }
    }
    getKeys() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '')
        return;
    // 1. Parse Capacity and N
    const [C_str, N_str] = input[0].trim().split(' ');
    const C = parseInt(C_str, 10);
    const N = parseInt(N_str, 10);
    const cache = new LRUCache(C);
    const getResults = [];
    // 2. Process Operations
    for (let i = 1; i <= N; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const operation = parts[0];
        const key = parts[1];
        switch (operation) {
            case 'PUT':
                // Value must be parsed as a signed 32-bit integer
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;
            case 'GET':
                const result = cache.get(key);
                getResults.push(result);
                break;
            case 'DEL':
                cache.del(key);
                break;
        }
    }
    // 3. Generate Output
    // Output Line 1: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // Output Line 2: Remaining keys (MRU to LRU)
    const keys = cache.getKeys();
    if (keys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(keys.join(' '));
    }
}
solve();
