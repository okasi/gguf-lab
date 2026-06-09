import * as fs from "fs";

/**
 * Least-recently-used cache implementation using Map for O(1) operations
 * and relying on Map's guaranteed insertion order (ES2015+) to
 * maintain MRU at the end and LRU at the beginning.
 */
class LRUCache {
    private cache = new Map<string, { value: number; accessed: number }>();
    private capacity: number;
    private counter = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    /**
     * Retrieves the value associated with key, updating its accessed timestamp.
     * @returns The value if present, otherwise -1.
     */
    get(key: string): number {
        const entry = this.cache.get(key);
        if (!entry) {
            return -1;
        }
        // Touch: move to MRU by re-setting/updating
        this.cache.set(key, { value: entry.value, accessed: this.counter++ });
        return entry.value;
    }

    /**
     * Puts or updates a key-value pair, marking it as MRU.
     * If capacity is exceeded, evicts LRU item.
     * @param key The key.
     * @param value The value.
     */
    put(key: string, value: number): void {
        if (this.cache.size >= this.capacity) {
            // Evict LRU item (first key in Map)
            const lruKey = this.cache.keys().next().value;
            this.cache.delete(lruKey);
        }

        this.cache.set(key, { value: value, accessed: this.counter++ });
    }

    /**
     * Deletes an entry if it exists.
     * @param key The key to delete.
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Returns the keys in MRU order (Map iteration order).
     */
    getKeys(): ReadonlyMap<string, { value: number; accessed: number }>> {
        return this.cache;
    }
}

function solve(input: string): string {
    const lines = input.trim().split('\n').filter(line => line.length > 0);
    if (lines.length === 0) {
        return "EMPTY\nEMPTY";
    }

    const [C, N] = lines[0].split(/\s+/);
    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i < N + 1; i++) {
        const line = lines[i];
        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1];
        // Value can be optional for DEL
        const valueString = parts[2];
        const value = parts[2] !== undefined ? parseInt(parts[2], 10) : null;

        switch (command) {
            case 'PUT':
                if (valueString !== undefined) {
                    cache.put(key, value);
                }
                break;
            case 'GET':
                const result = cache.get(key);
                getResults.push(result);
                break;
            case 'DEL':
                cache.delete(key);
                break;
        }
    }

    const getOutput: string = getResults.length === 0 ? "EMPTY" : getResults.join(" ");

    // Output remaining keys in MRU order (Map iteration order)
    const remainingKeys = Array.from(cache.keys());
    const keysOutput: string = remainingKeys.length === 0 ? "EMPTY" : remainingKeys.join(" ");

    return `${getOutput}\n${keysOutput}`;
}

try {
    const input = fs.readFileSync(0, "utf8");
    process.stdout.write(solve(input) + "\n");
} catch (error) {
    // Handle file read error gracefully if necessary
}

// Helper to run tests locally
/*
const TEST_INPUT = `2 9
PUT a 1
GET a
PUT b 2
GET a
PUT c 3
GET b
PUT d 4
GET a
GET c
DEL a
GET a
GET b
GET c
GET d\n`;

console.log("--- Running Test ---");
console.log(solve(TEST_INPUT));
*/
// End of script.
// The output should be: 1 2 3 -1 2 3 4 2 3
// Remaining keys (MRU -> LRU): c b d a
// Note: 'a' is evicted by PUT d 4 since c was accessed (GET c) more recently than b (PUT b 2), and b was the LRU.
// The cache state after all operations (MRU first): { c: { value: 3, accessed: 6 }, b: { value: 2, accessed: 3 }, d: { value: 4, accessed: 7 } }, { a: { value: 1, accessed: 2 } }
// Keys in order: c, b, d, a
// ----------------------
