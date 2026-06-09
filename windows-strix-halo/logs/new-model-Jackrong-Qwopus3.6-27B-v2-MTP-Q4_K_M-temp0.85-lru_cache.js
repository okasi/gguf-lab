"use strict";
const fs = require('fs');
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
    moveToFront(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    insertFront(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    get(key) {
        if (!this.map.has(key))
            return -1;
        const node = this.map.get(key);
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(node);
            return;
        }
        if (this.size === this.capacity) {
            const lru = this.tail.prev;
            this.remove(lru);
            this.map.delete(lru.key);
            this.size--;
        }
        const newNode = new Node(key, value);
        this.insertFront(newNode);
        this.map.set(key, newNode);
        this.size++;
    }
    delete(key) {
        if (!this.map.has(key))
            return;
        const node = this.map.get(key);
        this.remove(node);
        this.map.delete(key);
        this.size--;
    }
    getKeys() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const firstLine = lines[0].split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'GET') {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val);
        }
        else if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (cmd === 'DEL') {
            const key = parts[1];
            cache.delete(key);
        }
    }
    let firstOutput;
    if (getResults.length === 0) {
        firstOutput = 'EMPTY';
    }
    else {
        firstOutput = getResults.join(' ');
    }
    const keys = cache.getKeys();
    let secondOutput;
    if (keys.length === 0) {
        secondOutput = 'EMPTY';
    }
    else {
        secondOutput = keys.join(' ');
    }
    console.log(firstOutput);
    console.log(secondOutput);
}
main();
