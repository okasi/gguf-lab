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
        this.head = null;
        this.tail = null;
    }
    addToFront(node) {
        node.prev = null;
        node.next = this.head;
        if (this.head !== null) {
            this.head.prev = node;
        }
        this.head = node;
        if (this.tail === null) {
            this.tail = node;
        }
        this.size++;
    }
    removeNode(node) {
        if (node.prev !== null) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next !== null) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
        this.size--;
    }
    moveToFront(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.addToFront(node);
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        this.moveToFront(key);
        return this.map.get(key).value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(key);
        }
        else {
            if (this.size === this.capacity) {
                const tailNode = this.tail;
                this.map.delete(tailNode.key);
                this.removeNode(tailNode);
            }
            const newNode = new Node(key, value);
            this.addToFront(newNode);
            this.map.set(key, newNode);
        }
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
        let current = this.head;
        while (current !== null) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
