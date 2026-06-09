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
// --- Doubly Linked List Node ---
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
// --- LRU Cache Implementation ---
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        // Initialize dummy nodes
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.head.prev = null; // Ensure head is properly terminated
        this.tail.next = null; // Ensure tail is properly terminated
    }
    /** Helper: Removes a node from the list */
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    /** Helper: Adds a node right after the head (making it MRU) */
    addNode(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    /** Helper: Moves an existing node to the MRU position (head) */
    moveToHead(node) {
        this.removeNode(node);
        this.addNode(node);
    }
    /**
     * GET operation. Returns the value or -1.
     * O(1)
     */
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }
        // Found: Update usage (move to MRU)
        this.moveToHead(node);
        return node.value;
    }
    /**
     * PUT operation. Updates/inserts.
     * O(1) amortized
     */
    put(key, value) {
        let node = this.cache.get(key);
        if (node) {
            // Update existing key
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // New key insertion
            // Check capacity and evict if necessary
            if (this.cache.size >= this.capacity) {
                // LRU is the node right before the tail
                const lruNode = this.tail.prev;
                // Remove from list and cache
                this.removeNode(lruNode);
                this.cache.delete(lruNode.key);
            }
            // Create new node
            const newNode = new Node(key, value);
            this.cache.set(key, newNode);
            this.addNode(newNode);
        }
    }
    /**
     * DEL operation. Removes the key.
     * O(1)
     */
    delete(key) {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
        }
    }
    /** Retrieves all current keys ordered from MRU to LRU. */
    getKeysInOrder() {
        const keys = [];
        let currentNode = this.head.next;
        while (currentNode !== this.tail) {
            keys.push(currentNode.key);
            currentNode = currentNode.next;
        }
        return keys;
    }
}
/**
 * Main function to read input, run operations, and print output.
 */
function solve() {
    // Read all input from stdin (file descriptor 0)
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');
    if (lines.length === 0)
        return;
    // 1. Parse capacity C and operation count N
    const header = lines[0].trim().split(' ');
    const capacity = parseInt(header[0], 10);
    const numOperations = parseInt(header[1], 10);
    // 2. Initialize cache and state
    const cache = new LRUCache(capacity);
    const getResults = [];
    // 3. Process operations
    for (let i = 1; i <= numOperations; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(' ');
        const operation = parts[0];
        const key = parts[1];
        try {
            switch (operation) {
                case 'PUT':
                    // Value is guaranteed to be a signed 32-bit integer
                    const valuePut = parseInt(parts[2], 10);
                    cache.put(key, valuePut);
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
            // (Though constraints assume valid input)
        }
    }
    // 4. Output Generation
    // First line: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // Second line: Current keys in order (MRU to LRU)
    const finalKeys = cache.getKeysInOrder();
    if (finalKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(finalKeys.join(' '));
    }
}
solve();
