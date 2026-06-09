"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const input = (0, fs_1.readFileSync)(0, "utf8").trimEnd();
const lines = input.split("\n");
const [C, N] = lines[0].split(" ").map(Number);
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.list = new DoublyLinkedList();
    }
    put(key, value) {
        if (this.map.has(key)) {
            const existing = this.map.get(key);
            existing.value = value;
            this.list.moveToFront(existing.node);
        }
        else {
            if (this.map.size >= this.capacity) {
                const lru = this.list.removeLast();
                this.map.delete(lru.key);
            }
            const node = new DoublyLinkedListNode(key);
            this.list.addToFront(node);
            this.map.set(key, { value, node });
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const entry = this.map.get(key);
        this.list.moveToFront(entry.node);
        return entry.value;
    }
    del(key) {
        if (this.map.has(key)) {
            const entry = this.map.get(key);
            this.list.remove(entry.node);
            this.map.delete(key);
        }
    }
    getKeysMRUtoLRU() {
        const keys = [];
        let curr = this.list.head.next;
        while (curr !== this.list.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
class DoublyLinkedListNode {
    constructor(key) {
        this.prev = null;
        this.next = null;
        this.key = key;
    }
}
class DoublyLinkedList {
    constructor() {
        this.head = new DoublyLinkedListNode("");
        this.tail = new DoublyLinkedListNode("");
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addToFront(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    removeLast() {
        const node = this.tail.prev;
        this.remove(node);
        return node;
    }
    moveToFront(node) {
        if (node === this.head.next)
            return;
        this.remove(node);
        this.addToFront(node);
    }
}
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const parts = lines[i].split(" ");
    const op = parts[0];
    const key = parts[1];
    if (op === "PUT") {
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (op === "GET") {
        const val = cache.get(key);
        getResults.push(val);
    }
    else if (op === "DEL") {
        cache.del(key);
    }
}
const firstLine = getResults.length === 0 ? "EMPTY" : getResults.join(" ");
const remainingKeys = cache.getKeysMRUtoLRU();
const secondLine = remainingKeys.length === 0 ? "EMPTY" : remainingKeys.join(" ");
console.log(firstLine);
console.log(secondLine);
