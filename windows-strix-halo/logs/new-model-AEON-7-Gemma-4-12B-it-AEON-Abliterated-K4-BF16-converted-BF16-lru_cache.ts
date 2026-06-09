const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\r?\n/);
    if (input.length === 0) return;

    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;
    const capacity = parseInt(firstLine[0]);
    const n = parseInt(firstLine[1]);

    // Using a Map to store keys and their values.
    // In JavaScript/TypeScript, the Map object maintains insertion order.
    // To simulate LRU:
    // - When a key is accessed or updated, delete it and re-insert it.
    // - The first entry in the Map is the least recently used.
    // - The last entry in the Map is the most recently used.
    const cache = new Map<string, number>();
    const getResults: number[] = [];

    for (let i = 1; i <= n; i++) {
        const line = input[i];
        if (!line) continue;
        const parts = line.trim().split(/\s+/);
        const op = parts[0];

        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2]);
            if (cache.has(key)) {
                cache.delete(key);
            } else if (cache.size >= capacity) {
                // Evict the first item (LRU)
                const firstKey = cache.keys().next().value;
                if (firstKey !== undefined) {
                    cache.delete(firstKey);
                }
            }
            cache.set(key, value);
        } else if (op === 'GET') {
            const key = parts[1];
            if (cache.has(key)) {
                const value = cache.get(key)!;
                getResults.push(value);
                // Update recency
                cache.delete(key);
                cache.set(key, value);
            } else {
                getResults.push(-1);
            }
        } else if (op === 'DEL') {
            const key = parts[1];
            if (cache.has(key)) {
                cache.delete(key);
            }
        }
    }

    // Output GET results
    if (getResults.length === 0) {
        process.stdout.write('EMPTY\n');
    } else {
        process.stdout.write(getResults.join(' ') + '\n');
    }

    // Output remaining keys (MRU to LRU)
    if (cache.size === 0) {
        process.stdout.write('EMPTY\n');
    } else {
        const keys = Array.from(cache.keys());
        // Map iteration is insertion order (LRU -> MRU)
        // We need MRU -> LRU, so reverse it.
        process.stdout.write(keys.reverse().join(' ') + '\n');
    }
}

solve();
