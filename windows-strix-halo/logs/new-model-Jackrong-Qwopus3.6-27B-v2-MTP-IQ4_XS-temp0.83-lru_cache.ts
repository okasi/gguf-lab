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

Then the LRU class:

class LRUCache {
    capacity: number;
    size: number;
    head: Node | null; // most recent
    tail: Node | null; // least recent
    map: Map<string, Node>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.head = null;
        this.tail = null;
        this.map = new Map();
    }

    private _removeNode(node: Node): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            // node was head
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        } else {
            // node was tail
            this.tail = node.prev;
        }
        // detach
        node.prev = null;
        node.next = null;
    }

    private _addFront(node: Node): void {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            // list was empty
            this.tail = node;
        }
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        let node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
            return;
        }
        // new node
        node = new Node(key, value);
        this.map.set(key, node);
        this._addFront(node);
        this.size++;
        if (this.size > this.capacity) {
            // evict tail
            const evictNode = this.tail!; // should exist because size > capacity >=1
            this._removeNode(evictNode);
            this.map.delete(evictNode.key);
            this.size--;
        }
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (!node) {
            return;
        }
        this._removeNode(node);
        this.map.delete(key);
        this.size--;
    }

    moveToFront(node: Node): void {
        if (this.head === node) {
            return; // already most recent
        }
        this._removeNode(node);
        this._addFront(node);
    }

    getKeysFromMostRecentToLeastRecent(): string[] {
        const keys: string[] = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

But careful: In the put method, when we add a new node and size exceeds capacity, we evict tail. However, after adding the new node, the tail might be the newly added node if size was 0? But capacity >=1, so if capacity is 1 and we add first node, size becomes 1, not exceed. If we add second node, size becomes 2 > capacity, then we evict tail. The tail after adding is the previous head? Actually after _addFront, the new node becomes head, and the previous head becomes second. The tail remains the least recent, which is the old tail (or if list had one node, that node becomes tail after adding? Let's think: Initially list with one node: head=tail=node1. After _addFront(node2): node2.prev=null, node2.next=node1, node1.prev=node2, head=node2, tail remains node1 because node1.next is null? Actually we didn't update tail. In _addFront, we only set tail if list was empty. So if list had one node, after adding, the tail should still be node1 because node1.next is null, and node2.next points to node1, so node1 is still the last node. So tail remains node1. That's correct. So after adding, size becomes 2, then we evict tail which is node1. That's correct: evict least recent (node1). So our implementation works.

But we need to ensure that after evicting, we correctly update size and map.

Now, we need to read input.

We'll use:

const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split('\n');
const [C, N] = lines[0].split(' ').map(Number);

But careful: The first line may have extra spaces? Probably not, but we can split by whitespace.

We'll parse each operation line.

We'll accumulate GET results.

We'll also need to output at the end.

Potential memory: 300k operations, each node is an object. That's okay.

We'll write the code as a TypeScript file. We'll import fs.

We'll use console.log for output.

Now, check constraints: C up to 200k, N up to 300k. Our approach is fine.

Edge Cases:

- GET on non-existent key returns -1.

- DEL on non-existent key does nothing.

- PUT with existing key updates value and moves to front.

- PUT with new key may cause eviction.

- After all operations, we output remaining keys in order from most recent to least recent.

We must ensure that after eviction, the list is correct.

Now, test with simple example.

Suppose input:

3 5
PUT a 1
GET a
PUT b 2
GET b
DEL a

Operations:

C=3, N=5.

- PUT a 1: cache: head=a, tail=a, size=1.
- GET a: returns 1, moves a to front (already front). GET results: [1].
- PUT b 2: cache: head=b, a becomes next, tail=a, size=2.
- GET b: returns 2, moves b to front (already front). GET results: [1,2].
- DEL a: remove a. cache: head=b, tail=b, size=1.

Output: first line: "1 2". Second line: "b". (since only b remains, most recent to least recent is just b). That seems correct.

Another test: capacity 1, operations:

PUT a 1
GET a
PUT b 2
GET b

After PUT a: cache: a.
GET a: returns 1.
PUT b: evict a, cache: b.
GET b: returns 2.

GET results: 1 2. Remaining keys: b.

Now test with eviction after PUT of existing key? Actually PUT existing key doesn't increase size, so no eviction.

Now test with multiple evictions.

Now, we need to ensure that the LRU order after moves is correct.

Implementation details: In moveToFront, we call _removeNode and then _addFront. That works.

But note: In _removeNode, we set node.prev and node.next to null. That's fine.

Now, we need to consider performance: Using Map is O(1) average, but could have collisions. However, it's fine.

Now, we need to output the GET results. If there were no GET operations, output "EMPTY". Similarly for remaining keys.

Now, we need to write the code as a complete TypeScript program.

We'll use the following structure:

import * as fs from 'fs';

// Node class
// LRUCache class
// main function

function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

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
            const val = cache.get(key);
            getResults.push(val);
        } else if (op === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }

    // Output GET results
    if (getResults.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResults.join(' '));
    }

    // Output remaining keys
    const keys = cache.getKeysFromMostRecentToLeastRecent();
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();

