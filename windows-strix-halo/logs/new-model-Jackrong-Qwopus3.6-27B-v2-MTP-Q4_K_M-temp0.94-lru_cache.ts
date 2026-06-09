class LRUCache {
    capacity: number;
    size: number;
    map: Map<string, Node>;
    head: Node;
    tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    // Move node to front
    private moveToFront(node: Node): void {
        // detach
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        // insert after head
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    // Add node at front
    private addToFront(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    // Remove tail node (LRU) and return its key
    private removeLRU(): string | null {
        if (this.size === 0) return null;
        const node = this.tail.prev!;
        const key = node.key;
        // remove node
        if (node.prev) node.prev.next = this.tail;
        this.tail.prev = node.prev;
        node.prev = null;
        node.next = null;
        this.size--;
        return key;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToFront(node);
        } else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addToFront(node);
            this.size++;
            if (this.size > this.capacity) {
                const lruKey = this.removeLRU();
                if (lruKey) this.map.delete(lruKey);
            }
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveToFront(node);
        return node.value;
    }

    del(key: string): void {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key)!;
        // remove node from list
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
        this.map.delete(key);
        this.size--;
    }

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next!;
        }
        return keys;
    }
}

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

Now main:

- Read all input via fs.readFileSync(0, "utf8").
- Split into lines, trim each line? Possibly there may be empty lines? Usually not.
- First line: parse C and N.
- Initialize cache.
- Collect GET results in an array (numbers).
- Loop over next N lines, parse command.
- For PUT: "PUT key value" - value may be negative, but it's a signed integer. So parse as parseInt.
- For GET: "GET key"
- For DEL: "DEL key"
- After processing, output first line: if GET results array empty, print "EMPTY", else join with space.
- Second line: get keys in order; if empty, print "EMPTY", else join with space.

Be careful about large output: use process.stdout.write.

We'll use a fast parser: read buffer? But using readFileSync and split lines is okay for N=300k. However, we need to ensure memory usage is fine. 300k lines, each line maybe up to ~30 chars, total ~9MB, fine.

But we must be careful: using fs.readFileSync might block, but it's fine for Node.js.

We'll write TypeScript code, but ensure it's complete and can be compiled.

We'll use strict typing.

Potential improvements: Use a custom linked list with Node objects, but we must be careful about memory overhead. However, with up to 200k nodes, it's okay.

Edge Cases: C=1, many operations.

Also, note: When we do PUT with a key that already exists, we update and move to front, but we do not change size. That's correct.

When we do GET, we move to front.

When we do DEL, we remove and size decreases.

We need to ensure that after DEL, the order of remaining keys is correct.

Also, note: If we have a PUT that evicts LRU, we remove that key from map and list.

We should test with sample.

We'll produce final code.

But the problem statement: "Return only TypeScript code, no explanation and no Markdown fence." So we output just the code.

We'll include import for fs? Actually, we need to read stdin, so we need to import fs? In Node.js, fs is built-in, but we can use it without import? In TypeScript, we might need to declare it or use node built-in modules. Usually, we can write: const fs = require('fs'); but in TypeScript we can use import fs from 'fs'; but we might not need to import if we just use fs.readFileSync directly? In Node.js, fs is global? Actually, it's not global; we need to require or import. In TypeScript with Node.js, we can use require('fs') or import. Since the problem says "Return only TypeScript code", we can use import fs from 'fs'; But we need to ensure it's valid TypeScript. We'll use import.

But to avoid import issues, we can use require('fs') as it's common in Node.js. However, in TypeScript, we can declare const fs = require('fs'); That works. But it's not type-safe. But it's fine.

We'll use import fs from 'fs'; as it's more modern.

We'll write:

import * as fs from 'fs';

But then we need to compile with Node.js. It should work.

Alternatively, we can use process.stdin but the requirement says "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8")." So we must use that.

So we'll do:

const input = fs.readFileSync(0, 'utf8');

Now parse.

We'll write the code.

One nuance: The input may have trailing spaces or newlines; we'll trim each line.

We'll use:

const lines = input.trim().split(/\r?\n/);

But careful: If there are empty lines at end, we should ignore. Using trim then split is fine.

But if N lines may include empty lines? Unlikely.

We'll iterate from index 1 to N inclusive.

But we need to handle the case where there might be more lines than N? Not needed.

We'll use:

