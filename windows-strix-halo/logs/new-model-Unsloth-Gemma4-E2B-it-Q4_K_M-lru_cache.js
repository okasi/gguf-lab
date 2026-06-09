"use strict";
const fs = require('fs');
/**
 * Node structure for the Doubly Linked List in the LRU cache.
 */
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
/**
 * Least Recently Used Cache implementation.
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cacheMap = new Map(); // key -> Node
        // Dummy head (MRU) and tail (LRU) for the Doubly Linked List
        this.head = new Node(null, null);
        this.tail = new Node(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    /**
     * Helper function to remove a node from the linked list.
     * @param {Node} node
     */
    _removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    /**
     * Helper function to move a node to the front (MRU position).
     * @param {Node} node
     */
    _moveToHead(node) {
        // 1. Remove node from current position
        this._removeNode(node);
        // 2. Insert node right after the head
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    /**
     * Helper function to add a new node to the front (MRU position).
     * @param {Node} node
     */
    _insertAtHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    /**
     * Performs a GET operation.
     * @param {string} key
     * @returns {number} The value if found, otherwise -1.
     */
    get(key) {
        const node = this.cacheMap.get(key);
        if (!node) {
            return -1;
        }
        // Key found: Move to MRU position
        this._moveToHead(node);
        return node.value;
    }
    /**
     * Performs a PUT operation.
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
            // New key insertion
            const newNode = new Node(key, value);
            this.cacheMap.set(key, newNode);
            this._insertAtHead(newNode);
            // Check capacity and evict LRU if necessary
            if (this.cacheMap.size > this.capacity) {
                // Evict the LRU node (the node just before the tail)
                const lruNode = this.tail.prev;
                this._removeNode(lruNode);
                this.cacheMap.delete(lruNode.key);
            }
        }
    }
    /**
     * Performs a DEL operation.
     * @param {string} key
     */
    del(key) {
        const node = this.cacheMap.get(key);
        if (node) {
            // Remove from list
            this._removeNode(node);
            // Remove from map
            this.cacheMap.delete(key);
        }
    }
    /**
     * Retrieves the keys in order from MRU to LRU.
     * @returns {string[]} Array of keys.
     */
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
    try {
        const input = fs.readFileSync(0, "utf8").trim().split('\n');
        if (input.length === 0)
            return;
        // --- 1. Parse C and N ---
        const [C_str, N_str] = input[0].trim().split(/\s+/);
        const C = parseInt(C_str, 10);
        const N = parseInt(N_str, 10);
        const cache = new LRUCache(C);
        const getResults = [];
        // --- 2. Process Operations ---
        for (let i = 1; i <= N; i++) {
            const line = input[i] ? input[i].trim() : '';
            if (!line)
                continue;
            const parts = line.split(/\s+/);
            const operation = parts[0];
            const key = parts[1];
            switch (operation) {
                case 'PUT':
                    // Value is a signed 32-bit integer
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
        // --- 3. Generate Output ---
        // Output Line 1: GET results
        if (getResults.length > 0) {
            console.log(getResults.join(' '));
        }
        else {
            console.log('EMPTY');
        }
        // Output Line 2: Remaining keys (MRU to LRU)
        const orderedKeys = cache.getOrderedKeys();
        if (orderedKeys.length > 0) {
            console.log(orderedKeys.join(' '));
        }
        else {
            console.log('EMPTY');
        }
    }
    catch (e) {
        // Handle potential file read errors or parsing errors gracefully
        // In a competitive environment, this might be omitted, but good practice for robustness.
        // console.error("Error processing input:", e);
    }
}
solve();