But we need to be careful: lines may have more than N+1 lines? The input says next N lines are operations, so total lines = N+1. But we should handle possible extra trailing newline. We used lines[0] and then i from 1 to N inclusive. That's fine if input is well-formed. However, if there are blank lines at end, we might get index out of range. Safer: after splitting, we can filter out empty lines? But the problem likely doesn't have extra blank lines. But to be robust, we can use lines.filter(l => l.trim() !== '') and then parse.

But given constraints, it's fine.

Now, we need to ensure we use TypeScript types. We'll add type annotations.

We'll define Node and LRUCache as classes.

We'll also consider that the values are signed 32-bit integers, but JavaScript numbers are double, but they can represent exactly up to 2^53, so it's fine.

Now, we need to output the GET results as numbers separated by spaces. That's fine.

Now, we should test with some random input.

But there is a nuance: The GET operation should output the value if present, otherwise -1. But we also need to consider that GET on existing key makes it most recently used. Our get method does that.

Now, we need to ensure that the LRU order is correctly maintained after a GET on a key that is not head. For example, cache: head=A, next=B, tail=C. GET B: we remove B from middle and add to front. So new order: B, A, C. That's correct.

Our moveToFront does: remove node (which updates prev and next pointers) and then addFront. That works.

But careful: In _removeNode, we set node.prev and node.next to null. That's fine.

Now, check that after removal, the list is consistent. For example, if we remove B from middle: A.next was B, B.next is C, C.prev was B. After removal: A.next should become C, C.prev should become A. Our code: if node.prev (A) exists, set node.prev.next = node.next (C). So A.next = C. If node.next (C) exists, set node.next.prev = node.prev (A). So C.prev = A. That's correct. Then we set node.prev = null, node.next = null. So B is detached.

Then _addFront(B): set B.prev = null, B.next = head (A), head.prev = B, head = B. So order: B->A->C. Good.

Now, if we remove head: node.prev is null, so we set this.head = node.next. That's correct. And if node.next exists, we set node.next.prev = null. That's done. So head removal works.

If we remove tail: node.next is null, so we set this.tail = node.prev. And if node.prev exists, set node.prev.next = null. That's done. So tail removal works.

Thus, _removeNode works for any node.

Now, we need to ensure that after evicting tail in put, we correctly update tail. In put, after adding new node, we check if size > capacity. Then we get evictNode = this.tail!. Then we call _removeNode(evictNode). That will update head and tail appropriately. Then we delete from map and decrement size. That's correct.

