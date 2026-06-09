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
    private head: Node;
    private tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private removeNode(node: Node): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addFront(node: Node): void {
        const next = this.head.next!;
        node.next = next;
        node.prev = this.head;
        this.head.next = node;
        next.prev = node;
    }

    private moveToFront(node: Node): void {
        this.removeNode(node);
        this.addFront(node);
    }

    get(key: string): number {
        if (!this.map.has(key)) return -1;
        const node = this.map.get(key)!;
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToFront(node);
        } else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addFront(node);
            this.size++;
            if (this.size > this.capacity) {
                const lru = this.tail.prev!;
                this.removeNode(lru);
                this.map.delete(lru.key);
                this.size--;
            }
        }
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysMRUtoLRU(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr!.key);
            curr = curr!.next;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split(/\r?\n/);
const [C, N] = lines[0].split(/\s+/).map(Number);

const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const op = parts[0];
    const key = parts[1];
    if (op === 'PUT') {
        cache.put(key, Number(parts[2]));
    } else if (op === 'GET') {
        getResults.push(cache.get(key));
    } else if (op === 'DEL') {
        cache.del(key);
    }
}

console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
const remainingKeys = cache.getKeysMRUtoLRU();
console.log(remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY');
