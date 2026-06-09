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

class DoublyLinkedList {
    head: Node;
    tail: Node;

    constructor() {
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    addHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    remove(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
        node.prev = null;
        node.next = null;
    }

    moveToHead(node: Node): void {
        this.remove(node);
        this.addHead(node);
    }

    removeTail(): Node | null {
        if (this.tail.prev === this.head) {
            return null;
        }
        const node = this.tail.prev!;
        this.remove(node);
        return node;
    }
}

class LRUCache {
    capacity: number;
    size: number;
    map: Map<string, Node>;
    list: DoublyLinkedList;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.list = new DoublyLinkedList();
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.list.moveToHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.list.moveToHead(node);
            return;
        }
        const newNode = new Node(key, value);
        this.list.addHead(newNode);
        this.map.set(key, newNode);
        this.size++;
        if (this.size > this.capacity) {
            const tailNode = this.list.removeTail();
            if (tailNode) {
                this.map.delete(tailNode.key);
                this.size--;
            }
        }
    }

    delete(key: string): void {
        const node = this.map.get(key);
        if (!node) {
            return;
        }
        this.list.remove(node);
        this.map.delete(key);
        this.size--;
    }

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.list.head.next;
        while (current && current !== this.list.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const capacity = parseInt(firstLine[0], 10);
const numOps = parseInt(firstLine[1], 10);

const cache = new LRUCache(capacity);
const getResults: number[] = [];

for (let i = 1; i <= numOps; i++) {
    const parts = lines[i].split(' ');
    const operation = parts[0];
    const key = parts[1];
    if (operation === 'GET') {
        const value = cache.get(key);
        getResults.push(value);
    } else if (operation === 'PUT') {
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (operation === 'DEL') {
        cache.delete(key);
    }
}

if (getResults.length === 0) {
    console.log('EMPTY');
} else {
    console.log(getResults.join(' '));
}

const remainingKeys = cache.getKeysInOrder();
if (remainingKeys.length === 0) {
    console.log('EMPTY');
} else {
    console.log(remainingKeys.join(' '));
}
