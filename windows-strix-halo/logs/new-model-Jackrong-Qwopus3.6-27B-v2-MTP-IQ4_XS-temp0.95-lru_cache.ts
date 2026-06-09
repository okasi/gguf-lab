import * as fs from 'fs';

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

class DoublyLinkedList {
    head: Node;
    tail: Node;
    size: number = 0;

    constructor() {
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    addFront(node: Node): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next?.prev = node;
        this.head.next = node;
        this.size++;
    }

    remove(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        if (prev) prev.next = next;
        if (next) next.prev = prev;
        this.size--;
    }

    moveToFront(node: Node): void {
        this.remove(node);
        this.addFront(node);
    }

    removeLRU(): Node | null {
        if (this.size === 0) return null;
        // node before tail
        const node = this.tail.prev;
        if (node === this.head) return null; // should not happen if size>0
        this.remove(node);
        return node;
    }

    // optional: get all keys in order from front to back
    getAllKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

class LRUCache {
    capacity: number;
    map: Map<string, Node> = new Map();
    list: DoublyLinkedList;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.list = new DoublyLinkedList();
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.list.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        let node = this.map.get(key);
        if (node) {
            node.value = value;
            this.list.moveToFront(node);
        } else {
            node = new Node(key, value);
            this.map.set(key, node);
            this.list.addFront(node);
            if (this.list.size > this.capacity) {
                // evict LRU
                const lruNode = this.list.removeLRU();
                if (lruNode) {
                    this.map.delete(lruNode.key);
                }
            }
        }
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.list.remove(node);
            this.map.delete(key);
        }
    }

    getKeysMRUtoLRU(): string[] {
        return this.list.getAllKeys();
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    if (lines.length === 0) return;
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // skip empty lines
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (op === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        } else if (op === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }

    // Output first line
    if (getResults.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResults.join(' '));
    }

    // Output second line
    const remainingKeys = cache.getKeysMRUtoLRU();
    if (remainingKeys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(remainingKeys.join(' '));
    }
}

main();
