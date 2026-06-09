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

    private remove(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private addFront(node: Node): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    get(key: string): number | null {
        if (!this.map.has(key)) {
            return null;
        }
        const node = this.map.get(key)!;
        this.remove(node);
        this.addFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.remove(node);
            this.addFront(node);
        } else {
            if (this.size === this.capacity) {
                const toEvict = this.tail.prev!;
                this.remove(toEvict);
                this.map.delete(toEvict.key);
                this.size--;
            }
            const newNode = new Node(key, value);
            this.addFront(newNode);
            this.map.set(key, newNode);
            this.size++;
        }
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.remove(node);
            this.map.delete(key);
            this.size--;
        }
    }

    keysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next!;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (input === '') return;
    const lines = input.split('\n');
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N && i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (op === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            if (result === null) {
                getResults.push(-1);
            } else {
                getResults.push(result);
            }
        } else if (op === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        process.stdout.write('EMPTY\n');
    } else {
        process.stdout.write(getResults.join(' ') + '\n');
    }

    const remainingKeys = cache.keysInOrder();
    if (remainingKeys.length === 0) {
        process.stdout.write('EMPTY\n');
    } else {
        process.stdout.write(remainingKeys.join(' ') + '\n');
    }
}

main();
