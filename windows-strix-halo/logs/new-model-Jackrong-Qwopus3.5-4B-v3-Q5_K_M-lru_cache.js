"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.head = null;
        this.tail = null;
        this.map = new Map();
    }
}
{
    constructor(public, key, string, public, value, number, public, next, LRUCacheNode | null, null, public, prev, LRUCacheNode | null, null);
    { }
}
addToMRU(node, LRUCacheNode);
{
    if (this.head === null) {
        this.head = node;
        this.tail = node;
        return;
    }
    node.prev = this.head;
    this.head.next = null;
    this.head = node;
}
removeFromMRU(node, LRUCacheNode);
{
    if (this.head === null)
        return;
    if (this.head.next !== null) {
        this.head = this.head.next;
        this.head.prev = null;
    }
    else {
        this.head = null;
        this.tail = null;
    }
    node.next = null;
    node.prev = null;
}
removeFromLRU(node, LRUCacheNode);
{
    if (this.tail === null)
        return;
    if (this.tail.prev !== null) {
        this.tail = this.tail.prev;
        this.tail.next = null;
    }
    else {
        this.tail = null;
        this.head = null;
    }
    node.next = null;
    node.prev = null;
}
get(key, string);
number;
{
    const node = this.map.get(key);
    if (!node)
        return -1;
    this.addToMRU(node);
    return node.value;
}
put(key, string, value, number);
void {
    : .map.has(key)
};
{
    const node = this.map.get(key);
    node.value = value;
    this.addToMRU(node);
}
{
    if (this.size >= this.capacity) {
        const lruNode = this.removeFromLRU();
        this.map.delete(lruNode.key);
    }
    else {
        const newNode = new LRUCacheNode(key, value);
        this.map.set(key, newNode);
        this.addToMRU(newNode);
        this.size++;
    }
}
del(key, string);
void {
    const: node = this.map.get(key),
    if(node) {
        if (node.prev)
            node.prev.next = node.next;
        else
            this.head = node.next;
        if (node.next)
            node.next.prev = node.prev;
        else
            this.tail = node.prev;
        this.map.delete(key);
        this.size--;
    }
};
function main() {
    const data = (0, fs_1.readFileSync)(0, 'utf8');
    const lines = data.split('\n');
    const C = parseInt(lines[0].trim().split(' ')[0]);
    const N = parseInt(lines[0].trim().split(' ')[1]);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (line === '')
            continue;
        const parts = line.split(' ');
        const operation = parts[0];
        if (operation === 'GET') {
            getResults.push(cache.get(parts[1]));
        }
        else if (operation === 'PUT') {
            cache.put(parts[1], parseInt(parts[2]));
        }
        else if (operation === 'DEL') {
            cache.del(parts[1]);
        }
    }
    if (getResults.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResults.join(' '));
    }
    const keys = [];
    let curr = cache.head;
    while (curr !== null) {
        keys.push(curr.key);
        curr = curr.next;
    }
    if (keys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(keys.join(' '));
    }
}
main();
