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
        this.size = 0;
        // Maps key to the actual Node object stored in the DLL
        this.cacheMap = new Map();
        // Sentinel nodes for the DLL
        this.head = new Node("", 0); // MRU side
        this.tail = new Node("", 0); // LRU side
        this.capacity = capacity;
        // Initialize DLL structure: Head -> Tail
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    /**
     * Removes a node from the DLL. O(1)
     */
    removeNode(node) {
        const prevNode = node.prev;
        const nextNode = node.next;
        if (prevNode) {
            prevNode.next = nextNode;
        }
        if (nextNode) {
            nextNode.prev = prevNode;
        }
        node.prev = null;
        node.next = null;
    }
    /**
     * Moves a node to the head (MRU). O(1)
     */
    moveToHead(node) {
        // 1. Remove it from its current spot
        if (node.prev !== null || node.next !== null) {
            this.removeNode(node);
        }
        // 2. Re-insert it at the head
        this.addNode(node);
    }
    /**
     * Adds a node to the head (MRU). O(1)
     */
    addNode(node) {
        // Current head is the node immediately after the sentinel head
        const currentHeadNext = this.head.next;
        // Set up pointers
        node.prev = this.head;
        node.next = currentHeadNext;
        // Update surrounding nodes' pointers
        this.head.next = node;
        if (currentHeadNext) {
            currentHeadNext.prev = node;
        }
        // Ensure the node is properly linked
        this.removeNode(node); // Remove to ensure the pointers are clean before insertion
        this.head.next = node;
        node.prev = this.head;
        if (currentHeadNext) {
            currentHeadNext.prev = node;
        }
        // If the list only has one item (or is empty), we need to handle the tail pointer if necessary
        // Since we use sentinel nodes, we just ensure the head points to the new node.
    }
    /**
     * Retrieves the value for a key. O(1)
     * @returns value or null if not found
     */
    get(key) {
        const node = this.cacheMap.get(key);
        if (!node) {
            return null;
        }
        // Found it, make it MRU
        this.moveToHead(node);
        return node.value;
    }
    /**
     * Inserts or updates a key-value pair. O(1)
     */
    put(key, value) {
        let node = this.cacheMap.get(key);
        if (node) {
            // Key exists: Update value and move to MRU
            node.value = value;
            this.moveToHead(node);
            return;
        }
        // Key does not exist: New insertion
        const newNode = new Node(key, value);
        // Check capacity
        if (this.size >= this.capacity) {
            // Evict LRU node (the node before the tail sentinel)
            const lruNode = this.tail.prev;
            if (lruNode && lruNode !== this.head) {
                this.removeNode(lruNode);
                this.cacheMap.delete(lruNode.key);
                this.size--;
            }
        }
        // Insert the new node (which acts as the MRU)
        this.cacheMap.set(key, newNode);
        this.addNode(newNode);
        this.size++;
    }
    /**
     * Removes a key from the cache. O(1)
     */
    delete(key) {
        const node = this.cacheMap.get(key);
        if (!node) {
            return false;
        }
        // Remove node from DLL and map
        this.removeNode(node);
        this.cacheMap.delete(key);
        this.size--;
        return true;
    }
    /**
     * Generates the ordered list of keys for output. O(K) where K is size.
     */
    getOrderedKeys() {
        const keys = [];
        let current = this.head.next;
        // Iterate from MRU (after head) to LRU (before tail)
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');
    if (lines.length === 0)
        return;
    // Parse C and N
    const [capacityStr, NStr] = lines[0].split(' ');
    const C = parseInt(capacityStr);
    const N = parseInt(NStr);
    const cache = new LRUCache(C);
    const getResults = [];
    // Process operations from line 1 onwards
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (!line)
            continue;
        const parts = line.split(' ');
        const operation = parts[0];
        const key = parts[1];
        // Handle value parsing carefully (signed 32-bit integer)
        let value = null;
        if (operation === 'PUT' || operation === 'DEL') {
            // If PUT, the second argument is the value.
            if (operation === 'PUT') {
                value = parseInt(parts[2]);
            }
        }
        switch (operation) {
            case 'PUT':
                if (value !== null) {
                    cache.put(key, value);
                }
                break;
            case 'GET':
                const result = cache.get(key);
                // GET should output the value if present, otherwise -1
                const outputValue = result === null ? -1 : result;
                getResults.push(outputValue);
                break;
            case 'DEL':
                cache.delete(key);
                break;
        }
    }
    // --- Output Formatting ---
    // 1. GET results
    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    console.log(getOutput);
    // 2. Remaining keys (MRU to LRU)
    const orderedKeys = cache.getOrderedKeys();
    const keyOutput = orderedKeys.length > 0 ? orderedKeys.join(' ') : 'EMPTY';
    console.log(keyOutput);
}
main();
