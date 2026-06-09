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
        this.usageOrder = new Map();
        this.timestamp = Date.now();
        this.lastAccess = 0;
        this.usageOrder.set(null, this.timestamp);
    }
    /**
     * O(1) amortized. Moves key to most recently used position.
     */
    access(key) {
        const now = Date.now();
        this.usageOrder.set(key, now);
    }
    /**
     * O(1) amortized. Returns value or undefined.
     */
    get(key) {
        const value = this.map.get(key);
        if (value !== undefined) {
            this.access(key);
            return value;
        }
        return undefined;
    }
    /**
     * O(1) amortized. Puts new item or updates existing.
     */
    put(key, value) {
        this.map.set(key, value);
        this.access(key);
        if (this.map.size > this.capacity) {
            this.evict();
        }
    }
    /**
     * O(1) amortized. Removes key.
     */
    delete(key) {
        const oldValue = this.map.delete(key);
        if (oldValue !== undefined) {
            this.usageOrder.delete(key);
            return true;
        }
        return false;
    }
    /**
     * O(1) amortized. Evicts LRU item.
     */
    evict() {
        const lruKey = this.usageOrder.keys().next().value;
        this.map.delete(lruKey);
        this.usageOrder.delete(lruKey);
    }
    /**
     * Returns keys in MRU to LRU order.
     */
    getKeysInOrder() {
        const keys = Array.from(this.usageOrder.keys());
        return keys.reverse();
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');
    const [C, N] = lines[0].trim().split(/\s+/).map(Number);
    const getResults = [];
    const usageOrder = new LRUCache(C);
    for (let i = 1; i <= N; i++) {
        const parts = lines[i].trim().split(/\s+/);
        const command = parts[0];
        const key = parts[1];
        switch (command) {
        }
        {
            'PUT';
            const value = parseInt(parts[2], 10);
            usageOrder.put(key, value);
            break;
            'GET';
            const result = usageOrder.get(key);
            getResults.push(result === undefined ? -1 : result);
            break;
            'DEL';
            return usageOrder.delete(key);
            break;
        }
    }
    console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
    console.log(usageOrder.getKeysInOrder().length > 0 ? usageOrder.getKeysInOrder().join(' ') : 'EMPTY');
}
solve();
