"use strict";
const fs = require('fs');
/**
 * A Least Recently Used (LRU) Cache implementation using a Map and a Doubly Linked List
 * structure (simulated via object properties for simplicity in this context, though
 * a dedicated structure is often used for true O(1) pointer manipulation).
 * Since we need O(1) complexity for all operations, a Map combined with a mechanism
 * to track recency (like a doubly linked list) is the standard approach.
 *
 * For this simulation, we will use a Map to store key -> value/node reference, and a
 * structure (implicitly managed by insertion/deletion order in the Map's iteration
 * order, which is insertion order in modern JS, but we need explicit LRU tracking)
 * to maintain the usage order.
 *
 * A standard robust LRU uses a Map for O(1) lookup and a Doubly Linked List for O(1)
 * reordering upon access/update.
 */
class Node {
}
class LRUCache {
    constructor(capacity) {
        // Map stores key -> { value: number, node: Node reference if using DLL }
        this.cache = new Map();
        // To track usage order: A simple array acting as a queue/stack for recency.
        // Index 0 is MRU (Most Recently Used), last index is LRU (Least Recently Used).
        // This provides O(1) update if we use splice/unshift/pop correctly.
        this.usageOrder = [];
        this.capacity = capacity;
    }
    updateRecency(key) {
        // 1. Remove the key from its current position in usageOrder
        const index = this.usageOrder.indexOf(key);
        if (index !== -1) {
            this.usageOrder.splice(index, 1);
        }
        // 2. Insert at the front (MRU position)
        this.usageOrder.unshift(key);
    }
    put(key, value) {
        if (this.cache.has(key)) {
            // Update existing key
            this.cache.get(key).value = value;
            this.updateRecency(key);
        }
        else {
            // New key insertion
            if (this.cache.size >= this.capacity) {
                // Cache full, evict LRU (the last element in usageOrder)
                const lruKey = this.usageOrder.pop();
                this.cache.delete(lruKey);
            }
            // Insert new key
            this.cache.set(key, { value: value });
            this.usageOrder.unshift(key);
        }
    }
    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        // Hit: Update recency
        this.updateRecency(key);
        return this.cache.get(key).value;
    }
    deleteKey(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            // Update usageOrder: remove from any position and re-insert at MRU position if we track deletions carefully.
            // For simplicity, we remove it entirely.
            const index = this.usageOrder.indexOf(key);
            if (index !== -1) {
                this.usageOrder.splice(index, 1);
            }
        }
    }
    getRemainingKeys() {
        // Return keys from MRU to LRU (usageOrder is already in this order)
        return this.usageOrder;
    }
}
function solve() {
    // Read all input data from standard input
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length === 0)
        return;
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // First line: C N
    const [C, N] = lines[0].split(/\s+/).map(Number);
    const cache = new LRUCache(C);
    const getResults = [];
    let getCount = 0;
    // Process N operations
    for (let i = 1; i <= N; i++) {
        const parts = lines[i].split(/\s+/);
        const operation = parts[0];
        if (operation === "PUT") {
            const key = parts[1];
            // Value must be parsed as signed 32-bit integer
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (operation === "GET") {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
            getCount++;
        }
        else if (operation === "DEL") {
            const key = parts[1];
            cache.deleteKey(key);
        }
    }
    // --- Output Formatting ---
    // 1. GET results
    if (getCount === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    // 2. Remaining keys (MRU to LRU)
    const remainingKeys = cache.getRemainingKeys();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(" "));
    }
}
solve();
