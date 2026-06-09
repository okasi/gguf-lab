import * as fs from 'fs';

class Node<T> {
    public key: string;
    public value: T;
    public prev: Node<T> | null = null;
    public next: Node<T> | null = null;

    constructor(key: string, value: T) {
        this.key = key;
        this.value = value;
    }
}

class DoublyLinkedList<T> {
    private head: Node<T> | null = null;
    private tail: Node<T> | null = null;
    private size: number = 0;

    public get size(): number {
        return this.size;
    }

    private removeNode(node: Node<T>): void {
        const prev = node.prev;
        const next = node.next;

        if (prev) {
            prev.next = next;
        } else {
            this.head = next;
        }

        if (next) {
            next.prev = prev;
        } else {
            this.tail = prev;
        }

        this.size--;
    }

    public moveToHead(node: Node<T>): void {
        if (node.prev) {
            node.prev!.next = node.next;
            node.next!.prev = node.prev!;
        } else {
            // Node is already head
        }

        if (this.head === node) {
            return;
        }

        if (this.tail === node) {
            this.tail = node.prev;
            node.prev!.next = node.next;
            node.next!.prev = node.prev!;
            this.removeNode(node);
            this.head = node.next;
            this.tail = node.prev;
            this.size++;
            return;
        }

        // Insert at head
        node.prev = this.head;
        this.head?.next = node;
        this.head = node;
        node.next = this.head?.next;
        this.head?.next?.prev = node;

        if (this.tail === node) {
            this.tail = node;
        }

        this.size++;
    }

    public removeTail(): Node<T> | null {
        const tail = this.tail;
        if (!tail) {
            return null;
        }
        this.removeNode(tail);
        this.tail = tail.prev;
        return tail;
    }

    public append(node: Node<T>): void {
        if (!this.tail) {
            this.head = node;
            this.tail = node;
            this.size++;
            return;
        }

        node.prev = this.tail;
        this.tail!.next = node;
        node.next = null;
        this.tail = node;
        this.size++;
    }
}

class LRUCache<K, V> {
    private cache: Map<K, Node<V>> = new Map();
    private list = new DoublyLinkedList<Node<V>>();
    private capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    public get(key: K): V | undefined {
        const node = this.cache.get(key);
        if (!node) {
            return undefined;
        }
        this.list.moveToHead(node);
        return node.value;
    }

    public put(key: K, value: V): void {
        let node = this.cache.get(key);

        if (!node) {
            node = new Node(key, value);
            this.cache.set(key, node);
            this.list.append(node);
        } else {
            node.value = value;
            this.list.moveToHead(node);
        }

        if (this.list.size > this.capacity) {
            const lruNode = this.list.removeTail();
            if (lruNode) {
                this.cache.delete(lruNode.key);
            }
        }
    }

    public delete(key: K): boolean {
        const node = this.cache.get(key);
        if (!node) {
            return false;
        }
        this.list.removeNode(node);
        this.cache.delete(key);
        return true;
    }

    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.list.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main(): void {
    try {
        const input = fs.readFileSync(0, "utf8");
        const lines = input.trim().split('\n');

        if (lines.length === 0) {
            console.log("EMPTY");
            console.log("EMPTY");
            return;
        }

        const [C, N] = lines[0].split(/\s+/).map(Number);
        const cache = new LRUCache<string, number>(C);

        const getResults: number[] = [];

        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(/\s+/).filter(p => p.length > 0);
            const command = parts[0];

            switch (command) {
                case 'PUT':
                    const key = parts[1];
                    const value = parseInt(parts[2], 10);
                    cache.put(key, value);
                    break;
                case 'GET':
                    const key = parts[1];
                    const result = cache.get(key);
                    getResults.push(result === undefined ? -1 : result);
                    break;
                case 'DEL':
                    const key = parts[1];
                    cache.delete(key);
                    break;
            }
        }

        const getOutput = getResults.length > 0 ? getResults.join(' ') : "EMPTY";
        const remainingKeys = cache.getKeysInOrder().join(' ');
        
        console.log(getOutput);
        console.log(remainingKeys);

    } catch (error) {
        // Handle potential file system or parsing errors gracefully
        console.error("Error processing input:", error instanceof Error ? error.message : error);
    }
}

main();
