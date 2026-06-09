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

function main() {
    const data = fs.readFileSync(0, 'utf8').trim();
    const lines = data.split(/\r?\n/);
    const firstLineParts = lines[0].split(/\s+/);
    const C = parseInt(firstLineParts[0], 10);
    const N = parseInt(firstLineParts[1], 10);

    const head = new Node('', 0);
    const tail = new Node('', 0);
    head.next = tail;
    tail.prev = head;

    const map = new Map<string, Node>();
    let size = 0;

    function moveToFront(node: Node) {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }

    function removeNode(node: Node) {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
    }

    function get(key: string): number {
        if (!map.has(key)) return -1;
        const node = map.get(key)!;
        moveToFront(node);
        return node.value;
    }

    function put(key: string, value: number): void {
        if (map.has(key)) {
            const node = map.get(key)!;
            node.value = value;
            moveToFront(node);
            return;
        }
        if (size === C) {
            const lru = tail.prev;
            if (lru && lru !== head) {
                removeNode(lru);
                map.delete(lru.key);
                size--;
            }
        }
        const newNode = new Node(key, value);
        newNode.prev = head;
        newNode.next = head.next;
        head.next.prev = newNode;
        head.next = newNode;
        map.set(key, newNode);
        size++;
    }

    function del(key: string): void {
        if (!map.has(key)) return;
        const node = map.get(key)!;
        removeNode(node);
        map.delete(key);
        size--;
    }

    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            put(key, value);
        } else if (cmd === 'GET') {
            const key = parts[1];
            const result = get(key);
            getResults.push(result);
        } else if (cmd === 'DEL') {
            const key = parts[1];
            del(key);
        }
    }

    let firstLineOut: string;
    if (getResults.length > 0) {
        firstLineOut = getResults.join(' ');
    } else {
        firstLineOut = 'EMPTY';
    }

    const keys: string[] = [];
    let current = head.next;
    while (current !== tail) {
        keys.push(current.key);
        current = current.next;
    }
    let secondLineOut: string;
    if (keys.length > 0) {
        secondLineOut = keys.join(' ');
    } else {
        secondLineOut = 'EMPTY';
    }

    console.log(firstLineOut);
    console.log(secondLineOut);
}

main();
