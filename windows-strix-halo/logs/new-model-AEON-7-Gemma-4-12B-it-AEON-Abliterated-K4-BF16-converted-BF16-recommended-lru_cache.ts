const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\r?\n/);
    if (input.length === 0) return;

    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;
    const capacity = parseInt(firstLine[0]);
    const n = parseInt(firstLine[1]);

    // Use a Map to store key -> Node
    // Use a Doubly Linked List to maintain LRU order
    class Node {
        constructor(key: string, value: number) {
            this.key = key;
            this.value = value;
            this.prev: Node | null = null;
            this.next: Node | null = null;
        }
    }

    const cache = new Map<string, Node>();
    let head: Node | null = null; // Most recently used
    let tail: Node | null = null; // Least recently used

    const moveToHead = (node: Node) => {
        if (node === head) return;
        
        // Remove from current position
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        if (node === tail) tail = node.prev;

        // Insert at head
        node.next = head;
        node.prev = null;
        if (head) head.prev = node;
        head = node;
        if (!tail) tail = node;
    };

    const removeNode = (node: Node) => {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        if (node === head) head = node.next;
        if (node === tail) tail = node.prev;
        node.prev = null;
        node.next = null;
    };

    const getResults: number[] = [];

    for (let i = 1; i <= n; i++) {
        const line = input[i]?.trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        const command = parts[0];

        if (command === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2]);
            if (cache.has(key)) {
                const node = cache.get(key)!;
                node.value = value;
                moveToHead(node);
            } else {
                const newNode = new Node(key, value);
                if (cache.size >= capacity) {
                    if (tail) {
                        cache.delete(tail.key);
                        removeNode(tail);
                    }
                }
                cache.set(key, newNode);
                if (!head) {
                    head = newNode;
                    tail = newNode;
                } else {
                    newNode.next = head;
                    head.prev = newNode;
                    head = newNode;
                }
            }
        } else if (command === 'GET') {
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key)!;
                getResults.push(node.value);
                moveToHead(node);
            } else {
                getResults.push(-1);
            }
        } else if (command === 'DEL') {
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key)!;
                removeNode(node);
                cache.delete(key);
            }
        }
    }

    // Output results
    process.stdout.write(getResults.length > 0 ? getResults.join(' ') + '\n' : 'EMPTY\n');

    const finalKeys: string[] = [];
    let curr = head;
    while (curr) {
        finalKeys.push(curr.key);
        curr = curr.next;
    }
    process.stdout.write(finalKeys.length > 0 ? finalKeys.join(' ') + '\n' : 'EMPTY\n');
}

solve();