const [C, N] = lines[0].split(/\s+/).map(Number);

But careful: lines[0] may have leading/trailing spaces; split on whitespace is fine.

Now loop:

for (let i = 1; i <= N; i++) {
    const line = lines[i].trim();
    if (line === '') continue; // skip empty if any
    const parts = line.split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        results.push(val.toString()); // store as string
    } else if (cmd === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}

But note: PUT value may be negative, parseInt works.

Now output:

const firstLine = results.length === 0 ? 'EMPTY' : results.join(' ');
process.stdout.write(firstLine + '\n');

const keys = cache.getKeysInOrder();
const secondLine = keys.length === 0 ? 'EMPTY' : keys.join(' ');
process.stdout.write(secondLine + '\n');

That's it.

But we need to ensure that we are using O(1) operations. Our linked list operations are O(1). Map operations O(1) average.

Potential pitfalls: When moving to front, we need to handle if node is already at front; our moveToFront will still detach and reattach, which is fine but may be extra operations. But O(1) anyway.

We should also consider that when we remove a node from the list, we need to nullify its prev/next to avoid memory leaks? Not necessary but good practice.

We'll implement as above.

Now we need to produce the final TypeScript code.

We'll include the Node class and LRUCache class.

We'll make sure to use strict null checks? Not required but good.

We'll use number for value, but we can also use any? It's fine.

We'll add comments? Not necessary.

We'll output the code.

