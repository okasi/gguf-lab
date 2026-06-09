import * as fs from 'fs';

interface LRUNode {
    key: string;
    value: number;
    prev: LRUNode | null;
    next: LRUNode | null;
}

class LRUCache {
    private capacity: number;
    private map: Map<string, LRUNode>;
    private head: LRUNode | null;
    private tail: LRUNode | null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = null;
        this.tail = null;
    }

    private addHead(node: LRUNode): void {
        if (this.head === null) {
            this.head = node;
            this.tail = node;
        } else {
            node.next = this.head;
            if (this.head) this.head.prev = node;
            this.head = node;
        }
    }

    private removeNode(node: LRUNode): void {
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
    }

    private evict(): void {
        if (this.tail && this.tail.key) {
            const key = this.tail.key;
            this.removeNode(this.tail);
            this.map.delete(key);
            this.tail = this.tail.prev;
        }
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.removeNode(node);
            this.addHead(node);
        } else {
            const newNode: LRUNode = { key, value, prev: null, next: null };
            this.map.set(key, newNode);
            this.addHead(newNode);
            if (this.map.size > this.capacity) {
                this.evict();
            }
        }
    }

    get(key: string): number | null {
        if (!this.map.has(key)) {
            return null;
        }
        const node = this.map.get(key)!;
        this.removeNode(node);
        this.addHead(node);
        return node.value;
    }

    delete(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
        }
    }
}

const content = fs.readFileSync(0, "utf8");
const lines = content.split('\n').filter(line => line.trim() !== '');

const [capacity, operations] = lines[0].split(' ').map(Number);
const cache = new LRUCache(capacity);
const putResults: number[] = [];
const getResults: number[] = [];

for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(' ');
    const command = parts[0];

    if (command === 'GET') {
        const key = parts[1];
        const value = cache.get(key) ?? -1;
        getResults.push(value);
    } else if (command === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (command === 'DEL') {
        const key = parts[1];
        cache.delete(key);
    }
}

let getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
let keys: string[] = [];
let current: LRUNode | null = cache.head;
while (current) {
    keys.push(current.key);
    current = current.next;
}
let keysOutput = keys.length > 0 ? keys.join(' ') : 'EMPTY';

console.log(getOutput);
console.log(keysOutput);
