"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
    }
    addHead(node) {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        else {
            this.tail = node;
        }
        this.head = node;
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addHead(node);
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(node);
        }
        else {
            const node = { key, value, prev: null, next: null };
            this.map.set(key, node);
            this.addHead(node);
            this.size++;
            if (this.size > this.capacity) {
                const tailNode = this.tail;
                this.removeNode(tailNode);
                this.map.delete(tailNode.key);
                this.size--;
            }
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return null;
        }
        const node = this.map.get(key);
        this.moveToFront(node);
        return node.value;
    }
    del(key) {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key);
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }
    getKeysOrdered() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) {
        console.log('EMPTY');
        console.log('EMPTY');
        return;
    }
    const lines = input.split('\n');
    const firstLine = lines[0].split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const lru = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            lru.put(key, value);
        }
        else if (op === 'GET') {
            const key = parts[1];
            const res = lru.get(key);
            if (res === null) {
                getResults.push(-1);
            }
            else {
                getResults.push(res);
            }
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
    const keys = lru.getKeysOrdered();
    if (keys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(keys.join(' '));
    }
}
main();
