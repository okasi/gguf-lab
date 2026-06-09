"use strict";
const fs = require('fs');
/**
 * Represents a node in the Doubly Linked List.
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
 * Implements the Least Recently Used (LRU) Cache.
 */
class LRUCache {
    constructor(capacity) {
        this.cache = new Map();
        this.head = null; // Most Recently Used (MRU)
        this.tail = null; // Least Recently Used (LRU)
        this.capacity = capacity;
    }
    /**
     * Moves an existing node to the head of the list (MRU position).
     * @param node The node to move.
     */
    moveToHead(node) {
        if (node === this.head) {
            return; // Already MRU
        }
        // 1. Remove the node from its current position
        this.removeNode(node);
        // 2. Add it to the head
        this.addNodeToHead(node);
    }
    /**
     * Adds a new node to the head of the list (MRU position).
     * @param node The node to add.
     */
    addNodeToHead(node) {
        if (this.head === null) {
            this.head = node;
            this.tail = node;
            node.prev = null;
            node.next = null;
        }
        else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
            node.prev = null;
        }
    }
    /**
     * Removes a node from the list.
     * @param node The node to remove.
     */
    removeNode(node) {
        const prevNode = node.prev;
        const nextNode = node.next;
        if (prevNode) {
            prevNode.next = nextNode;
        }
        else {
            // If prev is null, the node was the head
            this.head = nextNode;
        }
        if (nextNode) {
            nextNode.prev = prevNode;
        }
        else {
            // If next is null, the node was the tail
            this.tail = prevNode;
        }
        node.prev = null;
        node.next = null;
    }
    /**
     * Retrieves the node corresponding to a key.
     * @param key The key to look up.
     * @returns The Node or null if not found.
     */
    getNode(key) {
        return this.cache.get(key);
    }
    /**
     * Handles the PUT operation.
     * @param key The key.
     * @param value The value (signed 32-bit integer).
     */
    put(key, value) {
        const node = this.cache.get(key);
        if (node) {
            // Key exists: Update value and make MRU
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // New key insertion
            const newNode = new Node(key, value);
            this.cache.set(key, newNode);
            this.addNodeToHead(newNode);
            // Check capacity and evict if necessary
            if (this.cache.size > this.capacity) {
                const lruNode = this.tail;
                if (lruNode) {
                    this.removeNode(lruNode);
                    this.cache.delete(lruNode.key);
                }
            }
        }
    }
    /**
     * Handles the GET operation.
     * @param key The key.
     * @returns The value if found, otherwise -1.
     */
    get(key) {
        const node = this.getNode(key);
        if (node) {
            // Hit: Make MRU
            this.moveToHead(node);
            return node.value;
        }
        else {
            // Miss
            return -1;
        }
    }
    /**
     * Handles the DEL operation.
     * @param key The key.
     * @returns True if the key was deleted, false otherwise.
     */
    del(key) {
        const node = this.getNode(key);
        if (node) {
            // Remove from Map
            this.cache.delete(key);
            // Remove from DLL
            this.removeNode(node);
            return true;
        }
        return false;
    }
    /**
     * Extracts the keys from MRU to LRU.
     * @returns Array of keys.
     */
    getOrderedKeys() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
    /**
     * Checks if the cache is empty.
     */
    isEmpty() {
        return this.cache.size === 0;
    }
}
function solve() {
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0)
        return;
    // Parse capacity (C) and number of operations (N)
    const [line1] = input;
    const [C_str, N_str] = line1.split(' ');
    const C = parseInt(C_str, 10);
    const N = parseInt(N_str, 10);
    const cache = new LRUCache(C);
    const getResults = [];
    // Process N operations starting from line 1
    for (let i = 1; i <= N; i++) {
        if (i >= input.length)
            break;
        const operationLine = input[i].trim();
        if (operationLine === "")
            continue;
        const parts = operationLine.split(' ');
        const command = parts[0];
        const key = parts[1];
        switch (command) {
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
    // --- Output Generation ---
    // 1. Output GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // 2. Output remaining keys (MRU to LRU)
    const orderedKeys = cache.getOrderedKeys();
    if (orderedKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(orderedKeys.join(' '));
    }
}
solve();
