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
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    const firstLine = input[0].split(' ');
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);

    const head: Node = new Node('', 0);
    const tail: Node = new Node('', 0);
    head.next = tail;
    tail.prev = head;

    const map = new Map<string, Node>();
    let size = 0;
    const getResults: number[] = [];

    function removeNode(node: Node): void {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
    }

    function addNodeToHead(node: Node): void {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    function moveNodeToHead(node: Node): void {
        removeNode(node);
        addNodeToHead(node);
    }

    for (let i = 1; i <= n; i++) {
        const line = input[i].split(' ');
        const op = line[0];

        if (op === 'PUT') {
            const key = line[1];
            const value = parseInt(line[2], 10);
            if (map.has(key)) {
                const node = map.get(key)!;
                node.value = value;
                moveNodeToHead(node);
            } else {
                if (size === capacity) {
                    const lruNode = tail.prev;
                    removeNode(lruNode);
                    map.delete(lruNode.key);
                    size--;
                }
                const node = new Node(key, value);
                addNodeToHead(node);
                map.set(key, node);
                size++;
            }
        } else if (op === 'GET') {
            const key = line[1];
            if (map.has(key)) {
                const node = map.get(key)!;
                moveNodeToHead(node);
                getResults.push(node.value);
            } else {
                getResults.push(-1);
            }
        } else if (op === 'DEL') {
            const key = line[1];
            if (map.has(key)) {
                const node = map.get(key)!;
                removeNode(node);
                map.delete(key);
                size--;
            }
        }
    }

    if (getResults.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResults.join(' '));
    }

    let current = head.next;
    const keys: string[] = [];
    while (current !== tail) {
        keys.push(current.key);
        current = current.next;
    }
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();
