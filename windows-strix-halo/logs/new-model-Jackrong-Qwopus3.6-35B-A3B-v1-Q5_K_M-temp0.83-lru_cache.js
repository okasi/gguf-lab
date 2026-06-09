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
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.size = 0;
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    removeFromNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev)
            prev.next = next;
        if (next)
            next.prev = prev;
        node.prev = null;
        node.next = null;
    }
    addNodeToFront(node) {
        const next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        if (next)
            next.prev = node;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.removeFromNode(node);
            this.addNodeToFront(node);
        }
        else {
            if (this.size === this.capacity) {
                const lru = this.tail.prev;
                if (lru && lru !== this.head) {
                    this.map.delete(lru.key);
                    this.removeFromNode(lru);
                    this.size--;
                }
            }
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addNodeToFront(node);
            this.size++;
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.removeFromNode(node);
        this.addNodeToFront(node);
        return node.value;
    }
    delete(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeFromNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeys() {
        const keys = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const capacity = parseInt(firstLine[0], 10);
const n = parseInt(firstLine[1], 10);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= n; i++) {
    const line = lines[i].trim();
    const parts = line.split(' ');
    const operation = parts[0];
    const key = parts[1];
    switch (operation) {
        case 'PUT':
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
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
console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
const remainingKeys = cache.getKeys();
console.log(remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY');
