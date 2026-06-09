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
        this.cache = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    insertAtHead(node) {
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
        this.insertAtHead(node);
    }
    removeTail() {
        const node = this.tail.prev;
        if (node === this.head)
            return null;
        this.removeNode(node);
        return node;
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node)
            return null;
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        const node = this.cache.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
            return;
        }
        if (this.size >= this.capacity) {
            const removed = this.removeTail();
            if (removed) {
                this.cache.delete(removed.key);
            }
        }
        const newNode = new Node(key, value);
        this.insertAtHead(newNode);
        this.cache.set(key, newNode);
        this.size++;
    }
    del(key) {
        const node = this.cache.get(key);
        if (!node)
            return;
        this.removeNode(node);
        this.cache.delete(key);
        this.size--;
    }
    getKeysFromMostRecentToLeast() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const [C, N] = lines[0].split(' ').map(Number);
const lru = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = lines[i];
    if (!line)
        continue;
    const parts = line.split(' ');
    const op = parts[0];
    if (op === 'PUT') {
        const key = parts[1];
        const value = Number(parts[2]);
        lru.put(key, value);
    }
    else if (op === 'GET') {
        const key = parts[1];
        const res = lru.get(key);
        getResults.push(res !== null ? res : -1);
    }
    else if (op === 'DEL') {
        const key = parts[1];
        lru.del(key);
    }
}
if (getResults.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(getResults.join(' '));
}
const keys = lru.getKeysFromMostRecentToLeast();
if (keys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(keys.join(' '));
}
