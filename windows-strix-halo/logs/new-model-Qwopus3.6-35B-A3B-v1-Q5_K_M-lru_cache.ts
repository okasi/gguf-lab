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

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, Node>();
        this.head = new Node('', -1);
        this.tail = new Node('', -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private addToHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
    }

    private removeTail(): void {
        const lruNode = this.tail.prev;
        if (lruNode && lruNode !== this.head) {
            this.removeNode(lruNode);
            this.map.delete(lruNode.key);
        }
    }

    private moveNodeToHead(node: Node): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveNodeToHead(node);
        } else {
            if (this.map.size >= this.capacity) {
                this.removeTail();
            }
            const newNode = new Node(key, value);
            this.addToHead(newNode);
            this.map.set(key, newNode);
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveNodeToHead(node);
        return node.value;
    }

    delete(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
        }
    }

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr && curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;

    const lines = input.split('\n');
    const [C, N] = lines[0].split(' ').map(Number);
    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const parts = lines[i].split(' ');
        const operation = parts[0];
        const key = parts[1];
        const value = parts[2];

        switch (operation) {
            case 'PUT':
                cache.put(key, parseInt(value));
                break;
            case 'GET':
                getResults.push(cache.get(key));
                break;
            case 'DEL':
                cache.delete(key);
                break;
        }
    }

    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const remainingKeys = cache.getKeysInOrder();
    const keysOutput = remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY';

    console.log(getOutput);
    console.log(keysOutput);
}

solve();