But the problem says "Return only TypeScript code, no explanation and no Markdown fence." So we should not wrap in ```typescript.

Thus final answer: plain code.

We'll produce:

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

class LRUCache {
    capacity: number;
    size: number;
    map: Map<string, Node>;
    head: Node;
    tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private moveToFront(node: Node): void {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private addToFront(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private removeLRU(): string | null {
        if (this.size === 0) return null;
        const node = this.tail.prev!;
        const key = node.key;
        if (node.prev) node.prev.next = this.tail;
        this.tail.prev = node.prev;
        node.prev = null;
        node.next = null;
        this.size--;
        return key;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToFront(node);
        } else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addToFront(node);
            this.size++;
            if (this.size > this.capacity) {
                const lruKey = this.removeLRU();
                if (lruKey) this.map.delete(lruKey);
            }
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveToFront(node);
        return node.value;
    }

    del(key: string): void {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key)!;
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
        this.map.delete(key);
        this.size--;
    }

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next!;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split(/\r?\n/);
    if (lines.length === 0) return;
    const [C, N] = lines[0].split(/\s+/).map(Number);
    const cache = new LRUCache(C);
    const results: string[] = [];
    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (cmd === 'GET') {
            const key = parts[1];
            const val = cache.get(key);
            results.push(val.toString());
        } else if (cmd === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }
    const firstLine = results.length === 0 ? 'EMPTY' : results.join(' ');
    process.stdout.write(firstLine + '\n');
    const keys = cache.getKeysInOrder();
    const secondLine = keys.length === 0 ? 'EMPTY' : keys.join(' ');
    process.stdout.write(secondLine + '\n');
}

main();

That should work.

But we must ensure that we don't have any extra output.

Now, check constraints: C up to 200k, N up to 300k. Our implementation uses Map and linked list, which is fine.

Potential performance: Using parseInt for each PUT value is okay. But we could also use Number(parts[2]) but parseInt is fine.

We might want to avoid splitting on whitespace each time; but it's okay.

One nuance: When we call moveToFront, we assume node.prev and node.next are not null because the node is in the list. That's fine.

We also need to handle the case where capacity is large and we have many PUTs without GETs, but it's fine.

We should also consider that the keys are strings without spaces, so splitting on whitespace works.

Now, final output: we need to output two lines. We'll use process.stdout.write.

Now, check if any edge case: If N=0? But N >=1, so at least one operation.

If there are no GET operations, first line should be "EMPTY".

If after all operations, cache empty, second line "EMPTY".

Now, confirm that the order of keys from most recent to least recent is correct: We traverse from head.next to tail.prev, which is from most recent to least recent because we always insert at front after head.

Yes.

Now, test with a simple example:

Input:
3 6
PUT 1 1
PUT 2 2
PUT 3 3
GET 1
GET 2
GET 4

Operations:
PUT 1 1 -> cache: [1:1]
PUT 2 2 -> [2:2, 1:1]? Actually most recent is 2, then 1.
PUT 3 3 -> [3:3, 2:2, 1:1] (capacity 3)
GET 1 -> returns 1, order becomes [1:1, 3:3, 2:2] (since 1 moved to front)
GET 2 -> returns 2, order becomes [2:2, 1:1, 3:3]
GET 4 -> returns -1

GET results: 1 2 -1

Remaining keys: 2 1 3

Output:
1 2 -1
2 1 3

Our code should produce that.

Now, test with DEL:

Input:
2 5
PUT a 10
PUT b 20
GET a
DEL a
GET b

Expected:
GET results: 10
Remaining keys: b

Output:
10
b

Our code: after DEL a, cache has b only, order b.

Now, test with evict:

Input:
2 4
PUT a 1
PUT b 2
PUT c 3
GET a

Expected: PUT a -> [a]; PUT b -> [b, a]; PUT c -> evicts a, becomes [c, b]; GET a -> -1 (since a evicted). GET results: -1. Remaining keys: c b.

Output:
-1
c b

Our code should do that.

Now, test with PUT update:

Input:
2 3
PUT a 1
PUT a 2
GET a

Expected: GET results: 2; remaining keys: a (since only key). Actually after first PUT a, cache [a]; second PUT a updates value and makes it most recent, still only key a. So output: 2 and a.

Our code: after first PUT, size=1, map has a. Second PUT a, we update value and moveToFront (but it's already front), size stays 1, no eviction. GET a returns 2. Keys: a.

Now, test with GET that updates order:

Input:
2 4
PUT a 1
PUT b 2
GET b
GET a

Expected: after PUT a, [a]; PUT b, [b, a]; GET b -> returns 2, order becomes [b, a] (already front), actually GET b moves b to front, but it's already front, so order remains [b, a]; GET a -> returns 1, moves a to front, order becomes [a, b]. So remaining keys: a b. GET results: 2 1.

Our code: after GET b, moveToFront(b) will detach and reattach, but since it's already front, it's fine. Then GET a moves a to front, order becomes a then b.

Now, check if our moveToFront works correctly when node is not front: it detaches by setting prev.next = next and next.prev = prev, then reinserts after head. That's correct.

Potential bug: In moveToFront, we do:

if (node.prev) node.prev.next = node.next;
if (node.next) node.next.prev = node.prev;

But if node is the tail? Actually tail is dummy, so node is not tail. But node could be the only real node; then node.prev is head, node.next is tail. After detachment, head.next becomes tail, tail.prev becomes head. Then we reinsert after head: node.prev = head, node.next = head.next (which is tail), head.next.prev = node, head.next = node. That works.

But we must ensure that we don't accidentally set node.prev or node.next to null before we use them. That's fine.

Now, check removeLRU: we get node = this.tail.prev!; that is the LRU node. Then we do if (node.prev) node.prev.next = this.tail; and this.tail.prev = node.prev; That's correct. Then we decrement size.

Now, check del: we remove node from list by updating neighbors, then delete from map, decrement size.

Now, check getKeysInOrder: we traverse from head.next to tail, collecting keys.

Now, potential performance: Using Map with string keys is fine.

Now, about memory: Node objects have references, but after removal we set prev/next to null, which may help GC. Not necessary but okay.

Now, we need to ensure that we don't have any memory leaks from nodes that are still referenced by map after deletion? We delete from map.

Now, we need to consider that the input may have lines with extra spaces; using split(/\s+/) handles multiple spaces.

Now, we need to consider that the first line may have trailing spaces; we used split(/\s+/) after trimming? Actually we didn't trim lines[0] before split, but split on whitespace will ignore leading/trailing spaces. So fine.

Now, we need to ensure that we handle large numbers: values are signed 32-bit integers, but JavaScript numbers are double, so up to 2^53 safe, fine.

Now, we need to ensure that we output exactly as required: spaces between numbers, no trailing spaces.

Now, we need to make sure we don't output extra newline at end? It's fine to have a newline after second line, but not required. Usually it's okay.

Now, we need to consider that the problem may be from some judge that expects exact output.

Now, final code.

But we should also consider that using parseInt for PUT value may be slower than Number, but it's fine.

We could also use a faster I/O: read all input as a buffer and parse manually, but not needed.

Now, we should test with a larger case mentally: fine.

Now, one more nuance: The problem says "GET should output the value if present, otherwise -1, and a successful GET makes the key most recently used." So we do that.

Now, we must ensure that we don't accidentally move the node to front when it's not found; we only move if found.

Now, we should also consider that the DEL operation does not change the order of other keys; it just removes the node.

Now, we must ensure that after DEL, the size decreases, and if we later do PUT, we may add more nodes without evicting until size reaches capacity.

Now, we need to confirm that the capacity is the maximum number of items, not including dummy nodes. Our size counts real nodes, correct.

Now, we need to ensure that when we evict, we remove the tail.prev (LRU). That's correct.

Now, we need to ensure that when we do PUT with an existing key, we do not increase size, and we do not evict.

Now, we need to ensure that when we do PUT with a new key and size equals capacity, we evict before or after adding? We add first, then if size > capacity, evict. That's fine because after adding size becomes capacity+1, then evict reduces to capacity. Alternatively, we could check before adding, but same effect.

Now, we need to ensure that when we evict, we delete from map.

Now, we need to ensure that when we have capacity 1, and we PUT a new key, we evict the existing one. That's fine.

Now, we need to ensure that when we do GET on a key that exists, we move it to front, but we don't change size.

Now, we need to ensure that when we do DEL on a key that doesn't exist, we ignore.

Now, we need to ensure that after all operations, the keys order is correct.

Now, we should consider that the problem might have a trick: The values are signed 32-bit integers, but they could be -0? Not an issue.

Now, we should consider that the keys are non-empty strings without spaces, but they could be numeric strings, but that's fine.

Now, we should consider that the output for GET results should be separated by spaces, not newlines. We'll join with space.

Now, we should consider that if there are many GET results, the string could be huge, but it's okay.

Now, we should consider that we are using process.stdout.write directly, which is faster than console.log.

Now, we should ensure that we don't have any extra output like debugging.

Now, final code.

But we need to be careful about the TypeScript compilation: The code uses Map, which is part of ES6, and Node.js supports it. The code uses strict null checks? Not needed.

We'll produce the final answer.

One more nuance: The problem says "Do not use /dev/stdin." That means we should not redirect, but we are using fs.readFileSync(0, "utf8") which reads from stdin, so it's fine.

Now, we should also consider that the input may be large, and splitting into lines may create many strings, but it's okay.

Alternatively, we could use a custom parser to avoid splitting all lines at once, but it's fine.

Now, we should test with a sample.

Sample Input:

5 10
PUT a 100
PUT b 200
PUT c 300
GET a
GET d
PUT e 400
PUT f 500
DEL b
GET a
GET f
GET e

Let's simulate:

C=5, N=10.

1. PUT a 100 -> cache: [a:100]
2. PUT b 200 -> [b:200, a:100]
3. PUT c 300 -> [c:300, b:200, a:100]
4. GET a -> returns 100, order: [a:100, c:300, b:200]
5. GET d -> returns -1
6. PUT e 400 -> [e:400, a:100, c:300, b:200] (size=4)
7. PUT f 500 -> [f:500, e:400, a:100, c:300, b:200] (size=5, capacity 5)
8. DEL b -> remove b, order: [f:500, e:400, a:100, c:300] (size=4)
9. GET a -> returns 100, order: [a:100, f:500, e:400, c:300]
10. GET f -> returns 500, order: [f:500, a:100, e:400, c:300]
11. GET e -> returns 400, order: [e:400, f:500, a:100, c:300]

GET results: 100 -1 100 500 400 -> "100 -1 100 500 400"
Remaining keys: e f a c -> "e f a c"

Our code should produce that.

Now, we should also consider that the output for GET results should be exactly as numbers, with spaces.

Now, final code.

But we need to ensure that we don't have any import issues. In Node.js, we can use import without specifying the type if using ts-node with ES modules? But we can just use require('fs') to avoid module system issues. However, the problem says TypeScript, so we can use import. But to be safe, we can use const fs = require('fs'); because that works in any Node.js environment without needing experimental modules. Many judges accept that. But the requirement says "TypeScript program for Node.js". Usually they compile TypeScript to JavaScript and run with Node.js. Using require is fine. But if we use import, we need to set "type": "module" in package.json or use .mjs. Not specified. So safer to use require. However, the code is meant to be compiled with tsc, which by default emits CommonJS if "module" is not set to ESNext. Typically, tsc with default settings uses CommonJS, and import statements are converted
