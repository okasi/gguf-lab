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
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cacheMap = new Map();
        this.head = null;
        this.tail = null;
    }
    // Helper: Removes a node from the DLL
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
    // Helper: Adds a node to the head (MRU)
    addToHead(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            // If the list was empty, the new node is also the tail
            this.tail = node;
        }
    }
    // Helper: Moves an existing node to the head (MRU)
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    // GET operation
    get(key) {
        const node = this.cacheMap.get(key);
        if (!node) {
            return -1;
        }
        // Update usage: move to head
        this.moveToHead(node);
        return node.value;
    }
    // PUT operation
    put(key, value) {
        let node = this.cacheMap.get(key);
        if (node) {
            // Update existing key
            node.value = value;
            this.moveToHead(node);
        }
        else {
            // New key insertion
            const newNode = {
                key: key,
                value: value,
                prev: null,
                next: null
            };
            this.cacheMap.set(key, newNode);
            this.addToHead(newNode);
            // Check capacity and evict if necessary
            if (this.cacheMap.size > this.capacity) {
                if (this.tail) {
                    // Evict LRU (tail)
                    const lruNode = this.tail;
                    this.cacheMap.delete(lruNode.key);
                    this.removeNode(lruNode);
                }
            }
        }
    }
    // DEL operation
    del(key) {
        const node = this.cacheMap.get(key);
        if (node) {
            this.cacheMap.delete(key);
            this.removeNode(node);
        }
    }
    // Getter for all remaining keys (MRU to LRU)
    getRemainingKeys() {
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
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === '') {
        // Handle empty input case
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    // Parse C and N from the first line
    const [C_str, N_str] = input[0].split(' ');
    const capacity = parseInt(C_str);
    const N = parseInt(N_str);
    const cache = new LRUCache(capacity);
    const getResults = [];
    // Process N operations starting from the second line
    for (let i = 1; i <= N; i++) {
        const line = input[i];
        if (!line)
            continue;
        const parts = line.split(' ');
        const command = parts[0];
        const key = parts[1];
        switch (command) {
            case 'PUT':
                // PUT key value
                const value = parseInt(parts[2]);
                cache.put(key, value);
                break;
            case 'GET':
                // GET key
                const result = cache.get(key);
                getResults.push(result);
                break;
            case 'DEL':
                // DEL key
                cache.del(key);
                break;
        }
    }
    // --- Output Generation ---
    // 1. GET results line
    const outputGetResults = getResults.length > 0 ? getResults.join(' ') : "EMPTY";
    console.log(outputGetResults);
    // 2. Remaining keys line
    const remainingKeys = cache.getRemainingKeys();
    const outputRemainingKeys = remainingKeys.length > 0 ? remainingKeys.join(' ') : "EMPTY";
    console.log(outputRemainingKeys);
}
solve();
