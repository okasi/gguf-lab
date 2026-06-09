"use strict";
const fs = require('fs');
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    let ptr = 0;
    const C = parseInt(input[ptr++]);
    const N = parseInt(input[ptr++]);
    // Using a Map to store key -> {value, prev, next}
    // This simulates a Doubly Linked List for O(1) LRU
    const cache = new Map();
    let head = null; // Most Recently Used
    let tail = null; // Least Recently Used
    const results = [];
    function moveToFront(key) {
        const node = cache.get(key);
        if (node.prev === null)
            return; // Already head
        // Remove from current position
        if (node.next !== null) {
            cache.get(node.next).prev = node.prev;
        }
        else {
            tail = node.prev;
        }
        if (node.prev !== null) {
            cache.get(node.prev).next = node.next;
        }
        // Move to head
        node.prev = null;
        node.next = head;
        if (head !== null) {
            cache.get(head).prev = key;
        }
        head = key;
        if (tail === null)
            tail = key;
    }
    for (let i = 0; i < N; i++) {
        const op = input[ptr++];
        if (op === "PUT") {
            const key = input[ptr++];
            const val = parseInt(input[ptr++]);
            if (cache.has(key)) {
                const node = cache.get(key);
                node.value = val;
                moveToFront(key);
            }
            else {
                if (cache.size === C) {
                    if (tail !== null) {
                        cache.delete(tail);
                        if (tail.prev !== null) {
                            cache.get(tail.prev).next = null;
                            tail = tail.prev;
                        }
                        else {
                            head = null;
                            tail = null;
                        }
                    }
                }
                const newNode = { value: val, prev: null, next: head };
                if (head !== null) {
                    cache.get(head).prev = key;
                }
                head = key;
                if (tail === null)
                    tail = key;
                cache.set(key, newNode);
            }
        }
        else if (op === "GET") {
            const key = input[ptr++];
            if (cache.has(key)) {
                results.push(cache.get(key).value);
                moveToFront(key);
            }
            else {
                results.push(-1);
            }
        }
        else if (op === "DEL") {
            const key = input[ptr++];
            if (cache.has(key)) {
                const node = cache.get(key);
                if (node.prev !== null) {
                    cache.get(node.prev).next = node.next;
                }
                else {
                    head = node.next;
                }
                if (node.next !== null) {
                    cache.get(node.next).prev = node.prev;
                }
                else {
                    tail = node.prev;
                }
                cache.delete(key);
            }
        }
    }
    if (results.length === 0) {
        process.stdout.write("EMPTY\n");
    }
    else {
        process.stdout.write(results.join(" ") + "\n");
    }
    if (cache.size === 0) {
        process.stdout.write("EMPTY\n");
    }
    else {
        const finalKeys = [];
        let curr = head;
        while (curr !== null) {
            finalKeys.push(curr);
            const node = cache.get(curr);
            curr = node.next;
        }
        process.stdout.write(finalKeys.join(" ") + "\n");
    }
}
solve();
