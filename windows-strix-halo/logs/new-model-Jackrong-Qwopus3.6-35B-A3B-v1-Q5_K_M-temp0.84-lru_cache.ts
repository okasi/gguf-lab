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
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private addToFront(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        prev!.next = next;
        next!.prev = prev;
    }

    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    private removeTail(): Node | null {
        const node = this.tail.prev;
        if (node && node !== this.head) {
            this.removeNode(node);
            return node;
        }
        return null;
    }

    get(key: string): number {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.moveToHead(node);
            return node.value;
        }
        return -1;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            if (this.size >= this.capacity) {
                const tailNode = this.removeTail();
                if (tailNode) {
                    this.map.delete(tailNode.key);
                    this.size--;
                }
            }
            const newNode = new Node(key, value);
            this.addToFront(newNode);
            this.map.set(key, newNode);
            this.size++;
        }
    }

    delete(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeys(): string[] {
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
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0) return;

    const firstLine = input[0].split(' ');
    const capacity: number = parseInt(firstLine[0], 10);
    const numOps: number = parseInt(firstLine[1], 10);

    const cache: LRUCache = new LRUCache(capacity);
    const getResults: number[] = [];

    for (let i = 1; i <= numOps; i++) {
        const parts = input[i].split(' ');
        const op: string = parts[0];
        const key: string = parts[1];

        if (op === 'PUT') {
            const value: number = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (op === 'GET') {
            const result: number = cache.get(key);
            getResults.push(result);
        } else if (op === 'DEL') {
            cache.delete(key);
        }
    }

    const getOutput: string = getResults.length > 0
        ? getResults.join(' ')
        : 'EMPTY';
    
    const keys: string[] = cache.getKeys();
    const keysOutput: string = keys.length > 0
        ? keys.join(' ')
        : 'EMPTY';

    console.log(getOutput);
    console.log(keysOutput);
}

main();
