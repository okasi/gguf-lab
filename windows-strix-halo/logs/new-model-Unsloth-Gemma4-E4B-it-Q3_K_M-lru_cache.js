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
// Define the structure for a node in the Doubly Linked List
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
// Implement the LRUCache using Map and a Doubly Linked List
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.keyMap = new Map();
        this.head = null;
        this.tail = null;
    }
    // Helper function to move an existing node to the head (MRU)
    moveToHead(node) {
        // 1. Remove the node from its current position
        if (node.prev) {
            node.prev.next = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        // Special case: If the node is currently the tail, update the tail pointer
        if (node === this.tail) {
            this.tail = node.prev;
            if (this.tail) {
                this.tail.next = null;
            }
        }
        // 2. Insert the node at the head
        if (this.head) {
            node.next = this.head;
            this.head.prev = node;
        }
        else {
            // Cache is empty
            this.tail = node;
        }
        node.prev = null;
        this.head = node;
    }
    // Helper function to add a new node to the head (MRU)
    addToHead(node) {
        if (this.head) {
            node.next = this.head;
            this.head.prev = node;
        }
        else {
            // Cache is empty
            this.tail = node;
        }
        node.prev = null;
        this.head = node;
    }
    // Get operation
    get(key) {
        const node = this.keyMap.get(key);
        if (!node) {
            return -1;
        }
        // Update usage (O(1))
        this.moveToHead(node);
        return node.value;
    }
    // Put operation
    put(key, value) {
        const node = this.keyMap.get(key);
        if (node) {
            // Key exists: Update value and move to head (O(1))
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // Key is new: Create node
            const newNode = new Node(key, value);
            // Check capacity and evict if necessary
            if (this.keyMap.size >= this.capacity) {
                // Evict the LRU item (the tail)
                const lruKey = this.tail.key;
                this.keyMap.delete(lruKey);
                // Remove the tail node from the list
                this.tail = this.tail.prev;
                if (this.tail) {
                    this.tail.next = null;
                }
                else {
                    // List is now empty
                    this.head = null;
                }
            }
            // Add the new node (O(1))
            this.keyMap.set(key, newNode);
            this.addToHead(newNode);
        }
    }
    // Delete operation
    delete(key) {
        const node = this.keyMap.get(key);
        if (!node) {
            return;
        }
        // Remove from map
        this.keyMap.delete(key);
        // Remove from DLL
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
        // Clear node references to aid garbage collection
        node.prev = null;
        node.next = null;
    }
    // Get keys in order (MRU to LRU)
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
    // Read all input from stdin (File Descriptor 0)
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');
    if (lines.length === 0)
        return;
    // Parse C and N from the first line
    const firstLine = lines[0].split(' ');
    const C = parseInt(firstLine[0]);
    const N = parseInt(firstLine[1]);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim().split(' ');
        const operation = line[0];
        const key = line[1];
        if (operation === 'PUT') {
            const value = parseInt(line[2]);
            cache.put(key, value);
        }
        else if (operation === 'GET') {
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (operation === 'DEL') {
            cache.delete(key);
        }
    }
    // --- Output Generation ---
    // 1. GET Results Line
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // 2. Remaining Keys Line
    const remainingKeys = cache.getKeysInOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(' '));
    }
}
solve();
