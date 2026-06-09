import * as fs from 'fs';

interface Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;
}

class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, Node>();
        // Dummy head and tail
        this.head = { key: '', value: 0, prev: null, next: null };
        this.tail = { key: '', value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private addToHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
        node.prev = null;
        node.next = null;
    }

    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    private popTail(): Node {
        const res = this.tail.prev;
        if (res) {
            this.removeNode(res);
        }
        return res!;
    }

    put(key: string, value: number): void {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
            return;
        }

        const newNode: Node = {
            key,
            value,
            prev: null,
            next: null
        };

        this.addToHead(newNode);
        this.map.set(key, newNode);
        this.size++;

        if (this.size > this.capacity) {
            const tail = this.popTail();
            this.map.delete(tail.key);
            this.size--;
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

    del(key: string): boolean {
        const node = this.map.get(key);
        if (!node) {
            return false;
        }
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
        return true;
    }

    getKeysInOrder(): string[] {
        const result: string[] = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);

    const cache = new LRUCache(capacity);
    const getResults: string[] = [];

    for (let i = 1; i <= n; i++) {
        const line = lines[i].trim().split(/\s+/);
        if (line.length === 0) continue;

        const operation = line[0];
        switch (operation) {
            case 'PUT':
                const putKey = line[1];
                const putValue = parseInt(line[2], 10);
                cache.put(putKey, putValue);
                break;
            case 'GET':
                const getKey = line[1];
                const getResult = cache.get(getKey);
                getResults.push(getResult.toString());
                break;
            case 'DEL':
                const delKey = line[1];
                cache.del(delKey);
                break;
        }
    }

    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const remainingKeys = cache.getKeysInOrder();
    const keysOutput = remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY';

    console.log(getOutput);
    console.log(keysOutput);
}

main();
