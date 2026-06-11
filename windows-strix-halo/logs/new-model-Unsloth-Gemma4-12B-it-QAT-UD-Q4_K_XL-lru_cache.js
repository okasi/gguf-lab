"use strict";
const fs = require('fs');
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        // Dummy head and tail for doubly linked list
        // Head is most recent, Tail is least recent
        const head = { key: null, value: null, prev: null, next: null };
        const tail = { key: null, value: null, prev: null, next: null };
        head.next = tail;
        tail.prev = head;
        this.head = head;
        this.tail = tail;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    addToHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.remove(node);
            this.addToHead(node);
        }
        else {
            if (this.map.size === this.capacity) {
                const lru = this.tail.prev;
                this.remove(lru);
                this.map.delete(lru.key);
            }
            const newNode = { key, value, prev: null, next: null };
            this.map.set(key, newNode);
            this.addToHead(newNode);
        }
    }
    get(key) {
        if (!this.map.has(key))
            return -1;
        const node = this.map.get(key);
        this.remove(node);
        this.addToHead(node);
        return node.value;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.remove(node);
            this.map.delete(key);
        }
    }
    getFinalOrder() {
        const result = [];
        let current = this.head.next;
        while (current !== this.tail) {
            result.push(current.key);
            current = current.next;
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
    if (getResults.length === 0) {
        process.stdout.write("EMPTY\n");
    }
    else {
        process.stdout.write(getResults.join(" ") + "\n");
    }
    const finalKeys = cache.getFinalOrder();
    if (finalKeys.length === 0) {
        process.stdout.write("EMPTY\n");
    }
    else {
        process.stdout.write(finalKeys.join(" ") + "\n");
    }
}
solve();
