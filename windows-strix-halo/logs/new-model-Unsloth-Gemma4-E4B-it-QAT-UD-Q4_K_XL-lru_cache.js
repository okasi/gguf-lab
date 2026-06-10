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
        // 2. Add to the head
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            // List was empty, the added node is both head and tail
            this.tail = node;
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
            // List was empty
            this.tail = node;
        }
    }
    /**
     * Removes a node from the list.
     */
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
    /**
     * Handles the PUT operation.
     * @returns true if the key was inserted/updated, false if error (not applicable here).
     */
    put(key, value) {
        if (this.cacheMap.has(key)) {
            // Update existing key and move to head
            const node = this.cacheMap.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // New key
            const newNode = new CacheNode(key, value);
            if (this.cacheMap.size >= this.capacity) {
                // Evict LRU (the tail)
                if (this.tail) {
                    const lruKey = this.tail.key;
                    this.removeNode(this.tail);
                    this.cacheMap.delete(lruKey);
                }
            }
            // Insert new node at head
            this.addNodeToHead(newNode);
            this.cacheMap.set(key, newNode);
        }
    }
    /**
     * Handles the GET operation.
     * @returns The value if found, otherwise -1.
     */
    get(key) {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const node = this.cacheMap.get(key);
        // Access makes it most recently used
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
     * Returns the keys from MRU to LRU.
     * @returns Array of keys in order.
     */
    getKeysOrder() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
/**
 * Main function to handle input/output.
 */
function solve() {
    // Read all input data from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '')
        return;
    // Parse C and N from the first line
    const [cStr, nStr] = input[0].trim().split(/\s+/);
    const C = parseInt(cStr);
    const N = parseInt(nStr);
    if (isNaN(C) || isNaN(N) || C < 1 || N < 1)
        return;
    const lruCache = new LRUCache(C);
    const getResults = [];
    // Process N operations starting from the second line (index 1)
    for (let i = 1; i <= N; i++) {
        const line = input[i]?.trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1];
        if (command === 'PUT') {
            const value = parseInt(parts[2]);
            lruCache.put(key, value);
        }
        else if (command === 'GET') {
            const result = lruCache.get(key);
            getResults.push(result);
        }
        else if (command === 'DEL') {
            lruCache.delete(key);
        }
    }
    // --- Output Formatting ---
    // 1. First line: all GET results separated by spaces, or EMPTY if there were no GET operations.
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // 2. Second line: remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty.
    const keysOrder = lruCache.getKeysOrder();
    if (keysOrder.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(keysOrder.join(' '));
    }
}
solve();
