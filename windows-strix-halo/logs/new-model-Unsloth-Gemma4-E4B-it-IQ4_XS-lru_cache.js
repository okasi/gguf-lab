"use strict";
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cacheMap = new Map();
        // Initialize dummy head and tail nodes
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    // Helper function to remove a node from the list
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    // Helper function to add a node right after the head (making it MRU)
    addToHead(node) {
        // Node goes between head and head.next
        const next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        next.prev = node;
    }
    // Moves an existing node to the front (MRU)
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    // Evicts the LRU item (the node before the dummy tail)
    evictLRU() {
        // The LRU node is tail.prev
        let lruNode = this.tail.prev;
        this.removeNode(lruNode);
        this.cacheMap.delete(lruNode.key);
    }
    get(key) {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const node = this.cacheMap.get(key);
        this.moveToHead(node); // Access makes it MRU
        return node.value;
    }
    put(key, value) {
        if (this.cacheMap.has(key)) {
            // Update existing key
            const node = this.cacheMap.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // Insert new key
            if (this.cacheMap.size >= this.capacity) {
                this.evictLRU();
            }
            const newNode = new Node(key, value);
            this.cacheMap.set(key, newNode);
            this.addToHead(newNode);
        }
    }
    del(key) {
        if (!this.cacheMap.has(key)) {
            return;
        }
        const node = this.cacheMap.get(key);
        this.removeNode(node);
        this.cacheMap.delete(key);
    }
    // Returns keys in MRU to LRU order
    getKeysInOrder() {
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
    // Read all input synchronously
    const input = require('fs').readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length === 0) {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    // Parse C and N
    const firstLine = lines[0].split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    // const N = parseInt(firstLine[1], 10); // N is implicitly handled by loop length
    const cache = new LRUCache(C);
    const getResults = [];
    // Process operations
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const operation = parts[0];
        const key = parts[1];
        if (operation === 'PUT') {
            // Value is a signed 32-bit integer
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (operation === 'GET') {
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (operation === 'DEL') {
            cache.del(key);
        }
    }
    // Output Results
    // 1. GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // 2. Remaining keys (MRU to LRU)
    const remainingKeys = cache.getKeysInOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(' '));
    }
}
solve();
