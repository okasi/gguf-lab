import fs = require('fs');

interface Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;
}

class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node | null;
    private tail: Node | null;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = null;
        this.tail = null;
        this.size = 0;
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
    }

    private addHead(node: Node): void {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        } else {
            this.tail = node;
        }
        this.head = node;
    }

    private moveToFront(node: Node): void {
        this.removeNode(node);
        this.addHead(node);
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToFront(node);
        } else {
            const node: Node = { key, value, prev: null, next: null };
            this.map.set(key, node);
            this.addHead(node);
            this.size++;
            if (this.size > this.capacity) {
                const tailNode = this.tail!;
                this.removeNode(tailNode);
                this.map.delete(tailNode.key);
                this.size--;
            }
        }
    }

    get(key: string): number | null {
        if (!this.map.has(key)) {
            return null;
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

    getKeysOrdered(): string[] {
        const keys: string[] = [];
        let current: Node | null = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) {
        console.log('EMPTY');
        console.log('EMPTY');
        return;
    }
    const lines = input.split('\n');
    const firstLine = lines[0].split(/\s+/);
    const C: number = parseInt(firstLine[0], 10);
    const N: number = parseInt(firstLine[1], 10);

    const lru = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (!line) continue;
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            lru.put(key, value);
        } else if (op === 'GET') {
            const key = parts[1];
            const res = lru.get(key);
            if (res === null) {
                getResults.push(-1);
            } else {
                getResults.push(res);
            }
        } else if (op === 'DEL') {
            const key = parts[1];
            lru.del(key);
        }
    }

    if (getResults.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResults.join(' '));
    }

    const keys = lru.getKeysOrdered();
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();
