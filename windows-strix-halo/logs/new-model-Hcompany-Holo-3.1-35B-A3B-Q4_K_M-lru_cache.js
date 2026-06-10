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
        this.cache = new Map();
    }
    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
    del(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
    }
    keys() {
        return Array.from(this.cache.keys());
    }
}
const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [capacity, operations] = input.shift().split(' ').map(Number);
const cache = new LRUCache(capacity);
const getResults = [];
for (const line of input) {
    const [operation, key, value] = line.split(' ');
    if (operation === 'GET') {
        getResults.push(cache.get(Number(key)));
    }
    else if (operation === 'PUT') {
        cache.put(Number(key), Number(value));
    }
    else if (operation === 'DEL') {
        cache.del(Number(key));
    }
}
if (getResults.length > 0) {
    console.log(getResults.join(' '));
}
else {
    console.log('EMPTY');
}
const keys = cache.keys();
if (keys.length > 0) {
    console.log(keys.join(' '));
}
else {
    console.log('EMPTY');
}
