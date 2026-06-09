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
    capacity: number;
    map: Map<string, Node>;
    head: Node;
    tail: Node;
    size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private removeNode(node: Node): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addNodeToHead(node: Node): void {
        const next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        next.prev = node;
    }

    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addNodeToHead(node);
    }

    private evictLRU(): void {
        const node = this.tail.prev!;
        this.removeNode(node);
        this.map.delete(node.key);
        this.size--;
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveToHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addNodeToHead(node);
            this.size++;
            if (this.size > this.capacity) {
                this.evictLRU();
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

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    if (lines.length === 0) return;
    const firstLine = lines[0].trim().split(/\s+/).map(Number);
    const C = firstLine[0];
    const N = firstLine[1];

    const lru = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        switch (cmd) {
            case 'PUT':
                const key = parts[1];
                const value = parseInt(parts[2], 10);
                lru.put(key, value);
                break;
            case 'GET':
                const getKey = parts[1];
                const result = lru.get(getKey);
                getResults.push(result);
                break;
            case 'DEL':
                const delKey = parts[1];
                lru.del(delKey);
                break;
        }
    }

    console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
    const keys = lru.getKeysInOrder();
    console.log(keys.length > 0 ? keys.join(' ') : 'EMPTY');
}

main();
