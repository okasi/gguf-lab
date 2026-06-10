import * as fs from 'fs';

class LRUCache {
    private capacity: number;
    private map: Map<string, DLLNode>;
    private head: DLLNode; // Most recently used
    private tail: DLLNode; // Least recently used

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new DLLNode("", -1);
        this.tail = new DLLNode("", -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    // Remove a node from the doubly linked list
    private removeNode(node: DLLNode): void {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    // Move a node to the front (most recently used)
    private moveToFront(node: DLLNode): void {
        this.removeNode(node);
        this.addAtFront(node);
    }

    // Add a node to the front (most recently used)
    private addAtFront(node: DLLNode): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    // Remove the last node (least recently used)
    private removeLast(): DLLNode | null {
        if (this.tail.prev === this.head) {
            return null;
        }
        const last = this.tail.prev;
        this.removeNode(last);
        return last;
    }

    public get(key: string): number {
        const node = this.map.get(key);
        if (node === undefined) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }

    public put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node !== undefined) {
            node.value = value;
            this.moveToFront(node);
            return;
        }
        const newNode = new DLLNode(key, value);
        this.addAtFront(newNode);
        this.map.set(key, newNode);
        if (this.map.size > this.capacity) {
            const last = this.removeLast();
            if (last !== null) {
                this.map.delete(last.key);
            }
        }
    }

    public delete(key: string): void {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.removeNode(node);
            this.map.delete(key);
        }
    }

    public getMostRecentlyUsedKeys(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

class DLLNode {
    key: string;
    value: number;
    prev: DLLNode;
    next: DLLNode;

    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
        this.prev = null as any;
        this.next = null as any;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    
    const firstLine = lines[0].split(" ");
    const capacity = parseInt(firstLine[0], 10);
    const numOperations = parseInt(firstLine[1], 10);

    const cache = new LRUCache(capacity);
    const getResults: number[] = [];

    for (let i = 1; i <= numOperations; i++) {
        const line = lines[i].trim();
        const parts = line.split(" ");
        const operation = parts[0];
        const key = parts[1];

        switch (operation) {
            case "PUT":
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;
            case "GET":
                const result = cache.get(key);
                getResults.push(result);
                break;
            case "DEL":
                cache.delete(key);
                break;
        }
    }

    // Output GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(" "));
    }

    // Output remaining keys
    const remainingKeys = cache.getMostRecentlyUsedKeys();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(remainingKeys.join(" "));
    }
}

main();
