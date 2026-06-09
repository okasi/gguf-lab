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
        this.map = new Map();
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.capacity = capacity;
    }
    /**
     * Removes a node from its current position in the list.
     * O(1) since we have direct pointers.
     */
    _remove(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev) {
            prev.next = next;
        }
        else {
            this.head = next;
        }
        if (next) {
            next.prev = prev;
        }
        else {
            this.tail = prev;
        }
        this.map.delete(node.key);
        this.size--;
    }
    /**
     * Moves a node to the front (MRU position).
     * O(1).
     */
    _moveToFront(node) {
        // If already head, do nothing
        if (this.head === node)
            return;
        // Detach node
        this._remove(node);
        // Attach to front
        node.prev = null;
        node.next = this.head;
        this.head = node;
        if (this.tail === node) {
            this.tail = node;
        }
        // If head was tail, it's now both
        if (this.head === this.tail) {
            this.head = node;
            this.tail = node;
        }
    }
    /**
     * Evicts the Least Recently Used item.
     * O(1) because tail is directly accessible.
     */
    evict() {
        const lru = this.tail;
        if (lru) {
            this._remove(lru);
        }
    }
    /**
     * Gets a value from the cache, updating its position to MRU.
     * O(1) amortized.
     */
    get(key) {
        const node = this.map.get(key);
        return node ? node.value : -1;
    }
    /**
     * Puts or updates a key-value pair.
     * O(1) amortized.
     */
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            // Update
            node.value = value;
            this._moveToFront(node);
        }
        else {
            // New item
            if (this.size >= this.capacity) {
                this.evict();
            }
            const newNode = {
                key,
                value,
                prev: null,
                next: this.head,
            };
            this.map.set(key, newNode);
            this.size++;
            // Insert at front
            if (this.head) {
                this.head.prev = newNode;
            }
            this.head = newNode;
            if (!this.tail)
                this.tail = newNode;
        }
    }
    /**
     * Deletes the key if present.
     * O(1).
     */
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this._remove(node);
        }
    }
    /**
     * Returns keys ordered from MRU (head) to LRU (tail).
     * O(C) where C is capacity, acceptable since C <= 200000.
     */
    getKeys() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
    get size() {
        return this.size;
    }
}
function solve(input) {
    const lines = input.trim().split('\n');
    if (lines.length === 0)
        return;
    // First line C N
    const [C_str, N_str] = lines[0].split(' ');
    const CAPACITY = parseInt(C_str);
    const OPERATIONS = parseInt(N_str);
    const cache = new LRUCache(CAPACITY);
    const getResults = [];
    const keys = new Set();
    for (let i = 1; i <= OPERATIONS; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const command = parts[0].toUpperCase();
        const key = parts[1];
        switch (command) {
            case 'PUT':
                // Value can be negative, so we parse as signed 32-bit
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;
            case 'GET':
                const result = cache.get(key);
                getResults.push(result);
                keys.add(key);
                break;
            case 'DEL':
                cache.del(key);
                break;
            default:
            // Ignore unknown commands
        }
    }
    // Output GET results
    console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
    // Output remaining keys (MRU first)
    const remainingKeys = Array.from(cache.map.keys()).join(' ');
    console.log(remainingKeys || 'EMPTY');
}
try {
    const input = fs.readFileSync(0, "utf8");
    solve(input);
}
catch (e) {
    // Handle file read errors if stdin is not piped
    console.error("Error reading input:", e);
}
// End of file
