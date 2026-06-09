"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new DNode(null, null);
        this.tail = new DNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    insertAtHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
        node.prev = null;
        node.next = null;
    }
    moveToFront(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.insertAtHead(node);
        }
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(key);
        }
        else {
            if (this.map.size >= this.capacity) {
                const tailNode = this.tail.prev;
                if (tailNode) {
                    this.removeNode(tailNode);
                    this.map.delete(tailNode.key);
                }
            }
            const newNode = new DNode(key, value);
            this.insertAtHead(newNode);
            this.map.set(key, newNode);
        }
    }
    get(key) {
        if (this.map.has(key)) {
            this.moveToFront(key);
            return this.map.get(key).value;
        }
        return null;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getKeysInOrder() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
class DNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
const input = (0, fs_1.readFileSync)(0, 'utf8').trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const C = parseInt(firstLine[0], 10);
const N = parseInt(firstLine[1], 10);
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const parts = lines[i].split(' ');
    const op = parts[0];
    if (op === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (op === 'GET') {
        const key = parts[1];
        const result = cache.get(key);
        if (result !== null) {
            getResults.push(result);
        }
        else {
            getResults.push(-1);
        }
    }
    else if (op === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}
let output = '';
if (getResults.length > 0) {
    output += getResults.join(' ');
}
else {
    output += 'EMPTY';
}
output += '\n';
const keys = cache.getKeysInOrder();
if (keys.length > 0) {
    output += keys.join(' ');
}
else {
    output += 'EMPTY';
}
console.log(output);
