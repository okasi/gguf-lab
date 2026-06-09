"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
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
    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    removeTail() {
        const node = this.tail.prev;
        this.removeNode(node);
        this.map.delete(node.key);
        this.size--;
        return node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.removeNode(node);
        this.addToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.removeNode(node);
            this.addToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.addToHead(newNode);
            this.map.set(key, newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeTail();
            }
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
    getKeys() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const input = fs_1.default.readFileSync(0, 'utf8');
const lines = input.trim().split('\n');
const [C, N] = lines[0].split(' ').map(Number);
const lru = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    const op = parts[0];
    if (op === 'GET') {
        const key = parts[1];
        const result = lru.get(key);
        getResults.push(result);
    }
    else if (op === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2]);
        lru.put(key, value);
    }
    else if (op === 'DEL') {
        const key = parts[1];
        lru.delete(key);
    }
}
console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
console.log(lru.getKeys().length > 0 ? lru.getKeys().join(' ') : 'EMPTY');
