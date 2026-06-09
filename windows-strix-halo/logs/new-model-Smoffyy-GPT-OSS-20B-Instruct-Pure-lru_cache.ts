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

class LRUCache {
    capacity: number;
    size: number = 0;
    map: Map<string, Node> = new Map();
    head: Node | null = null; // most recent
    tail: Node | null = null; // least recent

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    private moveToHead(node: Node) {
        if (this.head === node) return;
        this.removeNode(node);
        this.addNodeAtHead(node);
    }

    private addNodeAtHead(node: Node) {
        node.prev = null;
        node.next = this.head;
        if (this.head) this.head.prev = node;
        this.head = node;
        if (!this.tail) this.tail = node;
    }

    private removeNode(node: Node) {
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;

        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;

        node.prev = null;
        node.next = null;
    }

    private removeTail() {
        if (!this.tail) return;
        const node = this.tail;
        this.removeNode(node);
        this.map.delete(node.key);
        this.size--;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.moveToHead(node);
        return node.value;
    }

    put(key: string, value: number) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToHead(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNodeAtHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeTail();
            }
        }
    }

    del(key: string) {
        const node = this.map.get(key);
        if (!node) return;
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }

    getKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head;
        while (curr) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, 'utf8').trimEnd().split('\n');
if (input.length === 0) process.exit(0);

const [CStr, NStr] = input[0].trim().split(/\s+/);
const capacity = parseInt(CStr, 10);
const N = parseInt(NStr, 10);

const cache = new LRUCache(capacity);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
    const line = input[i].trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val);
    } else if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (cmd === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}

const out1 = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
const keys = cache.getKeys();
const out2 = keys.length > 0 ? keys.join(' ') : 'EMPTY';

console.log(out1);
console.log(out2);
