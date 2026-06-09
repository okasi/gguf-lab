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
class DLLNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null; // Sentinel nodes handle initial setup
        this.next = null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        // Initialize sentinel nodes
        this.head = new DLLNode(null, 0);
        this.tail = new DLLNode(null, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    // Helper to remove a node from the list
    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    // Helper to add a node right after the head (making it MRU)
    _addToHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    // Moves an existing node to the head (MRU)
    _moveToHead(node) {
        this._removeNode(node);
        this._addToHead(node);
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }
        // Update usage: move to head
        this._moveToHead(node);
        return node.value;
    }
    put(key, value) {
        let node = this.cache.get(key);
        if (node) {
            // Key exists: Update value and move to head
            node.value = value;
            this._moveToHead(node);
        }
        else {
            // Key is new: Check capacity
            if (this.cache.size === this.capacity) {
                // Evict LRU item (which is tail.prev)
                const lruNode = this.tail.prev;
                if (lruNode) {
                    this._removeNode(lruNode);
                    this.cache.delete(lruNode.key);
                }
            }
            // Create new node and add it
            const newNode = new DLLNode(key, value);
            this.cache.set(key, newNode);
            this._addToHead(newNode);
        }
    }
    delete(key) {
        const node = this.cache.get(key);
        if (node) {
            this._removeNode(node);
            this.cache.delete(key);
        }
    }
    // Returns all keys from MRU to LRU
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
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].length === 0) {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    // Parse C and N
    const [capacityStr, numOpsStr] = input[0].split(' ');
    const C = parseInt(capacityStr);
    const N = parseInt(numOpsStr);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = input[i].trim();
        if (line.length === 0)
            continue;
        const parts = line.split(' ');
        const operation = parts[0];
        if (operation === 'PUT') {
            const key = parts[1];
            // Value is guaranteed to be a signed 32-bit integer
            const value = parseInt(parts[2]);
            cache.put(key, value);
        }
        else if (operation === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (operation === 'DEL') {
            const key = parts[1];
            cache.delete(key);
        }
    }
    // --- Output Generation ---
    // 1. GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // 2. Remaining keys (MRU to LRU)
    const remainingKeys = cache.getKeysInOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(' '));
    }
}
solve();
