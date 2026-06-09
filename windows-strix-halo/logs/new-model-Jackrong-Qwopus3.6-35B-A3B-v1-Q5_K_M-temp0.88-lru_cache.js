"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}
class DoublyLinkedList {
    constructor() {
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addFirst(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next = node;
        node.next.prev = node;
    }
    remove(node) {
        const prevNode = node.prev;
        const nextNode = node.next;
        prevNode.next = nextNode;
        nextNode.prev = prevNode;
    }
    removeLast() {
        if (this.tail.prev === this.head) {
            return null;
        }
        const lastNode = this.tail.prev;
        this.remove(lastNode);
        return lastNode;
    }
    moveToFront(node) {
        this.remove(node);
        this.addFirst(node);
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.list = new DoublyLinkedList();
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.list.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.list.moveToFront(node);
        }
        else {
            if (this.map.size === this.capacity) {
                const lastNode = this.list.removeLast();
                if (lastNode) {
                    this.map.delete(lastNode.key);
                }
            }
            const newNode = new Node(key, value);
            this.list.addFirst(newNode);
            this.map.set(key, newNode);
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.list.remove(node);
            this.map.delete(key);
        }
    }
    getKeysInOrder() {
        const keys = [];
        let current = this.list.head.next;
        while (current !== this.list.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const firstLine = lines[0].split(" ");
    const capacity = parseInt(firstLine[0]);
    const n = parseInt(firstLine[1]);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const parts = lines[i].split(" ");
        const operation = parts[0];
        const key = parts[1];
        if (operation === "PUT") {
            const value = parseInt(parts[2]);
            cache.put(key, value);
        }
        else if (operation === "GET") {
            const result = cache.get(key);
            getResults.push(result.toString());
        }
        else if (operation === "DEL") {
            cache.del(key);
        }
    }
    const getOutput = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
    const keysInOrder = cache.getKeysInOrder();
    const keysOutput = keysInOrder.length > 0 ? keysInOrder.join(" ") : "EMPTY";
    console.log(getOutput);
    console.log(keysOutput);
}
main();
