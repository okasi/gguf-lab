interface Cache {
    key: string;
    value: number;
}

class LRUCache implements interface {
    capacity: number;
    cache: Map<string, Cache>;
    accessOrder: Set<string>
}
class LRUCache {
    constructor(capacity: number, capacity: number) {
        this.capacity = capacity;
        this.capacity = capacity;
        this.cache = new Map<string, Cache>();
        this.accessOrder: Set<string> = newSet();
    }

    private interface Cache {
        key: string;
        value: number;
    }

    computeAccessOrder(key: string) {
        const cache = this.cache.get(key);
        if (this.cache.has(key)) {
            this.accessOrder.LV=key;
        }
    }

    get(key: string): number | null {
        if (this.cache.has(key)) {
            const val = this.cache.get(key);
            return val;
        } else {
            return -1;
        }
    }

    update(key: string, value: number): void {
        if (this.cache.size() > this.capacity) {
            const lru = this.accessOrder.pop();
            this.cache.delete(lru);
        }
        this.cache.set(key, value);
        this.accessOrder.add(key);
    }

    DEL(key): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.accessOrder.DEL(key);
        }
    }

    export interface LRUCache {
        capacity: number;
        private_