But note: If capacity is 1, after adding first node, size=1, not > capacity. After adding second node, size becomes 2, then we evict tail. The tail before eviction is the previous head? Actually after adding second node, the list is: head = new node (node2), next = old head (node1). The tail is node1 because node1.next is null. So evict tail = node1. After removal, list becomes head=node2, tail=node2. That's correct.

Now, we also need to consider that after eviction, the size should be capacity. We decrement size after eviction, so size becomes capacity. Good.

Now, we need to handle the case where capacity is 0? Not allowed.

Now, we need to output the remaining keys from most recent to least recent. Our getKeysFromMostRecentToLeastRecent traverses from head to tail. That's correct.

Now, we need to ensure that we don't have any off-by-one errors in parsing lines.

We'll use lines = input.trim().split('\n'); This will remove leading/trailing whitespace, but if there are blank lines at end, they become empty strings after split? Actually split('\n') on a string with trailing newline will produce an empty string at the end. For example, "a\nb\n".trim() removes trailing newline, so it's "a\nb". Then split('\n') gives ["a","b"]. Good. But if there are multiple trailing newlines, trim removes them. So it's fine.

But we should be careful: The input may have spaces before or after each line? We'll trim each line.

We'll parse first line: const [C, N] = lines[0].split(/\s+/).map(Number);

Then for i from 1 to N: const line = lines[i].trim(); if line is empty, maybe skip? But we assume exactly N operation lines.

To be safe, we can loop through lines starting from 1 and break after N operations, or just iterate all lines after first and process until we have processed N operations. But it's easier to trust input.

Now, we need to ensure that we use fast I/O? Not necessary.

Now, we need to consider memory: 300k nodes, each with string key. That's fine.

Now, we need to write the code as a complete TypeScript program. We'll include the necessary imports.

We'll also use strict mode? Not needed.

Now, we should also consider that the keys are strings without spaces, so splitting by whitespace is fine.

Now, we need to output the GET results as numbers. But note: The values are signed 32-bit integers, but they could be negative. So we output them as numbers, including negative sign.

Now, we need to ensure that the output format is exactly as specified: first line GET results separated by spaces, or EMPTY. Second line remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY.

Now, we should test with a sample.

Sample input:

3 5
PUT a 1
GET a
PUT b 2
GET b
DEL a

Expected output:

1 2
b

Our code would produce that.

Now, another test: no GET operations.

Input:

2 2
PUT a 1
PUT b 2

Output:

EMPTY
b a? Wait, after operations: PUT a 1, then PUT b 2. After PUT a: cache: a. After PUT b: cache: b (most recent), a (least recent). So remaining keys from most recent to least recent: b a. So output second line: "b a". First line EMPTY.

Our code would produce that.

Now, test with eviction:

1 3
PUT a 1
PUT b 2
GET a

Operations: C=1.

PUT a 1: cache: a.
PUT b 2: evict a, cache: b.
GET a: returns -1 (since a evicted). GET results: -1.

Remaining keys: b.

Output:

-1
b

Our code: get a returns -1, and after get, a not present, so no move. So correct.

Now, test with GET on existing key after it became least recent:

2 4
PUT a 1
PUT b 2
GET a
GET b

After PUT a: a.
PUT b: b (most recent), a (least).
GET a: returns 1, and moves a to front: order becomes a, b.
GET b: returns 2, moves b to front: order becomes b, a.
GET results: 1 2.
Remaining keys: b a.

Our code should produce that.

Now, test with DEL on non-existent key: should do nothing.

Now, we need to ensure that the LRU cache works with large inputs.

Now, we should also consider that the keys are strings, and we use Map, which is fine.

Now, we need to write the code.

But we need to be careful about the type of value: signed 32-bit integer. In JavaScript, numbers are floating point, but they can represent 32-bit integers exactly. So it's fine.

Now, we need to ensure that we don't have any off-by-one errors in the size management.

Now, we might also consider using a simpler approach: use a doubly linked list with dummy head and tail to simplify removals. But it's fine.

