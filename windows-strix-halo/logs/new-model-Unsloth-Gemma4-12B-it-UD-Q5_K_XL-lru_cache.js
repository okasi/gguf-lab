"use strict";
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
        this.head = null;
        this.tail = null;
    }
    removeNode(node) {
        if (node.prev)
            node.prev.next = node.next;
        else
            this.head = node.next;
        if (node.next)
            node.next.prev = node.prev;
        else
            this.tail = node.prev;
    }
    addToHead(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head)
            this.head.prev = node;
        this.head = node;
        if (!this.tail)
            this.tail = node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.removeNode(node);
        this.addToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.removeNode(node);
            this.addToHead(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                if (this.tail) {
                    this.map.delete(this.tail.key);
                    this.removeNode(this.tail);
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getKeys() {
        const keys = [];
        let curr = this.head;
        while (curr) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
