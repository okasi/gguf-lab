const fs = require('fs');

class Node {
    key: string;
    value: number;
    prev: Node | null = null;
    next: Node | null = null;

    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node | null = null;
    private tail: Node | null = null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
    }

    private removeNode(node: Node) {
        const prev = node.prev;
        const next = node.next;

        if (prev) {
            prev.next = next;
        } else {
            this.head = next;
        }

        if (next) {
            next.prev = prev;
        } else {
            this.tail = prev;
        }
    }

    private addToFront(node: Node) {
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

    get(key: string): number {
        const node = this.map.get(key);
        if (node === undefined) {
            return -1;
        }

        this.removeNode(node);
        this.addToFront(node);
        return node.value;
    }

    put(key: string, value: number) {
        const node = this.map.get(key);

        if (node !== undefined) {
            node.value = value;
            this.removeNode(node);
            this.addToFront(node);
        } else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail;
                if (lru) {
                    this.map.delete(lru.key);
                    this.removeNode(lru);
                }
            }

            const newNode = new Node(key, value);
