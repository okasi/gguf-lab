"use strict";
const fs = require('fs');
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev;
        Node | null;
        null;
        this.next;
        Node | null;
        null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.cacheMap = new Map();
        this.capacity = capacity;
        // Initialize sentinel nodes
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    // Helper function to remove a node from its current position
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    // Helper function to move a node to the head (MRU position)
    moveToHead(node) {
        this.removeNode(node);
        this.insertAtHead(node);
    }
    // Helper function to insert a node at the head (MRU position)
    insertAtHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    get(key) {
        const node = this.cacheMap.get(key);
        if (!node) {
            return -1;
        }
        // Update usage: Move to head
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        if (this.cacheMap.has(key)) {
            // Key exists: Update value and move to head
            const node = this.cacheMap.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // Key is new: Create new node
            const newNode = new Node(key, value);
            this.cacheMap.set(key, newNode);
            this.insertAtHead(newNode);
            // Check capacity
            if (this.cacheMap.size > this.capacity) {
                // Evict LRU (node before the tail)
                const lruNode = this.tail.prev;
                this.removeNode(lruNode);
                this.cacheMap.delete(lruNode.key);
            }
        }
    }
    del(key) {
        const node = this.cacheMap.get(key);
        if (node) {
            this.removeNode(node);
            this.cacheMap.delete(key);
        }
    }
    getKeys() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function solve() {
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '')
        return;
    // Parse C and N from the first line
    const [C_str, N_str] = input[0].trim().split(/\s+/);
    const C = parseInt(C_str);
    const N = parseInt(N_str);
    const cache = new LRUCache(C);
    const getResults = [];
    // Process operations starting from the second line
    for (let i = 1; i <= N; i++) {
        if (i >= input.length)
            break;
        const line = input[i].trim();
        if (line === '')
            continue;
        const parts = line.split(/\s+/);
        const operation = parts[0];
        const key = parts[1];
        switch (operation) {
            case 'PUT':
                // Value is signed 32-bit integer
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
    // Output 1: GET results
    if (getResults.length > 0) {
        console.log(getResults.join(' '));
    }
    else {
        console.log('EMPTY');
    }
    // Output 2: Remaining keys (MRU to LRU)
    const keys = cache.getKeys();
    if (keys.length > 0) {
        console.log(keys.join(' '));
    }
    else {
        console.log('EMPTY');
    }
}
solve();
