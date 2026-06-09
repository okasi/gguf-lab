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
 * Stores the key, value, and pointers for traversal.
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
 * Implements the LRU Cache logic using a Map and a Doubly Linked List.
 * Time complexity for all operations (get, put, delete) is O(1) amortized.
 */
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        // Create dummy head and tail nodes
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        // Initialize the DLL: head <-> tail
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    /**
     * Helper function to remove a node from the DLL.
     * @param node The node to remove.
     */
    removeNode(node) {
        const prevNode = node.prev;
        const nextNode = node.next;
        prevNode.next = nextNode;
        nextNode.prev = prevNode;
    }
    /**
     * Helper function to add a node right after the head (making it MRU).
     * @param node The node to add.
     */
    addToHead(node) {
        // Node position: head -> node -> head.next
        const nextNode = this.head.next;
        // Update pointers
        node.prev = this.head;
        node.next = nextNode;
        this.head.next = node;
        nextNode.prev = node;
    }
    /**
     * Moves an existing node to the MRU position.
     * @param node The node to move.
     */
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    /**
     * Retrieves a value from the cache. Moves the accessed item to MRU.
     * @param key The key to retrieve.
     * @returns The value, or -1 if not found.
     */
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }
        // Cache hit: Move to MRU
        this.moveToHead(node);
        return node.value;
    }
    /**
     * Inserts or updates a key-value pair. Handles eviction if necessary.
     * @param key The key.
     * @param value The value.
     */
    put(key, value) {
        let node = this.cache.get(key);
        if (node) {
            // Key exists: Update value and move to MRU
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // New key: Check capacity
            if (this.cache.size >= this.capacity) {
                // Eviction needed: Remove the LRU item (node right before the tail)
                const lruNode = this.tail.prev;
                this.removeNode(lruNode);
                this.cache.delete(lruNode.key);
            }
            // Create and insert the new node
            const newNode = new Node(key, value);
            this.cache.set(key, newNode);
            this.addToHead(newNode);
        }
    }
    /**
     * Removes a key from the cache.
     * @param key The key to delete.
     */
    delete(key) {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
        }
    }
    /**
     * Retrieves the keys remaining in the cache, ordered from MRU to LRU.
     * @returns An array of keys in usage order.
     */
    getKeysInOrder() {
        const keys = [];
        let current = this.head.next; // Start after the dummy head
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
/**
 * Main function to read input, process operations, and generate output.
 */
function solve() {
    // Read all input synchronously
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // Parse C (Capacity) and N (Number of Operations)
    const [C_str, N_str] = lines[0].split(' ');
    const capacity = parseInt(C_str);
    const N = parseInt(N_str);
    const cache = new LRUCache(capacity);
    const getResults = [];
    // Process N operations (starting from line 1)
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        const parts = line.split(' ');
        const operation = parts[0];
        const key = parts[1];
        if (operation === 'PUT') {
            // PUT key value
            const value = parseInt(parts[2]);
            cache.put(key, value);
        }
        else if (operation === 'GET') {
            // GET key
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (operation === 'DEL') {
            // DEL key
            cache.delete(key);
        }
    }
    // --- Output Generation ---
    // 1. GET results
    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    console.log(getOutput);
    // 2. Remaining keys (MRU to LRU)
    const keysInOrder = cache.getKeysInOrder();
    const keyOutput = keysInOrder.length > 0 ? keysInOrder.join(' ') : 'EMPTY';
    console.log(keyOutput);
}
solve();
