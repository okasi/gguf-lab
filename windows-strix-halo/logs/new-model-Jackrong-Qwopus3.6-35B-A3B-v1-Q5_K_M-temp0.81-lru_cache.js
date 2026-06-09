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
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        // Dummy head and tail for easier manipulation
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addToFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addToFront(node);
    }
    removeTail() {
        if (this.tail.prev && this.tail.prev !== this.head) {
            const node = this.tail.prev;
            this.removeNode(node);
            return node;
        }
        return null;
    }
    get(key) {
        const node = this.map.get(key);
        if (node) {
            this.moveToFront(node);
            return node.value;
        }
        return -1;
    }
    put(key, value) {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
        }
        else {
            if (this.size === this.capacity) {
                const tailNode = this.removeTail();
                if (tailNode) {
                    this.map.delete(tailNode.key);
                    this.size--;
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            this.size++;
        }
    }
    delete(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysInOrder() {
        const keys = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n').filter(line => line.length > 0);
const firstLine = lines[0].split(' ');
const capacity = parseInt(firstLine[0]);
const numOperations = parseInt(firstLine[1]);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= numOperations; i++) {
    const line = lines[i];
    const parts = line.split(' ');
    const operation = parts[0];
    const key = parts[1];
    const value = parts[2] ? parseInt(parts[2]) : 0;
    switch (operation) {
        case 'PUT':
            cache.put(key, value);
            break;
        case 'GET':
            getResults.push(cache.get(key));
            break;
        case 'DEL':
            cache.delete(key);
            break;
    }
}
if (getResults.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(getResults.join(' '));
}
const keys = cache.getKeysInOrder();
if (keys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(keys.join(' '));
}
