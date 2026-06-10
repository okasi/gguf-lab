"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Implementation of a Least Recently Used (LRU) Cache using a Map
 * and a Doubly Linked List (or in this case, a Map and careful management
 * to simulate the list operations efficiently).
 *
 * For O(1) operations, a Map for key lookup and a structure that maintains order
 * for usage tracking is required. In TypeScript/JavaScript, the standard
 * approach for O(1) LRU is a Map combined with a structure that allows moving an
 * accessed node to the front. Since we are restricted to standard structures
 * and need simplicity/performance, we will use a Map to store key -> node
 * references, and a custom structure to manage the usage order.
 *
 * A better structure for this problem is a Map where the value stores the
 * actual data, and we use a standard JavaScript array/list to track usage order
 * if we can manage the move operation efficiently.
 *
 * However, the standard implementation uses a Map and a Doubly Linked List (DLL).
 * Since we are mimicking this in a restricted environment, we will use a Map for O(1) access
 * and simulate the ordering using a structure that allows efficient insertion/deletion
 * at the head/tail, which is inherently what a DLL does.
 *
 * Given the constraints and the need for simplicity in a single script,
 * we will use a Map for key lookups and a custom class/structure that implicitly
 * maintains the usage order, or we must strictly adhere to the required complexity.
 *
 * We will use a Map for storage and a custom Doubly Linked List structure
 * implemented via Node objects to satisfy the O(1) constraint for move/evict.
 */
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.cache = new Map();
        this.capacity = capacity;
        this.head = null;
        this.tail = null;
    }
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            // Node was the head
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            // Node was the tail
            this.tail = node.prev;
        }
    }
    moveToHead(node) {
        if (this.head === node) {
            return; // Already MRU
        }
        this.removeNode(node);
        this.addNodeToHead(node);
    }
    addNodeToHead(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }
    put(key, value) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.cache.set(key, newNode);
            this.addNodeToHead(newNode);
            if (this.cache.size > this.capacity) {
                // Evict LRU (tail)
                if (this.tail) {
                    const lruNode = this.tail;
                    this.removeNode(lruNode);
                    this.cache.delete(lruNode.key);
                }
            }
        }
    }
    get(key) {
        const node = this.cache.get(key);
        if (node) {
            this.moveToHead(node);
            return node.value;
        }
        return -1;
    }
    del(key) {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
        }
    }
    getKeysLRU() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}
function solve() {
    const fs = require('fs');
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === "") {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    const [C_str, N_str] = input[0].trim().split(/\s+/);
    const C = parseInt(C_str);
    const N = parseInt(N_str);
    const cache = new LRUCache(C);
    const getResults = [];
    const getKeys = [];
    let getOperationCount = 0;
    for (let i = 1; i <= N; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const operation = parts[0];
        switch (operation) {
            case "PUT":
                const keyPut = parts[1];
                // Value must be parsed as signed 32-bit integer
                const valuePut = parseInt(parts[2], 10);
                cache.put(keyPut, valuePut);
                break;
            case "GET":
                const keyGet = parts[1];
                const result = cache.get(keyGet);
                getResults.push(result);
                if (result !== undefined) {
                    getKeys.push(keyGet);
                }
                getOperationCount++;
                break;
            case "DEL":
                const keyDel = parts[1];
                cache.del(keyDel);
                break;
        }
    }
    // Output 1: GET results
    const getOutput = getResults.map(r => r !== undefined ? r : -1).join(' ');
    console.log(getOutput);
    // Output 2: Remaining keys (MRU to LRU)
    const remainingKeys = cache.getKeysLRU();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(' '));
    }
}
solve();
