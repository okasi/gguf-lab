"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
/**
 * CacheNode represents a node in the doubly linked list.
 */
class CacheNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
/**
 * LRUCache implements the Least Recently Used cache logic.
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cacheMap = new Map();
        this.head = null;
        this.tail = null;
    }
    /**
     * Moves a node to the head (marking it as most recently used).
     * Assumes the node is already in the list.
     */
    moveToHead(node) {
        if (node === this.head) {
            return; // Already the most recent
        }
        // 1. Remove from current position
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
        // 2. Insert at the head
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node; // List was empty or only had one node
        }
    }
    /**
     * Adds a new node to the head of the list.
     */
    addNodeToHead(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }
    /**
     * Removes a specific node from the linked list.
     */
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            // Node is the head
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            // Node is the tail
            this.tail = node.prev;
        }
        // Isolate the node
        node.next = null;
        node.prev = null;
    }
    /**
     * Handles the PUT operation.
     * @returns true if the key was inserted/updated.
     */
    put(key, value) {
        if (this.cacheMap.has(key)) {
            // Key exists: Update value and move to head
            const node = this.cacheMap.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // New key: Insert
            const newNode = new CacheNode(key, value);
            this.cacheMap.set(key, newNode);
            this.addNodeToHead(newNode);
            // Check capacity and evict if necessary
            if (this.cacheMap.size > this.capacity) {
                this.evictLRU();
            }
        }
    }
    /**
     * Handles the GET operation.
     * @returns The value, or -1 if not found.
     */
    get(key) {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const node = this.cacheMap.get(key);
        // Update usage and move to head
        this.moveToHead(node);
        return node.value;
    }
    /**
     * Handles the DEL operation.
     */
    delete(key) {
        if (this.cacheMap.has(key)) {
            const node = this.cacheMap.get(key);
            this.removeNode(node);
            this.cacheMap.delete(key);
        }
    }
    /**
     * Evicts the least recently used item (the tail).
     */
    evictLRU() {
        if (!this.tail)
            return;
        const lruNode = this.tail;
        const key = lruNode.key;
        // Remove from map and list
        this.cacheMap.delete(key);
        this.removeNode(lruNode);
    }
    /**
     * Returns all keys in MRU to LRU order.
     */
    getKeysInOrder() {
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
    if (input.length === 0 || input[0] === "")
        return;
    // Parse C and N
    const [CStr, NStr] = input[0].trim().split(/\s+/);
    const C = parseInt(CStr);
    const N = parseInt(NStr);
    const cache = new LRUCache(C);
    const operations = input.slice(1, N + 1);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        const line = operations[i].trim();
        if (line === "")
            continue;
        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1];
        switch (command) {
            case 'PUT':
                // Value is guaranteed to be a signed 32-bit integer
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;
            case 'GET':
                const result = cache.get(key);
                getResults.push(result.toString());
                break;
            case 'DEL':
                cache.delete(key);
                break;
        }
    }
    // --- Output Generation ---
    // 1. GET results
    if (getResults.length > 0) {
        console.log(getResults.join(' '));
    }
    else {
        console.log('EMPTY');
    }
    // 2. Remaining keys (MRU to LRU)
    const orderedKeys = cache.getKeysInOrder();
    if (orderedKeys.length > 0) {
        console.log(orderedKeys.join(' '));
    }
    else {
        console.log('EMPTY');
    }
}
solve();
