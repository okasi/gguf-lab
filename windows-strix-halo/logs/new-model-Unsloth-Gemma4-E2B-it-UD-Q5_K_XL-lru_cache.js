"use strict";
const fs = require('fs');
/**
 * Node structure for the Doubly Linked List (DLL)
 * Stores the key and value, and pointers for list traversal.
 */
class LRUNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
/**
 * Implements the LRU Cache logic.
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        // Map stores key -> LRUNode
        this.cacheMap = new Map();
        // Dummy head (MRU) and dummy tail (LRU) for easy boundary handling
        this.head = new LRUNode(null, null);
        this.tail = new LRUNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    /**
     * Removes a node from its current position in the list. O(1).
     * @param {LRUNode} node
     */
    _removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    /**
     * Moves an existing node to the front (MRU position). O(1).
     * @param {LRUNode} node
     */
    _moveToHead(node) {
        // 1. Remove node from current position
        this._removeNode(node);
        // 2. Insert node right after the dummy head
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    /**
     * Adds a new node to the front (MRU position). O(1).
     * @param {LRUNode} node
     */
    _addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    /**
     * Removes the Least Recently Used node (node before the tail). O(1).
     * @returns {string | null} The key of the evicted node, or null if cache is empty.
     */
    _evictLRU() {
        const lruNode = this.tail.prev;
        if (lruNode === this.head) {
            return null; // Cache is empty
        }
        this._removeNode(lruNode);
        this.cacheMap.delete(lruNode.key);
        return lruNode.key;
    }
    /**
     * Handles the PUT operation. O(1) amortized.
     * @param {string} key
     * @param {number} value
     */
    put(key, value) {
        if (this.cacheMap.has(key)) {
            // Key exists: Update value and move to MRU
            const node = this.cacheMap.get(key);
            node.value = value;
            this._moveToHead(node);
        }
        else {
            // Key does not exist: Insert new node
            const newNode = new LRUNode(key, value);
            this.cacheMap.set(key, newNode);
            this._addToHead(newNode);
            // Check capacity
            if (this.cacheMap.size > this.capacity) {
                this._evictLRU();
            }
        }
    }
    /**
     * Handles the GET operation. O(1).
     * @param {string} key
     * @returns {number} The value if found, otherwise -1.
     */
    get(key) {
        if (this.cacheMap.has(key)) {
            const node = this.cacheMap.get(key);
            // Make most recently used
            this._moveToHead(node);
            return node.value;
        }
        return -1;
    }
    /**
     * Handles the DEL operation. O(1).
     * @param {string} key
     */
    del(key) {
        if (this.cacheMap.has(key)) {
            const node = this.cacheMap.get(key);
            this._removeNode(node);
            this.cacheMap.delete(key);
        }
    }
    /**
     * Retrieves keys in order from MRU to LRU.
     * @returns {string[]} Array of keys.
     */
    getKeysMRULRU() {
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
    // 1. Parse C and N
    const [C_str, N_str] = input[0].trim().split(/\s+/);
    const C = parseInt(C_str, 10);
    const N = parseInt(N_str, 10);
    const cache = new LRUCache(C);
    const getResults = [];
    // 2. Process N operations
    for (let i = 1; i <= N; i++) {
        if (!input[i])
            continue;
        const line = input[i].trim();
        if (line === '')
            continue;
        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1];
        switch (command) {
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
    // 3. Output Formatting
    // Line 1: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // Line 2: Remaining keys (MRU to LRU)
    const keys = cache.getKeysMRULRU();
    if (keys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(keys.join(' '));
    }
}
solve();
