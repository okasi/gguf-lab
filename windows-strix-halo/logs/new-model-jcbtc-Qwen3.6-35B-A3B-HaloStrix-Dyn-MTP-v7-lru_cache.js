"use strict";
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = { key: '', value: 0, prev: null, next: null };
        this.tail = { key: '', value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    removeTail() {
        const node = this.tail.prev;
        this.removeNode(node);
        return node;
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
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.removeNode(existing);
            this.addToHead(existing);
            return;
        }
        if (this.size >= this.capacity) {
            const lru = this.removeTail();
            this.map.delete(lru.key);
            this.size--;
        }
        const newNode = { key, value, prev: null, next: null };
        this.addToHead(newNew);
        this.map.set(key, newNode);
        this.size++;
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysMRUtoLRU() {
        const keys = [];
        let curr = this.head.next;
        while (curr && curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
