"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class LRUCache {
    constructor(capacity) {
        // Sentinel nodes: 0 = tail (least recent), 1 = head (most recent)
        this.tail = 0;
        this.head = 1;
        // Next available node index
        this.nextNodeIndex = 2;
        this.getValues = new Map();
        this.capacity = capacity;
        this.keyToNodeIndex = new Map();
        // Initialize sentinel nodes
        this.nodePrev = [0, 0]; // tail.prev, head.prev
        this.nodeNext = [0, 0]; // tail.next, head.next
        this.nodeKey = ["", ""];
        // Set up circular links between head and tail
        this.nodePrev[1] = this.tail; // head.prev = tail
        this.nodeNext[0] = this.head; // tail.next = head
        this.keysInOrder = [];
    }
    addNodeAfter(key, afterIndex) {
        // Add a new node after 'afterIndex'
        const newNodeIdx = this.nextNodeIndex++;
        this.nextNodeIndex++; // skip one for the other sentinel if needed, but we have fixed head/tail
        // Actually, we need to ensure we don't overlap with head/tail indices
        // head is 1, tail is 0. So start from 2.
        // Insert after afterIndex
        const nextOfAfter = this.nodeNext[afterIndex];
        // Update links
        this.nodeNext[afterIndex] = newNodeIdx;
        this.nodePrev[newNodeIdx] = afterIndex;
        this.nodePrev[nextOfAfter] = newNodeIdx;
        this.nodeNext[newNodeIdx] = nextOfAfter;
        // Set node key
        this.nodeKey[newNodeIdx] = key;
        return newNodeIdx;
    }
    removeNode(nodeIdx) {
        // Remove a node from the doubly linked list
        const prevIdx = this.nodePrev[nodeIdx];
        const nextIdx = this.nodeNext[nodeIdx];
        this.nodeNext[prevIdx] = nextIdx;
        this.nodePrev[nextIdx] = prevIdx;
        // Clear node data
        this.nodePrev[nodeIdx] = 0;
        this.nodeNext[nodeIdx] = 0;
        this.nodeKey[nodeIdx] = "";
    }
    removeTailNode() {
        // Remove the least recently used node (right after tail)
        const lruNodeIdx = this.nodeNext[this.tail];
        this.removeNode(lruNodeIdx);
    }
    moveToFront(key) {
        // Move a node to be right after head (most recently used)
        const nodeIdx = this.keyToNodeIndex.get(key);
        this.removeNode(nodeIdx);
        this.addNodeAfter(key, this.head);
    }
    put(key, value) {
        if (this.keyToNodeIndex.has(key)) {
            // Update existing key - just move to front (value update is implicit as we don't store values, key existence is enough)
            // Actually, we need to track values too. Let me reconsider.
            // We need to store values. Let me add a value array.
            this.keyToNodeIndex.set(key, this.addNodeAfter(key, this.head));
        }
        else {
            // New key
            if (this.keyToNodeIndex.size >= this.capacity) {
                // Evict LRU
                this.removeTailNode();
                const lruKey = this.nodeKey[this.tail]; // This won't work since we just removed it
                // Let me fix: get the key before removing
                const lruNodeIdx = this.nodeNext[this.tail];
                const lruKey = this.nodeKey[lruNodeIdx];
                this.removeNode(lruNodeIdx);
                this.keyToNodeIndex.delete(lruKey);
            }
            const newNodeIdx = this.addNodeAfter(key, this.head);
            this.keyToNodeIndex.set(key, newNodeIdx);
        }
    }
    get(key) {
        if (!this.keyToNodeIndex.has(key)) {
            return -1;
        }
        this.moveToFront(key);
        // We need to return the value. Let me add value storage.
        return this.values.get(key);
    }
    del(key) {
        if (!this.keyToNodeIndex.has(key)) {
            return;
        }
        const nodeIdx = this.keyToNodeIndex.get(key);
        this.removeNode(nodeIdx);
        this.keyToNodeIndex.delete(key);
        this.values.delete(key);
    }
    getKeysInMRUOrder() {
        // Traverse from head to tail
        const result = [];
        let curr = this.nodeNext[this.head];
        while (curr !== this.tail) {
            result.push(this.nodeKey[curr]);
            curr = this.nodeNext[curr];
        }
        return result;
    }
}
// Fix: add values map to the class properly
// Let me rewrite with values stored
class LRUCacheWithValues {
    constructor(capacity) {
        this.tail = 0;
        this.head = 1;
        this.nextNodeIndex = 2;
        this.capacity = capacity;
        this.keyToNodeIndex = new Map();
        this.values = new Map();
        this.nodePrev = [0, 0];
        this.nodeNext = [0, 0];
        this.nodeKey = ["", ""];
        this.nodePrev[1] = this.tail;
        this.nodeNext[0] = this.head;
    }
    addNodeAfter(key, afterIndex) {
        if (this.nextNodeIndex >= this.nodePrev.length) {
            // Expand arrays
            this.nodePrev.push(0);
            this.nodeNext.push(0);
            this.nodeKey.push("");
        }
        const newNodeIdx = this.nextNodeIndex;
        this.nextNodeIndex++;
        const nextOfAfter = this.nodeNext[afterIndex];
        this.nodeNext[afterIndex] = newNodeIdx;
        this.nodePrev[newNodeIdx] = afterIndex;
        this.nodePrev[nextOfAfter] = newNodeIdx;
        this.nodeNext[newNodeIdx] = nextOfAfter;
        this.nodeKey[newNodeIdx] = key;
        return newNodeIdx;
    }
    removeNode(nodeIdx) {
        const prevIdx = this.nodePrev[nodeIdx];
        const nextIdx = this.nodeNext[nodeIdx];
        this.nodeNext[prevIdx] = nextIdx;
        this.nodePrev[nextIdx] = prevIdx;
        this.nodePrev[nodeIdx] = 0;
        this.nodeNext[nodeIdx] = 0;
        this.nodeKey[nodeIdx] = "";
    }
    removeTailNode() {
        const lruNodeIdx = this.nodeNext[this.tail];
        const lruKey = this.nodeKey[lruNodeIdx];
        this.removeNode(lruNodeIdx);
        return lruKey;
    }
    moveToFront(key) {
        const nodeIdx = this.keyToNodeIndex.get(key);
        this.removeNode(nodeIdx);
        this.addNodeAfter(key, this.head);
    }
    put(key, value) {
        if (this.keyToNodeIndex.has(key)) {
            this.moveToFront(key);
            this.values.set(key, value);
        }
        else {
            if (this.keyToNodeIndex.size >= this.capacity) {
                const lruKey = this.removeTailNode();
                this.keyToNodeIndex.delete(lruKey);
                this.values.delete(lruKey);
            }
            const newNodeIdx = this.addNodeAfter(key, this.head);
            this.keyToNodeIndex.set(key, newNodeIdx);
            this.values.set(key, value);
        }
    }
    get(key) {
        if (!this.keyToNodeIndex.has(key)) {
            return -1;
        }
        this.moveToFront(key);
        return this.values.get(key);
    }
    del(key) {
        if (!this.keyToNodeIndex.has(key)) {
            return;
        }
        const nodeIdx = this.keyToNodeIndex.get(key);
        this.removeNode(nodeIdx);
        this.keyToNodeIndex.delete(key);
        this.values.delete(key);
    }
    getKeysInMRUOrder() {
        const result = [];
        let curr = this.nodeNext[this.head];
        while (curr !== this.tail) {
            result.push(this.nodeKey[curr]);
            curr = this.nodeNext[curr];
        }
        return result;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [capStr, nStr] = lines[0].split(" ");
    const capacity = parseInt(capStr, 10);
    const n = parseInt(nStr, 10);
    const cache = new LRUCacheWithValues(capacity);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const line = lines[i];
        const parts = line.split(" ");
        const op = parts[0];
        if (op === "GET") {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val);
        }
        else if (op === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === "DEL") {
            const key = parts[1];
            cache.del(key);
        }
    }
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    const remainingKeys = cache.getKeysInMRUOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(" "));
    }
}
main();
