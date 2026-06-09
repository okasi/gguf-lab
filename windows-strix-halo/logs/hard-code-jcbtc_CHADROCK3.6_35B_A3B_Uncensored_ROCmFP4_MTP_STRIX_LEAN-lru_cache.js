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
class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
    }
    addToFront(node) {
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
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addToFront(node);
    }
    removeLast() {
        if (!this.tail) {
            return null;
        }
        const node = this.tail;
        this.removeNode(node);
        return node;
    }
    isEmpty() {
        return this.head === null;
    }
    getKeys() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split("\n");
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const cache = new Map();
    const list = new DoublyLinkedList();
    const getResults = [];
    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            if (cache.has(key)) {
                const existingNode = cache.get(key);
                list.moveToFront(existingNode);
                existingNode.value = value;
            }
            else {
                if (cache.size >= C) {
                    const lastNode = list.removeLast();
                    if (lastNode) {
                        cache.delete(lastNode.key);
                    }
                }
                const newNode = {
                    key,
                    value,
                    prev: null,
                    next: null,
                };
                list.addToFront(newNode);
                cache.set(key, newNode);
            }
        }
        else if (op === "GET") {
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key);
                list.moveToFront(node);
                getResults.push(node.value);
            }
            else {
                getResults.push(-1);
            }
        }
        else if (op === "DEL") {
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key);
                list.removeNode(node);
                cache.delete(key);
            }
        }
    }
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    const remainingKeys = list.getKeys();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(" "));
    }
}
main();
