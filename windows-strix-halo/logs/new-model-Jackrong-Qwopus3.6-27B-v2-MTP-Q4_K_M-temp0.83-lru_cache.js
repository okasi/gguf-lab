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
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const firstLine = lines[0].trim().split(/\s+/);
const C = parseInt(firstLine[0], 10);
const N = parseInt(firstLine[1], 10);
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
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addFront(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addFront(node);
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(node);
        }
        else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addFront(node);
            this.size++;
            if (this.size > this.capacity) {
                const evictNode = this.tail.prev;
                this.removeNode(evictNode);
                this.map.delete(evictNode.key);
                this.size--;
            }
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysMostRecentToLeast() {
        const keys = [];
        let cur = this.head.next;
        while (cur !== this.tail) {
            keys.push(cur.key);
            cur = cur.next;
        }
        return keys;
    }
}
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = lines[i]?.trim();
    if (!line)
        continue;
    const parts = line.split(/\s+/);
    const command = parts[0];
    if (command === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (command === 'GET') {
        const key = parts[1];
        const result = cache.get(key);
        getResults.push(result);
    }
    else if (command === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}
if (getResults.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(getResults.join(' '));
}
const keys = cache.getKeysMostRecentToLeast();
if (keys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(keys.join(' '));
}
