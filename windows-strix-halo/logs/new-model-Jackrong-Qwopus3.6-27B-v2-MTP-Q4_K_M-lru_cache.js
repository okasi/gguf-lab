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
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0].split(/\s+/).map(Number);
    const C = firstLine[0];
    const N = firstLine[1];
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val);
        }
        else if (op === 'DEL') {
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
    const remainingKeys = cache.getKeysMRUtoLRU();
    if (remainingKeys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(remainingKeys.join(' '));
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
class DoublyLinkedList {
    constructor() {
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    add(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }
    moveToFront(node) {
        this.remove(node);
        this.add(node);
    }
    removeTail() {
        const lru = this.tail.prev;
        this.remove(lru);
        return lru;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.list = new DoublyLinkedList();
        this.size = 0;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.list.moveToFront(node);
        }
        else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.list.add(node);
            this.size++;
            if (this.size > this.capacity) {
                const lru = this.list.removeTail();
                this.map.delete(lru.key);
                this.size--;
            }
        }
    }
    get(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.list.moveToFront(node);
            return node.value;
        }
        else {
            return -1;
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.list.remove(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysMRUtoLRU() {
        const keys = [];
        let cur = this.list.head.next;
        while (cur !== this.list.tail) {
            keys.push(cur.key);
            cur = cur.next;
        }
        return keys;
    }
}
main();
