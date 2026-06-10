"use strict";
const fs = require('fs');
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = null;
        this.tail = null;
    }
    set(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToHead(node);
            return;
        }
        const newNode = new Node(key, value);
        this.map.set(key, newNode);
        this.addToHead(newNode);
        if (this.map.size > this.capacity) {
            this.removeTail();
        }
    }
    get(key) {
        if (!this.map.has(key))
            return -1;
        const node = this.map.get(key);
        this.moveToHead(node);
        return node.value;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    addToHead(node) {
        if (!this.head) {
            this.head = node;
            this.tail = node;
        }
        else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
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
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    removeTail() {
        if (!this.tail)
            return;
        const toDelete = this.tail;
        this.removeNode(toDelete);
        this.map.delete(toDelete.key);
        if (this.tail)
            this.tail = this.tail.prev;
        else {
            this.head = null;
            this.tail = null;
        }
    }
}
const fs = require('fs');
const data = fs.readFileSync(0, 'utf8');
const lines = data.trim().split('\n');
if (lines.length < 1) {
    console.log('EMPTY');
    console.log('EMPTY');
    process.exit(0);
}
const C = Number(lines[0].trim());
const N = Number(lines[1].trim());
const cache = new LRUCache(C);
let getResults = [];
for (let i = 2; i < lines.length; ++i) {
    const line = lines[i].trim();
    if (!line)
        continue;
    const parts = line.split(' ');
    if (parts[0] === 'PUT') {
        const key = parts[1];
        const value = Number(parts.slice(2).join(''));
        cache.set(key, value);
    }
    else if (parts[0] === 'GET') {
        const result = cache.get(parts[1]);
        getResults.push(result.toString());
    }
    else if (parts[0] === 'DEL') {
        cache.del(parts[1]);
    }
}
if (getResults.length > 0)
    console.log(getResults.join(' '));
else
    console.log('EMPTY');
const remainingKeys = [];
if (cache.head) {
    let curr = cache.head;
    while (curr) {
        remainingKeys.push(curr.key);
        curr = curr.next;
    }
}
if (remainingKeys.length > 0)
    console.log(remainingKeys.join(' '));
else
    console.log('EMPTY');
