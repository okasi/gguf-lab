"use strict";
const fs = require('fs');
/**
 * A Least Recently Used (LRU) Cache implementation using a Map and a Doubly Linked List
 * structure (simulated via object properties for simplicity in this context,
 * although a dedicated structure would be more robust for true O(1) performance
 * tracking of recency).
 *
 * For O(1) complexity with PUT, GET, and DEL, we use a Map for O(1) key lookups
 * and a Doubly Linked List to maintain the usage order.
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        // Map: key -> node in the list (for O(1) access)
        this.map = new Map();
        // Doubly Linked List structure:
        // head (MRU) -> ... -> tail (LRU)
        this.head = { key: null, value: null, prev: null, next: null }; // Dummy head
        this.tail = { key: null, value: null, prev: null, next: null }; // Dummy tail
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    // Helper to remove a node from its current position
    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    // Helper to move a node to the front (MRU position)
    _moveToHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    // Helper to add a new node to the front (MRU position)
    _addToHead(key, value) {
        const newNode = { key, value, prev: this.head, next: this.head.next };
        this.head.next = newNode;
        newNode.next.prev = newNode;
    }
    put(key, value) {
        if (this.map.has(key)) {
            // Update value and move to head
            const node = this.map.get(key);
            node.value = value;
            this._moveToHead(node);
        }
        else {
            // Check capacity
            if (this.map.size >= this.capacity) {
                // Evict LRU (node before tail)
                const lruNode = this.tail.prev;
                if (lruNode !== this.head) {
                    this._removeNode(lruNode);
                    this.map.delete(lruNode.key);
                }
            }
            // Insert new item
            this._addToHead(key, value);
            this.map.set(key, { key, value, prev: this.tail, next: this.head.next }); // Store node reference
            this.map.set(key, { key, value, prev: this.tail, next: this.head.next }); // This mapping structure is tricky in TS/JS simulation. Let's simplify the storage for the map: key -> {value, listNode}
            // Re-implement map storage to hold list node references directly
            const newNode = { key, value, prev: this.tail, next: this.head.next };
            this.head.next = newNode;
            newNode.next.prev = newNode;
            this.map.set(key, newNode);
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        // Move to head (MRU)
        this._removeNode(node);
        this._addToHead(key, node.value); // Re-insert to ensure proper MRU ordering in the list structure
        return node.value;
    }
    delete(key) {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key);
        this._removeNode(node);
        this.map.delete(key);
    }
    // Get keys ordered from MRU to LRU
    getOrderedKeys() {
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
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].length === 0)
        return;
    // Parse C and N
    const [C_str, N_str] = input[0].trim().split(/\s+/);
    const C = parseInt(C_str);
    const N = parseInt(N_str);
    const cache = new LRUCache(C);
    const getResults = [];
    const getOperations = [];
    for (let i = 1; i <= N; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const operation = parts[0];
        if (operation === "PUT") {
            const key = parts[1];
            // Value is signed 32-bit integer
            const value = parseInt(parts[2]);
            cache.put(key, value);
        }
        else if (operation === "GET") {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
            getOperations.push("GET");
        }
        else if (operation === "DEL") {
            const key = parts[1];
            cache.delete(key);
        }
    }
    // --- Output Generation ---
    // Line 1: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    // Line 2: Remaining keys (MRU to LRU)
    const orderedKeys = cache.getOrderedKeys();
    if (orderedKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(orderedKeys.join(" "));
    }
}
solve();
