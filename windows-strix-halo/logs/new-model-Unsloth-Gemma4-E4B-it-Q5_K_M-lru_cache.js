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
 * Node structure for the Doubly Linked List
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
 * LRUCache implementation
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        // Initialize sentinel nodes
        this.head = new Node("__HEAD__", 0);
        this.tail = new Node("__TAIL__", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    /**
     * Removes a node from its current position in the list. O(1)
     */
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    /**
     * Adds a node right after the head (making it MRU). O(1)
     */
    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    /**
     * Moves an existing node to the head (MRU position). O(1)
     */
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    /**
     * Evicts the least recently used node (the one before the tail). O(1)
     * @returns The key of the evicted node, or null if cache is empty.
     */
    popTail() {
        const lruNode = this.tail.prev;
        if (lruNode === this.head) {
            // Cache is empty
            return null;
        }
        this.removeNode(lruNode);
        return lruNode.key;
    }
    /**
     * Handles the PUT operation. O(1)
     */
    put(key, value) {
        if (this.map.has(key)) {
            // Key exists: update value and move to head
            const node = this.map.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // Key is new: create node and insert
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
            // Check capacity and evict if necessary
            if (this.map.size > this.capacity) {
                const evictedKey = this.popTail();
                if (evictedKey !== null) {
                    this.map.delete(evictedKey);
                }
            }
        }
    }
    /**
     * Handles the GET operation. O(1)
     * @returns The value, or -1 if not found.
     */
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        // Successful GET makes the key MRU
        this.moveToHead(node);
        return node.value;
    }
    /**
     * Handles the DEL operation. O(1)
     */
    delete(key) {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key);
        this.removeNode(node);
        this.map.delete(key);
    }
    /**
     * Retrieves the keys in MRU to LRU order.
     * @returns Array of keys.
     */
    getKeysInOrder() {
        const keys = [];
        let current = this.head.next;
        // Traverse the list until the tail sentinel
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function solve() {
    // Read all input from standard input
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0 || input[0].trim() === '') {
        console.log('EMPTY\nEMPTY');
        return;
    }
    // Parse C and N from the first line
    const [capacityStr, numOpsStr] = input[0].trim().split(/\s+/);
    const C = parseInt(capacityStr);
    const N = parseInt(numOpsStr);
    const cache = new LRUCache(C);
    const operations = input.slice(1);
    const getResults = [];
    for (const line of operations) {
        if (line.trim() === '')
            continue;
        const parts = line.trim().split(/\s+/);
        const command = parts[0];
        switch (command) {
            case 'PUT':
                const keyPut = parts[1];
                // Value is guaranteed to be a signed 32-bit integer
                const valuePut = parseInt(parts[2]);
                cache.put(keyPut, valuePut);
                break;
            case 'GET':
                const keyGet = parts[1];
                const result = cache.get(keyGet);
                getResults.push(result);
                break;
            case 'DEL':
                const keyDel = parts[1];
                cache.delete(keyDel);
                break;
        }
    }
    // --- Output Generation ---
    // 1. GET results
    const getOutput = getResults.length > 0
        ? getResults.join(' ')
        : 'EMPTY';
    console.log(getOutput);
    // 2. Remaining keys in order
    const finalKeys = cache.getKeysInOrder();
    const keyOutput = finalKeys.length > 0
        ? finalKeys.join(' ')
        : 'EMPTY';
    console.log(keyOutput);
}
solve();
