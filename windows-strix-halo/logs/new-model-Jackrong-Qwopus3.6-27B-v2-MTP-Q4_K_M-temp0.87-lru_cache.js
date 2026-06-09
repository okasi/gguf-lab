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
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.map = new Map();
    }
    _addNode(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }
    _moveToFront(node) {
        this._removeNode(node);
        this._addNode(node);
    }
    _evictTail() {
        const node = this.tail.prev;
        if (node && node !== this.head) {
            this._removeNode(node);
            this.map.delete(node.key);
            this.size--;
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this._moveToFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this._moveToFront(node);
        }
        else {
            if (this.size === this.capacity) {
                this._evictTail();
            }
            const node = new Node(key, value);
            this._addNode(node);
            this.map.set(key, node);
            this.size++;
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this._removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getRemainingKeys() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, 'utf8');
const lines = input.trim().split('\n');
const firstLine = lines[0].trim().split(/\s+/);
const C = parseInt(firstLine[0], 10);
const N = parseInt(firstLine[1], 10);
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val);
    }
    else if (cmd === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}
const getLine = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
const keysLine = cache.getRemainingKeys().length > 0 ? cache.getRemainingKeys().join(' ') : 'EMPTY';
console.log(getLine);
console.log(keysLine);
