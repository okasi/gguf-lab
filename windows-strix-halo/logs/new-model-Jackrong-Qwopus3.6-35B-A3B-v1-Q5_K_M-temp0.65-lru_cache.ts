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
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.size = 0;

        // Dummy nodes for easier list operations
        this.head = new Node('', 0);
        this.tail = new Node('', 0);

        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private addToFront(node: Node): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    private removeTail(): Node | null {
        const last = this.tail.prev;
        if (last && last !== this.head) {
            this.removeNode(last);
            return last;
        }
        return null;
    }

    put(key: string, value: number): void {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
        } else {
            if (this.size >= this.capacity) {
                const tailNode = this.removeTail();
                if (tailNode) {
                    this.map.delete(tailNode.key);
                    this.size--;
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            this.size++;
        }
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToHead(node);
        return node.value;
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;

    const lines = input.split('\n');
    const [capacityStr, nStr] = lines[0].split(' ');
    const capacity = parseInt(capacityStr, 10);
    const n = parseInt(nStr, 10);

    const cache = new LRUCache(capacity);
    const getResult: number[] = [];

    for (let i = 1; i <= n; i++) {
        const parts = lines[i].split(' ');
        const operation = parts[0];
        const key = parts[1];

        switch (operation) {
            case 'PUT':
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;
            case 'GET':
                getResult.push(cache.get(key));
                break;
            case 'DEL':
                cache.del(key);
                break;
        }
    }

    if (getResult.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResult.join(' '));
    }

    const keys = cache.getKeysInOrder();
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();
