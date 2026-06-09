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
 * Node structure for the Doubly Linked List.
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
 * Implements the LRU Cache logic.
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cacheMap = new Map();
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    /**
     * Helper: Adds a node to the front (MRU) of the list.
     */
    addToHead(node) {
        if (this.head === null) {
            this.head = node;
            this.tail = node;
        }
        else {
            node.next = this.head;
            node.prev = null;
            this.head.prev = node;
            this.head = node;
        }
    }
    /**
     * Helper: Removes a specified node from the list.
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
        node.prev = null;
        node.next = null;
    }
    /**
     * Helper: Moves an existing node to the front (MRU). O(1).
     */
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    /**
     * Helper: Removes the Least Recently Used item (the tail). O(1).
     */
    removeTail() {
        if (this.tail === null)
            return null;
        const lruNode = this.tail;
        this.removeNode(lruNode);
        return lruNode;
    }
    /**
     * Handles GET operation. O(1).
     */
    get(key) {
        const node = this.cacheMap.get(key);
        if (!node) {
            return -1;
        }
        // Update usage
        this.moveToHead(node);
        return node.value;
    }
    /**
     * Handles PUT operation. O(1).
     */
    put(key, value) {
        let node = this.cacheMap.get(key);
        if (node) {
            // Key exists: Update value and move to head
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // Key is new: Check capacity
            if (this.size === this.capacity) {
                // Evict LRU
                const evictedNode = this.removeTail();
                if (evictedNode) {
                    this.cacheMap.delete(evictedNode.key);
                }
            }
            // Insert new node
            node = new Node(key, value);
            this.cacheMap.set(key, node);
            this.addToHead(node);
            this.size++;
        }
    }
    /**
     * Handles DEL operation. O(1).
     */
    delete(key) {
        const node = this.cacheMap.get(key);
        if (node) {
            this.removeNode(node);
            this.cacheMap.delete(key);
            this.size--;
        }
    }
    /**
     * Returns keys in MRU to LRU order.
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
/**
 * Main function to read input and run the simulation.
 */
function solve() {
    try {
        // Read all input from stdin
        const input = fs.readFileSync(0, "utf8");
        const lines = input.trim().split('\n');
        if (lines.length === 0) {
            console.log("EMPTY\nEMPTY");
            return;
        }
        // Parse C and N from the first line
        const [capacityStr, numOpsStr] = lines[0].split(' ');
        const capacity = parseInt(capacityStr);
        const numOperations = parseInt(numOpsStr);
        const cache = new LRUCache(capacity);
        const getResults = [];
        // Process remaining N operations
        for (let i = 1; i <= numOperations; i++) {
            const line = lines[i];
            if (!line)
                continue;
            const parts = line.split(' ');
            const operation = parts[0];
            const key = parts[1];
            if (operation === 'GET') {
                const result = cache.get(key);
                getResults.push(result);
            }
            else if (operation === 'PUT') {
                // Value is a signed 32-bit integer
                const value = parseInt(parts[2]);
                cache.put(key, value);
            }
            else if (operation === 'DEL') {
                cache.delete(key);
            }
        }
        // --- Output Generation ---
        // 1. GET results
        if (getResults.length === 0) {
            console.log("EMPTY");
        }
        else {
            console.log(getResults.join(" "));
        }
        // 2. Remaining keys (MRU to LRU)
        const remainingKeys = cache.getKeysInOrder();
        if (remainingKeys.length === 0) {
            console.log("EMPTY");
        }
        else {
            console.log(remainingKeys.join(" "));
        }
    }
    catch (e) {
        // Handle potential file reading errors gracefully if needed,
        // but standard competitive programming constraints assume valid input.
    }
}
solve();
