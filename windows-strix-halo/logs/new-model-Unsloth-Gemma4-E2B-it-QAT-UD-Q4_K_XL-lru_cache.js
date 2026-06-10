"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Implementation of a Least Recently Used (LRU) Cache using a Map for O(1) lookups
 * and a Doubly Linked List for O(1) move-to-front/eviction.
 */
class LRUCache {
    constructor(capacity) {
        // Map stores key -> node in the DLL for O(1) access to the node
        this.keyToNode = new Map();
        // Head is the most recently used node (front of the list)
        this.head = null;
        // Tail is the least recently used node (end of the list)
        this.tail = null;
        this.capacity = capacity;
    }
}
{
    key: string;
    value: number;
    prev: Node | null;
    null;
    next: Node | null;
    null;
    constructor(key, string, value, number);
    {
        this.key = key;
        this.value = value;
    }
}
removeNode(node, Node);
void {
    if(node) { }, : .prev
};
{
    node.prev.next = node.next;
}
{
    // Node is the head
    this.head = node.next;
}
if (node.next) {
    node.next.prev = node.prev;
}
else {
    // Node is the tail
    this.tail = node.prev;
}
moveToHead(node, Node);
void {
    if(node) { }
} === this.head;
{
    return;
}
// 1. Remove the node from its current position
this.removeNode(node);
// 2. Insert at the head
node.next = this.head;
if (this.head) {
    this.head.prev = node;
}
this.head = node;
if (!this.tail) {
    // Cache was empty, new node is also the tail
    this.tail = node;
}
popTail();
Node | null;
{
    if (!this.tail) {
        return null;
    }
    const lruNode = this.tail;
    this.removeNode(lruNode);
    return lruNode;
}
put(key, string, value, number);
void {
    : .keyToNode.has(key)
};
{
    // Update existing key: move to head and update value
    const node = this.keyToNode.get(key);
    node.value = value;
    this.moveToHead(node);
    return;
}
// New key insertion
if (this.keyToNode.size >= this.capacity) {
    // Evict LRU
    const lruNode = this.popTail();
    if (lruNode) {
        this.keyToNode.delete(lruNode.key);
    }
}
// Create new node and insert at head
const newNode = new this.Node(key, value);
this.keyToNode.set(key, newNode);
this.moveToHead(newNode);
get(key, string);
number;
{
    const node = this.keyToNode.get(key);
    if (!node) {
        return -1; // Not found
    }
    // Hit: Move accessed node to the head (MRU)
    this.moveToHead(node);
    return node.value;
}
delete (key);
string;
void {
    const: node = this.keyToNode.get(key),
    if(, node) {
        return; // Key not found
    },
    this: .removeNode(node),
    this: .keyToNode.delete(key)
};
getKeys();
string[];
{
    const keys = [];
    let current = this.head;
    while (current) {
        keys.push(current.key);
        current = current.next;
    }
    return keys;
}
function solve() {
    const fs = require('fs');
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === "")
        return;
    // Parse C and N
    const [C_str, N_str] = input[0].trim().split(/\s+/);
    const C = parseInt(C_str);
    const N = parseInt(N_str);
    const cache = new LRUCache(C);
    const getResults = [];
    // Process N operations starting from line 1
    for (let i = 1; i <= N; i++) {
        if (i >= input.length)
            break;
        const line = input[i].trim();
        if (line === "")
            continue;
        const parts = line.split(/\s+/);
        const command = parts[0];
        if (command === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2]);
            cache.put(key, value);
        }
        else if (command === "GET") {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (command === "DEL") {
            const key = parts[1];
            cache.delete(key);
        }
    }
    // --- Output Formatting ---
    // 1. GET results
    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    process.stdout.write(getOutput + '\n');
    // 2. Remaining keys (MRU to LRU)
    const keys = cache.getKeys();
    const keyOutput = keys.length > 0 ? keys.join(' ') : 'EMPTY';
    process.stdout.write(keyOutput + '\n');
}
solve();
