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
        this.map = new Map();
        // Sentinel nodes
        this.head = new Node(null, null);
        this.tail = new Node(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    moveToHead(node) {
        // Remove node from its current position
        this.removeFromList(node);
        // Insert at head
        this.insertBefore(this.head, node);
    }
    removeFromList(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        // optional: detach node
        node.prev = null;
        node.next = null;
    }
    insertBefore(target, node) {
        // Insert node before target
        const prev = target.prev;
        prev.next = node;
        node.prev = prev;
        node.next = target;
        target.prev = node;
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        // Move to head (most recent)
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            // Update existing
            const node = this.map.get(key);
            node.value = value;
            this.moveToHead(node);
            return;
        }
        // Insert new
        const newNode = new Node(key, value);
        this.insertBefore(this.head, newNode);
        this.map.set(key, newNode);
        this.size++;
        // Evict if over capacity
        if (this.size > this.capacity) {
            const lru = this.tail.prev;
            this.removeFromList(lru);
            this.map.delete(lru.key);
            this.size--;
        }
    }
    del(key) {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key);
        this.removeFromList(node);
        this.map.delete(key);
        this.size--;
    }
    getKeysMRUtoLRU() {
        const result = [];
        let current = this.head.next;
        while (current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length < 1)
        return;
    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/);
    const C = parseInt(parts[0], 10);
    const N = parseInt(parts[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const tokens = line.split(/\s+/);
        const command = tokens[0];
        if (command === 'PUT') {
            const key = tokens[1];
            const value = parseInt(tokens[2], 10);
            cache.put(key, value);
        }
        else if (command === 'GET') {
            const key = tokens[1];
            const val = cache.get(key);
            getResults.push(val);
        }
        else if (command === 'DEL') {
            const key = tokens[1];
            cache.del(key);
        }
    }
    // Output first line
    if (getResults.length === 0) {
        process.stdout.write('EMPTY\n');
    }
    else {
        process.stdout.write(getResults.join(' ') + '\n');
    }
    // Output second line
    const keys = cache.getKeysMRUtoLRU();
    if (keys.length === 0) {
        process.stdout.write('EMPTY\n');
    }
    else {
        process.stdout.write(keys.join(' ') + '\n');
    }
}
main();
