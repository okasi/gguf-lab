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
    private head: Node; // dummy head
    private tail: Node; // dummy tail

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
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
        const prev = node.prev;
        const next = node.next;
        if (prev) prev.next = next;
        if (next) next.prev = prev;
    }

    private moveToFront(node: Node): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    private removeLast(): void {
        const last = this.tail.prev;
        if (last) {
            this.removeNode(last);
            this.map.delete(last.key);
        }
    }

    public get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }

    public put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeLast();
                this.size--;
            }
        }
    }

    public del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    public getKeysMRUtoLRU(): string[] {
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
    const lines = input.split('\n');
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new LRUCache(C);
    const getResults: string[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (op === 'GET') {
            const key = parts[1];
            const res = cache.get(key);
            getResults.push(res.toString());
        } else if (op === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }

    const output: string[] = [];
    if (getResults.length > 0) {
        output.push(getResults.join(' '));
    } else {
        output.push('EMPTY');
    }

    const remainingKeys = cache.getKeysMRUtoLRU();
    if (remainingKeys.length > 0) {
        output.push(remainingKeys.join(' '));
    } else {
        output.push('EMPTY');
    }

    process.stdout.write(output.join('\n') + '\n');
}

main();
