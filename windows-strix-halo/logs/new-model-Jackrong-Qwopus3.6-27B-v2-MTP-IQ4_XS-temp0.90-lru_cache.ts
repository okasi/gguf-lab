import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const first = lines[0].split(' ');
const C = parseInt(first[0], 10);
const N = parseInt(first[1], 10);

const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
    const line = lines[i];
    if (!line) continue; // maybe empty lines
    const parts = line.split(' ');
    const op = parts[0];
    if (op === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (op === 'GET') {
        const key = parts[1];
        const result = cache.get(key);
        getResults.push(result);
    } else if (op === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}

// Output
if (getResults.length === 0) {
    console.log('EMPTY');
} else {
    console.log(getResults.join(' '));
}

// Keys
const keys = cache.getKeysFromMostRecentToLeast();
if (keys.length === 0) {
    console.log('EMPTY');
} else {
    console.log(keys.join(' '));
}

Now, implement LRUCache:

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
    map: Map<string, Node>;
    head: Node;
    tail: Node;
    size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', 0); // sentinel
        this.tail = new Node('', 0); // sentinel
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    addNode(node: Node): void {
        // insert before tail
        node.prev = this.tail.prev;
        node.next = this.tail;
        this.tail.prev.next = node;
        this.tail.prev = node;
    }

    removeNode(node: Node): void {
        node.prev!.next = node.next!;
        node.next!.prev = node.prev!;
    }

    moveToTail(node: Node): void {
        this.removeNode(node);
        this.addNode(node);
    }

    removeHead(): Node | null {
        if (this.head.next === this.tail) return null;
        const node = this.head.next;
        this.removeNode(node);
        this.map.delete(node.key);
        this.size--;
        return node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.moveToTail(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToTail(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNode(newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeHead(); // this decrements size
            }
        }
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysFromMostRecentToLeast(): string[] {
        const keys: string[] = [];
        let node: Node | null = this.tail.prev;
        while (node !== this.head) {
            keys.push(node.key);
            node = node.prev;
        }
        return keys;
    }
}

That's the core.

But we need to consider that the sentinel nodes have empty key. That's fine.

Now, we must ensure that the code runs with Node.js and TypeScript. We might need to compile TypeScript first, but the problem likely expects that the code can be executed with ts-node or they will compile. Usually in such problems, they accept JavaScript. But the instruction says TypeScript. We'll output TypeScript code with appropriate types.

We also need to handle possible large input and avoid stack overflow? Not relevant.

One potential issue: In removeNode, we assume node.prev and node.next are not null. Since we only call removeNode on nodes that are in the list (with proper links), it's safe.

In addNode, we also assume tail.prev is not null.

We also need to consider that when we call removeHead after adding a node, we might be removing the node we just added if capacity is 0? But capacity >=1, so after adding, size becomes 1, which is not > capacity if capacity=1, so we don't evict. If capacity=1 and we add a second distinct key, size becomes 2 > 1, we evict the head. That's fine.

Now, we need to ensure that the order of keys after all operations is correct. The traversal from tail.prev to head.next yields most recent first.

Now, we should test with a small example.

Example: C=2, N=7
PUT A 1
PUT B 2
GET A -> 1, order: A (most recent), B
PUT C 3 -> evict B, order: C, A
GET B -> -1
DEL A
GET C -> 3
Remaining keys: C (most recent) then? After DEL A, order: C only. So second line: C.

Our implementation: after PUT A 1: list: head -> A -> tail. GET A: move to tail, but it's already tail? Actually after put, A is at tail. GET moves it to tail again (no change). After PUT B 2: list: head -> A -> B -> tail. GET A: move A to tail => order: B, A. So after GET A, order: B (least), A (most). Then PUT C 3: insert C, size becomes 3 > 2, evict head which is B. So after eviction, list: head -> A -> C -> tail. Then GET B -> -1. DEL A: remove A, list: head -> C -> tail. GET C -> 3, move C to tail (already tail). Remaining keys: C. So output: first line: "1 -1 3"? Actually GET results: first GET A ->1, then GET B -> -1, then GET C ->3, so "1 -1 3". Second line: "C". That matches.

Now, we need to ensure that the output lines are exactly as described: first line all GET results separated by spaces, or EMPTY. Second line keys from most recent to least recent, or EMPTY.

Now, we need to consider that the input may have extra whitespace or trailing newline. We'll trim and split by newline.

We'll also need to handle that there may be empty lines at the end. We'll only process up to N lines.

Now, we need to output exactly as required.

We'll also consider using fast I/O? Not necessary, but we can use process.stdin? The requirement says "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8")." So we must use fs.readFileSync.

Now, we need to write the code in a single file.

We'll include import statement.

Now, we need to ensure that the code is TypeScript. We'll use strict mode maybe, but not required.

We'll define types for Node etc.

We'll also consider that the Map's get and set are O(1) average.

Now, let's produce the final code.

But we should also consider potential issues with using sentinel nodes and the fact that we are using Node constructor with dummy values. It's fine.

Now, we might want to optimize by not creating Node objects for sentinel? It's fine.

Now, we'll produce the code.

But the problem says "Return only TypeScript code, no explanation and no Markdown fence." So we should output the code without any backticks or extra text.

Thus, final answer: the TypeScript code.

We'll include the necessary import.

Now, we need to ensure that the code is correct and compiles.

One more thing: In the getKeysFromMostRecentToLeast method, we traverse from tail.prev back to head. However, if the list is empty (size=0), tail.prev is head, so the loop condition node !== this.head will be false, and we return empty array. That's correct.

Now, we might also consider using a simpler approach: after all operations, we could iterate the map in order? But map doesn't guarantee LRU order. So we must use linked list.

Now, we should test with edge cases: capacity 1, many operations.

Example: C=1, N=3: PUT A 1, PUT B 2, GET A -> -1, GET B -> 2. After PUT A: list: A. PUT B: insert B, size becomes 2 >1, evict head (A). So list: B. GET A -> -1, GET B -> 2. Remaining keys: B. Output: "-1 2" and "B". Works.

Now, test DEL: C=2, PUT A1, PUT B2, DEL A, GET B ->2, remaining B. Good.

Now, test PUT update: C=2, PUT A1, PUT B2, PUT A3, GET A ->3, remaining order: A (most recent), B? Actually after PUT A3, we update A and move to tail, so order: B (least), A (most). So remaining keys: A, B? Wait most recent to least recent: A then B. So output "A B". Good.

Now, we need to ensure that the order after multiple GETs: each GET moves to tail, so order changes.

Now, we need to consider that the input may have keys that are numeric? They are strings, so fine.

Now, we need to ensure that we parse integers correctly: parseInt with radix 10.

Now, we need to ensure that the code runs within time limits. O(1) per operation, total O(N) time. Memory O(C) for nodes.

Now, we should also consider that we might have many GET results, and we store them in an array, then join. That's fine.

Now, we need to output the code.

But the problem says "Write a complete TypeScript program for Node.js." So we should include the import and the code.

We'll also include a main execution block.

Now, we need to be careful about the line splitting: we used split(/\r?\n/) to handle Windows line endings. But we could also just split('\n') and then trim each line. However, split('\n') will keep \r if present? Actually, if input has \r\n, split('\n') will give lines with trailing \r. So better to use split(/\r?\n/) or replace \r with nothing. We'll use split('\n') and then for each line, trim? But trimming might affect keys? Keys are non-empty without spaces, so trimming is safe. However, trimming could remove leading/trailing spaces that are not part of key? The input likely doesn't have extra spaces. But to be safe, we can split by whitespace for each line? Actually each line has exactly three tokens for PUT, two for GET/DEL. So we can split by space. Using line.split(' ') will handle multiple spaces? It will produce empty strings if multiple spaces. But input is well-formed, so it's fine.

We'll parse lines after the first.

We can also read all tokens at once using split(/\s+/) but then we need to know structure. Better to process line by line.

We'll do:

const lines = input.split(/\r?\n/);
if (lines[0] === '') lines.shift(); // maybe empty first line due to trim? We'll trim input first.

We'll do: const input = fs.readFileSync(0, 'utf8').trim(); then const lines = input.split(/\r?\n/);

That should work.

Now, we need to ensure that we only process N lines after the first. There might be extra lines? We'll only loop i from 1 to N inclusive, but if lines length is less than N+1, we may have issues. But assume input is correct.

Now, we'll produce final code.

But we might want to use a faster parsing method? Not needed.

Now, we should also consider that the cache capacity C can be up to 200k, and N up to 300k, so memory for nodes up to 200k, fine.

Now, we'll write the code with proper types.

We'll also add a check for N=0? Not possible because N>=1.

Now, we'll produce the final answer.

But before finalizing, we should double-check the output format: "First line: all GET results separated by spaces, or EMPTY if there were no GET operations. Second line: remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty."

So if there are GET operations, we output the results even if some are -1. If none, "EMPTY". For keys, if cache empty, "EMPTY".

Now, we need to ensure that we output exactly that, with no trailing spaces.

Now, we should also consider that the keys order from most recent to least recent: that is the order of the linked list from tail to head. Our traversal does that.

Now, we should also consider that after all operations, the linked list order is correct.

Now, we can write the code.

But there is a nuance: In the PUT operation, if the key already exists, we update value and move to tail. That's correct.

Now, we need to ensure that when we evict, we evict the least recently used, which is head.next.

Now, we also need to consider that the sentinel nodes have no key, but we never output them.

Now, let's write the code with proper formatting.

We'll also include a main function to avoid global scope.

Now, final code:

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
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private addNode(node: Node): void {
        node.prev = this.tail.prev;
        node.next = this.tail;
        this.tail.prev.next = node;
        this.tail.prev = node;
    }

    private removeNode(node: Node): void {
        node.prev!.next = node.next!;
        node.next!.prev = node.prev!;
    }

    private moveToTail(node: Node): void {
        this.removeNode(node);
        this.addNode(node);
    }

    private removeHead(): Node | null {
        if (this.head.next === this.tail) return null;
        const node = this.head.next;
        this.removeNode(node);
        this.map.delete(node.key);
        this.size--;
        return node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.moveToTail(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToTail(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNode(newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeHead();
            }
        }
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysFromMostRecentToLeast(): string[] {
        const keys: string[] = [];
        let node: Node | null = this.tail.prev;
        while (node !== this.head) {
            keys.push(node.key);
            node = node.prev;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLineParts = lines[0].split(' ');
    const C = parseInt(firstLineParts[0], 10);
    const N = parseInt(firstLineParts[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const parts = line.split(' ');
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (op === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        } else if (op === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResults.join(' '));
    }

    const keys = cache.getKeysFromMostRecentToLeast();
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();

Now, we should check for any potential issues:

- In removeNode, we use non-null assertion (!) because we assume node.prev and node.next are not null. Since we only call removeNode on nodes that are properly linked, it's safe. But to be safe, we could check, but not needed.

- In addNode, we assume tail.prev is not null. Since we always have at least head and tail, tail.prev is at least head, so it's not null.

- In removeHead, we check if head.next === tail, then return null. That's correct.

- In getKeysFromMostRecentToLeast, we traverse from tail.prev. If list empty, tail.prev is head, so loop condition node !== head is false, keys empty.

Now, we need to ensure that we handle the case where N lines may have extra whitespace. We used split(' ') which might produce empty strings if multiple spaces. But the input is well-formed. However, to be robust, we could use split(/\s+/) but then we need to ensure we have the right number of parts. For PUT, we need 3 parts; for GET/DEL, 2 parts. We can use split(/\s+/) and then check. But simpler: use split(' ') and it's fine.

But note: if there are leading/trailing spaces in a line, split(' ') would produce empty first element. For example, " PUT A 1" would give ['', 'PUT', 'A', '1'] if we split by space. That would cause op to be '' and cause errors. To avoid, we can trim each line before splitting. So we should do: const line = lines[i].trim(); if (!line) continue; then const parts = line.split(/\s+/); That would handle multiple spaces and leading/trailing. But we can also just use trim and split(' '). However, split(' ') on a trimmed string with single spaces works. If there are multiple spaces, split(' ') will produce empty strings. For example, "PUT  A 1" -> split(' ') gives ['PUT', '', 'A', '1']. That would cause op='PUT', but then parts[1] would be '' not 'A'. So it's safer to use split(/\s+/) which splits on any whitespace and ignores multiple spaces.

Thus, we'll change: const parts = line.trim().split(/\s+/); That will give array of tokens.

We'll do:

const line = lines[i];
if (!line.trim()) continue; // skip empty lines
const parts = line.trim().split(/\s+/);
const op = parts[0];
if (op === 'PUT') {
    const key = parts[1];
    const value = parseInt(parts[2], 10);
    ...
} else if (op === 'GET') {
    const key = parts[1];
    ...
} else if (op === 'DEL') {
    const key = parts[1];
    ...
}

That is robust.

Now, we also need to ensure that the first line parsing is robust: const firstLineParts = lines[0].trim().split(/\s+/);.

Now, we should also consider that the input may have trailing spaces on lines, but trim handles.

Now, we should also consider that N may be up to 300k, and we are storing all lines in an array. That's fine memory-wise.

Now, we should also consider that we are using Map, which is efficient.

Now, we can produce the final code.

But the problem says "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8")." We are using that.

Now, we need to output only TypeScript code, no explanation and no Markdown fence. So we will output the code as plain text.

Now, we should also consider that we might need to set the Node.js environment to run TypeScript? Typically, they would compile it first. But we can include a comment about compilation? No, we just output code.

Now, we should also consider using a faster I/O method like process.stdin.read() but we are using fs.readFileSync which reads all at once. That's acceptable.

Now, final code.

But we might want to use a simpler approach: use a Map and maintain order via a Set? Not needed.

Now, we'll produce the final answer.

One more thing: In the output, we need to output the keys from most-recently-used to least-recently-used. Our traversal from tail.prev to head gives that order. However, we must ensure that after all operations, the order is correct. For example,
