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
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        // Dummy head and tail
        this.head = { key: "", value: 0, prev: null, next: null };
        this.tail = { key: "", value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addToFront(entry) {
        const next = this.head.next;
        entry.next = next;
        entry.prev = this.head;
        this.head.next = entry;
        next.prev = entry;
    }
    removeEntry(entry) {
        const prev = entry.prev;
        const next = entry.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
        entry.prev = null;
        entry.next = null;
    }
    moveToHead(entry) {
        this.removeEntry(entry);
        this.addToFront(entry);
    }
    evictLeastRecentlyUsed() {
        if (!this.tail || !this.tail.prev || this.tail.prev === this.head) {
            return;
        }
        const lru = this.tail.prev;
        if (lru) {
            this.removeEntry(lru);
            this.map.delete(lru.key);
        }
    }
    get(key) {
        const entry = this.map.get(key);
        if (!entry) {
            return null;
        }
        this.moveToHead(entry);
        return entry.value;
    }
    put(key, value) {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
        }
        else {
            if (this.map.size >= this.capacity) {
                this.evictLeastRecentlyUsed();
            }
            const newEntry = {
                key,
                value,
                prev: null,
                next: null
            };
            this.map.set(key, newEntry);
            this.addToFront(newEntry);
        }
    }
    del(key) {
        const entry = this.map.get(key);
        if (!entry) {
            return false;
        }
        this.removeEntry(entry);
        this.map.delete(key);
        return true;
    }
    getKeysMostRecentToLeast() {
        const keys = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        return;
    }
    const lines = input.split("\n");
    const firstLine = lines[0].trim().split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const numOps = parseInt(firstLine[1], 10);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= numOps && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const command = parts[0].toUpperCase();
        if (command === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (command === "GET") {
            const key = parts[1];
            const result = cache.get(key);
            if (result === null) {
                getResults.push("-1");
            }
            else {
                getResults.push(result.toString());
            }
        }
        else if (command === "DEL") {
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
    const remainingKeys = cache.getKeysMostRecentToLeast();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(" "));
    }
}
main();
