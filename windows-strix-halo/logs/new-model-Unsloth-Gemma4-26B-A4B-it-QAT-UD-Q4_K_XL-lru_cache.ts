import * as fs from 'fs';

class ListNode {
    constructor(
        public key: string,
        public value: number,
        public prev: ListNode | null = null,
        public next: ListNode | null = null
    ) {}
}

class LRUCache {
    private capacity: number;
    private map: Map<string, ListNode>;
    private head: ListNode;
    private tail: ListNode;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, ListNode>();
        this.head = new ListNode("", 0);
        this.tail = new ListNode("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private removeNode(node: ListNode): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addToHead(node: ListNode): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    private moveToHead(node: ListNode): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    get(key: string): number {
        if (!this.map.has(key)) return -1;
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
            if (this.map.size >= this.capacity) {
                const lru = this.tail.prev!;
                if (lru !== this.head) {
                    this.map.delete(lru.key);
                    this.removeNode(lru);
                }
            }
            const newNode = new ListNode(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
        }
    }

    delete(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
        }
    }

    getKeysLRUOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail && current !== null) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }

    isEmpty(): boolean {
        return this.map.size === 0;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;

    const capacity = parseInt(firstLine[0]);
    const n = parseInt(firstLine[1]);

    const cache = new LRUCache(capacity);
    const getResults: number[] = [];

    for (let i = 1; i <= n; i++) {
        const line = lines[i];
        if (!line) continue;
        const parts = line.trim().split(/\s+/);
        const cmd = parts[0];

        if (cmd === 'PUT') {
            cache.put(parts[1], parseInt(parts[2]));
        } else if (cmd === 'GET') {
            getResults.push(cache.get(parts[1]));
        } else if (cmd === 'DEL') {
            cache.delete(parts[1]);
        }
    }

    const getOutput = getResults.length > 0 ? getResults.join(' ') : "EMPTY";
    const keyOutput = !cache.isEmpty() ? cache.getKeysLRUOrder().join(' ') : "EMPTY";

    process.stdout.write(getOutput + "\n" + keyOutput + "\n");
}

solve();