Now, we should also consider that the input might have leading/trailing spaces on lines, we trim.

Now, we should also consider that the number of operations N could be up to 300k, and we are storing all GET results in an array, which could be up to 300k numbers. That's fine.

Now, we need to output the GET results as a single line. That could be a long string. console.log can handle it, but it might be slow if we join a huge array. But it's okay.

Alternatively, we could print incrementally? But the problem requires the first line to be all GET results separated by spaces, so we need to output them together. So we need to accumulate.

Now, we should also consider that the output for remaining keys could be up to 200k keys. That's also fine.

Now, we need to ensure that we use efficient traversal for keys: we traverse from head to tail, which is O(size). That's fine.

Now, we should also consider that the cache capacity could be up to 200k, so size can be up to 200k. That's okay.

Now, we need to write the code with proper TypeScript types.

We'll define:

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
    private head: Node | null;
    private tail: Node | null;
    private map: Map<string, Node>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.head = null;
        this.tail = null;
        this.map = new Map();
    }

    private removeNode(node: Node): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }

    private addFront(node: Node): void {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }

    private moveToFront(node: Node): void {
        if (this.head === node) {
            return;
        }
        this.removeNode(node);
        this.addFront(node);
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
            return;
        }
        const node = new Node(key, value);
        this.map.set(key, node);
        this.addFront(node);
        this.size++;
        if (this.size > this.capacity) {
            const evictNode = this.tail!; // safe because size > capacity >=1
            this.removeNode(evictNode);
            this.map.delete(evictNode.key);
            this.size--;
        }
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (!node) {
            return;
        }
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }

    getKeys(): string[] {
        const keys: string[] = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

Now, we need to write the main function.

We'll use:

import * as fs from 'fs';

function main() {
    const data = fs.readFileSync(0, 'utf8');
    const lines = data.trim().split(/\r?\n/); // handle possible Windows line endings
    const [C, N] = lines[0].trim().split(/\s+/).map(Number);
    const cache = new LRUCache(C);
    const getResult: number[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // skip empty lines if any
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const val = parseInt(parts[2], 10);
            cache.put(key, val);
        } else if (op === 'GET') {
            const key = parts[1];
            getResult.push(cache.get(key));
        } else if (op === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }

    // Output
    if (getResult.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResult.join(' '));
    }

    const keys = cache.getKeys();
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();

But we need to ensure we only process N operations. The lines after first may include extra lines? The problem says next N lines are operations, so there should be exactly N lines. But if there are extra blank lines, we might process them as operations? We should only process N operations. To be safe, we can count operations and stop after N. However, it's simpler to trust the input. But to be robust, we can read exactly N lines after the first. We'll do:

for (let i = 1; i <= N; i++) {
    const line = lines[i].trim();
    ...
}

But if lines[i] is undefined because input has fewer lines, it would throw. But we assume valid input.

We'll use that.

But we also need to handle possible empty lines? The problem likely doesn't have them. But we can just use the loop with N.

We'll implement:

const lines = data.trim().split(/\r?\n/);
const firstLine = lines[0];
const [C, N] = firstLine.split(/\s+/).map(Number);

for (let i = 1; i <= N; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);
    // ...
}

But note: if there are blank lines after the operations, they won't be accessed because i only goes to N.

Now, we need to be careful: The input might have trailing newline, but trim() removes it, so lines[0] is the first line, lines[1] is second, etc. So it's fine.

Now, we need to consider that the keys are non-empty strings without spaces, so splitting by whitespace is safe.

Now, we need to ensure that we use parseInt for value, which may be negative. parseInt works.

Now, we need to ensure that we handle large numbers? Values are signed 32-bit integers, so they fit in JavaScript's safe integer range.

Now, we need to ensure that we don't have any performance issues with Map and Node objects.

Now, we should also consider using a faster I/O? Not needed.

Now, we need to output
