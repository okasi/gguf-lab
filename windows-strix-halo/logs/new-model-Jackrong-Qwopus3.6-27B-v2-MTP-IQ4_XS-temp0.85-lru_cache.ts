import * as fs from 'fs';

class Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;

    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class LRUCache {
    private capacity: number;
    private size: number;
    private map: Map<string, Node>;
    private head: Node | null;
    private tail: Node | null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = null;
        this.tail = null;
    }

    private removeNode(node: Node): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }

    private addNodeToHead(node: Node): void {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }

    moveToFront(node: Node): void {
        this.removeNode(node);
        this.addNodeToHead(node);
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToFront(node);
            return;
        }
        const newNode = new Node(key, value);
        this.map.set(key, newNode);
        this.addNodeToHead(newNode);
        this.size++;
        if (this.size > this.capacity) {
            const evictNode = this.tail!;
            this.removeNode(evictNode);
            this.map.delete(evictNode.key);
            this.size--;
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveToFront(node);
        return node.value;
    }

    del(key: string): void {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key)!;
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }

    getAllKeys(): string[] {
        const keys: string[] = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
