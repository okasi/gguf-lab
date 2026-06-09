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
 * Stores the key, value, and pointers to neighbors.
 */
class ListNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
/**
 * Implements the LRU Cache logic using a Map and a Doubly Linked List.
 * Time Complexity: O(1) amortized per operation.
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cacheMap = new Map();
        // Initialize sentinel nodes
        this.head = new ListNode("__HEAD__", 0);
        this.tail = new ListNode("__TAIL__", 0);
        // Link head and tail initially
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    /**
     * Removes a node from its current position in the DLL. O(1).
     */
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    /**
     * Inserts a node right after the head (making it MRU). O(1).
     */
    addNodeToHead(node) {
        // Node goes between head and head.next
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    /**
     * Moves an existing node to the head (MRU position). O(1).
     */
    moveToHead(node) {
        this.removeNode(node);
        this.addNodeToHead(node);
    }
    /**
     * Removes the Least Recently Used node (the one before the tail). O(1).
     * @returns The key of the evicted node, or null if cache is empty.
     */
    removeTail() {
        const lruNode = this.tail.prev;
        this.removeNode(lruNode);
        return lruNode.key;
    }
    /**
     * Handles a GET operation.
     */
    get(key) {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const node = this.cacheMap.get(key);
        this.moveToHead(node); // Update recency
        return node.value;
    }
    /**
     * Handles a PUT operation.
     */
    put(key, value) {
        if (this.cacheMap.has(key)) {
            // Key exists: Update value and move to head
            const node = this.cacheMap.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // New key: Check capacity
            if (this.cacheMap.size >= this.capacity) {
                // Evict LRU
                const evictedKey = this.removeTail();
                if (evictedKey !== null) {
                    this.cacheMap.delete(evictedKey);
                }
            }
            // Insert new node
            const newNode = new ListNode(key, value);
            this.cacheMap.set(key, newNode);
            this.addNodeToHead(newNode);
        }
    }
    /**
     * Handles a DEL operation.
     */
    delete(key) {
        if (!this.cacheMap.has(key)) {
            return false;
        }
        const node = this.cacheMap.get(key);
        this.removeNode(node);
        this.cacheMap.delete(key);
        return true;
    }
    /**
     * Retrieves the keys in order from MRU to LRU.
     */
    getKeysOrder() {
        const orderedKeys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            orderedKeys.push(current.key);
            current = current.next;
        }
        return orderedKeys;
    }
}
/**
 * Main execution function.
 */
function solve() {
    // Read all input from stdin (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === '') {
        console.log("EMPTY\nEMPTY");
        return;
    }
    // 1. Parse C and N
    const [capacityStr, numOpsStr] = input[0].split(/\s+/);
    const capacity = parseInt(capacityStr);
    const numOps = parseInt(numOpsStr);
    if (isNaN(capacity) || isNaN(numOps) || capacity <= 0) {
        console.log("EMPTY\nEMPTY");
        return;
    }
    const cache = new LRUCache(capacity);
    const getResults = [];
    // 2. Process operations
    for (let i = 1; i <= numOps && i < input.length; i++) {
        const line = input[i].trim();
        if (line === '')
            continue;
        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1] || '';
        switch (command) {
            case 'PUT':
                // PUT key value
                const value = parseInt(parts[2]);
                if (!isNaN(value)) {
                    cache.put(key, value);
                }
                break;
            case 'GET':
                // GET key
                const result = cache.get(key);
                getResults.push(result);
                break;
            case 'DEL':
                // DEL key
                cache.delete(key);
                break;
            default:
                // Ignore unknown commands
                break;
        }
    }
    // 3. Generate Output
    // Output 1: GET results
    let output1 = '';
    if (getResults.length === 0) {
        output1 = 'EMPTY';
    }
    else {
        output1 = getResults.map(r => r.toString()).join(' ');
    }
    // Output 2: Remaining keys (MRU to LRU)
    const keysOrder = cache.getKeysOrder();
    let output2 = '';
    if (keysOrder.length === 0) {
        output2 = 'EMPTY';
    }
    else {
        output2 = keysOrder.join(' ');
    }
    console.log(output1);
    console.log(output2);
}
solve();
