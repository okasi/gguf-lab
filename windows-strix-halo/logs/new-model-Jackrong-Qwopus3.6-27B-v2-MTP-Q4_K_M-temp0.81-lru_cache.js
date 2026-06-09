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
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    addNodeToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addNodeToHead(node);
    }
    popTailNode() {
        const node = this.tail.prev;
        if (node === this.head)
            return null;
        this.removeNode(node);
        return node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return null;
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNodeToHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const tailNode = this.popTailNode();
                if (tailNode) {
                    this.map.delete(tailNode.key);
                    this.size--;
                }
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getAllKeys() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const input = fs_1.default.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const firstLineParts = lines[0].split(/\s+/).map(Number);
const C = firstLineParts[0];
const N = firstLineParts[1];
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = lines[i];
    if (!line)
        continue;
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
        getResults.push(val === null ? -1 : val);
    }
    else if (cmd === 'DEL') {
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
const remainingKeys = cache.getAllKeys();
if (remainingKeys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(remainingKeys.join(' '));
}
