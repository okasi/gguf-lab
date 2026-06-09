import * as fs from 'fs';

interface Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;

    const lines = input.split('\n');
    const [C_str, N_str] = lines[0].split(/\s+/);
    const capacity = parseInt(C_str, 10);
    // N is not strictly needed, but we can use it for loop bound

    const head: Node = { key: '', value: 0, prev: null, next: null };
    const tail: Node = { key: '', value: 0, prev: null, next: null };
    head.next = tail;
    tail.prev = head;

    const map = new Map<string, Node>();

    function addAfterHead(node: Node): void {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    function removeNode(node: Node): void {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    function moveToFront(node: Node): void {
        removeNode(node);
        addAfterHead(node);
    }

    const getResults: number[] = [];

    // Process commands
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        const key = parts[1];

        if (cmd === 'PUT') {
            const value = parseInt(parts[2], 10);
            if (map.has(key)) {
                const node = map.get(key)!;
                node.value = value;
                moveToFront(node);
            } else {
                const newNode: Node = { key, value, prev: null, next: null };
                addAfterHead(newNode);
                map.set(key, newNode);
                if (map.size > capacity) {
                    const evictedNode = tail.prev;
                    if (evictedNode !== head) {
                        removeNode(evictedNode);
                        map.delete(evictedNode.key);
                    }
                }
            }
        } else if (cmd === 'GET') {
            if (map.has(key)) {
                const node = map.get(key)!;
                getResults.push(node.value);
                moveToFront(node);
            } else {
                getResults.push(-1);
            }
        } else if (cmd === 'DEL') {
            if (map.has(key)) {
                const node = map.get(key)!;
                removeNode(node);
                map.delete(key);
            }
        }
    }

    // Output GET results
    const firstLine = getResults.length === 0 ? 'EMPTY' : getResults.join(' ');
    console.log(firstLine);

    // Output remaining keys from most recent to least recent
    const keys: string[] = [];
    let curr = head.next;
    while (curr !== tail) {
        keys.push(curr.key);
        curr = curr.next;
    }
    const secondLine = keys.length === 0 ? 'EMPTY' : keys.join(' ');
    console.log(secondLine);
}

main();
