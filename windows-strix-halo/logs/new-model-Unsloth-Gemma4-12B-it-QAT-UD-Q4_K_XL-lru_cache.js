"use strict";
const fs = require('fs');
/**
 * LRUCache implementation using a Map to store values/nodes
 * and a Doubly Linked List to maintain the order of usage.
 * This ensures O(1) time complexity for all operations.
 */
class DLLNode {
    constructor(key, value) {
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}
class LRUCache {
    constructor(capacity) {
        this.head = null; // Most Recently Used
        this.tail = null; // Least Recently Used
        this.capacity = capacity;
        this.map = new Map();
    }
    removeNode(node) {
        if (node.prev)
            node.prev.next = node.next;
        if (node.next)
            node.next.prev = node.prev;
        if (node === this.head)
            this.head = node.next;
        if (node === this.tail)
            this.tail = node.prev;
        node.prev = null;
        node.next = null;
    }
    setHead(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head)
            this.head.prev = node;
        this.head = node;
        if (!this.tail)
            this.tail = node;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.removeNode(node);
            this.setHead(node);
        }
        else {
            if (this.map.size === this.capacity) {
                if (this.tail) {
                    this.map.delete(this.tail.key);
                    this.removeNode(this.tail);
                }
            }
            const newNode = new DLLNode(key, value);
            this.map.set(key, newNode);
            this.setHead(newNode);
        }
    }
    get(key) {
        if (!this.map.has(key))
            return -1;
        const node = this.map.get(key);
        this.removeNode(node);
        this.setHead(node);
        return node.value;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getOrder() {
        const result = [];
        let curr = this.head;
        while (curr) {
            result.push(curr.key);
            curr = curr.next;
        }
        return result;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length === 0)
        return;
    let ptr = 0;
    const C = parseInt(input[ptr++]);
    const N = parseInt(input[ptr++]);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        const op = input[ptr++];
        if (op === "PUT") {
            const key = input[ptr++];
            const val = parseInt(input[ptr++]);
            cache.put(key, val);
        }
        else if (op === "GET") {
            const key = input[ptr++];
            getResults.push(cache.get(key));
        }
        else if (op === "DEL") {
            const key = input[ptr++];
            cache.del(key);
        }
    }
    process.stdout.write(getResults.length === 0 ? "EMPTY\n" : getResults.join(" ") + "\n");
    const order = cache.getOrder();
    process.stdout.write(order.length === 0 ? "EMPTY\n" : order.join(" ") + "\n");
}
solve();
