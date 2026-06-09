"use strict";
const fs = require('fs');
class Node {
    constructor(key, value) {
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}
class LRUCache {
    constructor(capacity) {
        this.head = null;
        this.tail = null;
        this.capacity = capacity;
        this.map = new Map();
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev) {
            prev.next = next;
        }
        else {
            this.head = next;
        }
        if (next) {
            next.prev = prev;
        }
        else {
            this.tail = prev;
        }
    }
    addToFront(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }
    get(key) {
        const node = this.map.get(key);
        if (node === undefined) {
            return -1;
        }
        this.removeNode(node);
        this.addToFront(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node !== undefined) {
            node.value = value;
            this.removeNode(node);
            this.addToFront(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail;
                if (lru) {
                    this.map.delete(lru.key);
                    this.removeNode(lru);
                }
            }
            const newNode = new Node(key, value);
        }
    }
}
