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

    private removeNode(node: Node) {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addNodeToHead(node: Node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    public get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.removeNode(node);
        this.addNodeToHead(node);
        return node.value;
    }

    public put(key: string, value: number) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.removeNode(node);
            this.addNodeToHead(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNodeToHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const lru = this.tail.prev!;
                this.removeNode(lru);
                this.map.delete(lru.key);
                this.size--;
            }
        }
    }

    public del(key: string) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    public getKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            if (curr) {
                keys.push(curr.key);
                curr = curr.next;
            } else {
                break;
            }
        }
        return keys;
    }
}

class Scanner {
    private input: string;
    private pos: number = 0;

    constructor(input: string) {
        this.input = input;
    }

    next(): string | null {
        while (this.pos < this.input.length && this.input[this.pos] <= ' ') {
            this.pos++;
        }
        if (this.pos >= this.input.length) return null;
        let start = this.pos;
        while (this.pos < this.input.length && this.input[this.pos] > ' ') {
            this.pos++;
        }
        return this.input.substring(start, this.pos);
    }
}

function solve() {
    let input: string;
    try {
        input = fs.readFileSync(0, "utf8");
    } catch (e) {
        return;
    }
    const scanner = new Scanner(input);

    const cStr = scanner.next();
    const nStr = scanner.next();
    if (cStr === null || nStr === null) return;

    const C = parseInt(cStr);
    const N = parseInt(nStr);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 0; i < N; i++) {
        const op = scanner.next();
        if (op === 'PUT') {
            const key = scanner.next();
            const valStr = scanner.next();
            if (key !== null && valStr !== null) {
                cache.put(key, parseInt(valStr));
            }
        } else if (op === 'GET') {
            const key = scanner.next();
            if (key !== null) {
                getResults.push(cache.get(key));
            }
        } else if (op === 'DEL') {
            const key = scanner.next();
            if (key !== null) {
                cache.del(key);
            }
        }
    }

    if (getResults.length === 0) {
        process.stdout.write("EMPTY\n");
    } else {
        process.stdout.write(getResults.join(" ") + "\n");
    }

    const remainingKeys = cache.getKeys();
    if (remainingKeys.length === 0) {
        process.stdout.write("EMPTY\n");
    } else {
        process.stdout.write(remainingKeys.join(" ") + "\n");
    }
}

solve();
