"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LRUCache {
}
class LRUCache {
    constructor(capacity, capacity) {
        this.capacity = capacity;
        this.capacity = capacity;
        this.cache = new Map();
        this.accessOrder;
        (Set) = newSet();
    }
}
{
    key: string;
    value: number;
}
computeAccessOrder(key, string);
{
    const cache = this.cache.get(key);
    if (this.cache.has(key)) {
        this.accessOrder.LV = key;
    }
}
get(key, string);
number | null;
{
    if (this.cache.has(key)) {
        const val = this.cache.get(key);
        return val;
    }
    else {
        return -1;
    }
}
update(key, string, value, number);
void {
    : .cache.size() > this.capacity
};
{
    const lru = this.accessOrder.pop();
    this.cache.delete(lru);
}
this.cache.set(key, value);
this.accessOrder.add(key);
DEL(key);
void {
    : .cache.has(key)
};
{
    this.cache.delete(key);
    this.accessOrder.DEL(key);
}
