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
 * Represents a node in the Doubly Linked List.
 * Stores the key and value, and pointers to previous and next nodes.
 */
class DLLNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
/**
 * Implements the LRU Cache mechanism using a Map and a Doubly Linked List.
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cacheMap = new Map();
        // Initialize dummy head and tail nodes for easier list management
        this.head = new DLLNode(null, null);
        this.tail = new DLLNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    /**
     * Moves an existing node to the head (MRU position).
     * O(1)
     */
    moveToHead(node) {
        // 1. Remove the node from its current position
        this.removeNode(node);
        // 2. Add it right after the dummy head
        this.addNode(node);
    }
    /**
     * Adds a new node right after the dummy head (MRU position).
     * O(1)
     */
    addNode(node) {
        // Node connections
        node.prev = this.head;
        node.next = this.head.next;
        // Neighbor connections
        this.head.next.prev = node;
        this.head.next = node;
    }
    /**
     * Removes a specific node from the linked list.
     * O(1)
     */
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    /**
     * Evicts the Least Recently Used item (the node before the dummy tail).
     * O(1)
     */
    removeTail() {
        const lruNode = this.tail.prev;
        this.removeNode(lruNode);
        this.cacheMap.delete(lruNode.key);
        return lruNode.key;
    }
    /**
     * Retrieves a value for a key. If found, marks it as MRU.
     * O(1)
     */
    get(key) {
        const node = this.cacheMap.get(key);
        if (!node) {
            return -1;
        }
        // Update usage: move to head
        this.moveToHead(node);
        return node.value;
    }
    /**
     * Inserts or updates a key-value pair.
     * O(1)
     */
    put(key, value) {
        let node = this.cacheMap.get(key);
        if (node) {
            // Update existing key
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // New key insertion
            const newNode = new DLLNode(key, value);
            this.cacheMap.set(key, newNode);
            this.addNode(newNode);
            // Check capacity and evict if necessary
            if (this.cacheMap.size > this.capacity) {
                this.removeTail();
            }
        }
    }
    /**
     * Deletes a key from the cache.
     * O(1)
     */
    delete(key) {
        const node = this.cacheMap.get(key);
        if (node) {
            this.removeNode(node);
            this.cacheMap.delete(key);
        }
    }
    /**
     * Returns the keys in MRU order.
     * O(C) where C is current cache size
     */
    getKeysInOrder() {
        const keys = [];
        let current = this.head.next;
        // Traverse from head (MRU) until the dummy tail
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function solve() {
    // Read all input from standard input (fd 0)
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0 || input[0].trim() === '') {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    // Parse capacity (C) and number of operations (N)
    const header = input[0].split(' ').map(s => parseInt(s.trim()));
    const capacity = header[0];
    // const N = header[1]; // N is implicitly the rest of the lines
    const cache = new LRUCache(capacity);
    const getResults = [];
    // Process operations starting from the second line
    for (let i = 1; i < input.length; i++) {
        const line = input[i].trim();
        if (line === '')
            continue;
        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1] || '';
        try {
            switch (command) {
                case 'PUT':
                    const value = parseInt(parts[2]);
                    cache.put(key, value);
                    break;
                case 'GET':
                    const result = cache.get(key);
                    getResults.push(result);
                    break;
                case 'DEL':
                    cache.delete(key);
                    break;
            }
        }
        catch (e) {
            // Handle potential parsing errors gracefully if input format is unexpected
            // console.error("Error processing line:", line, e);
        }
    }
    // --- Output Generation ---
    // 1. GET results line
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // 2. Remaining keys line (MRU to LRU)
    const remainingKeys = cache.getKeysInOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(' '));
    }
}
solve();
