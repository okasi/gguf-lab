const value = cache.get(key);
            getResults.push(value);
            // move to end
            cache.delete(key);
            cache.set(key, value);
        else:
            getResults.push(-1);
   - DEL:
        if cache.has(key):
            cache.delete(key);

6. After processing, output:
   const firstLine = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
   const keys = Array.from(cache.keys()); // order: least to most recent
   const secondLine = keys.length > 0 ? keys.reverse().join(' ') : 'EMPTY';
   console.log(firstLine);
   console.log(secondLine);

But careful: When we evict, we need to remove the least recent key. In a Map, the order is insertion order, and the first key is the least recent. However, after we delete a key, the order of remaining keys stays the same. So getting the first key via iteration is fine. But we must be careful: after we delete a key, the first key might change. But we only need to delete one. So we can do:

if (cache.size === C) {
    // evict
    const firstKey = cache.keys().next().value; // This is O(1) because it just gets the first key? Actually, cache.keys() returns an iterator, .next() gives first entry. That should be O(1).
    cache.delete(firstKey);
}

But is cache.keys().next().value O(1)? In V8, likely yes because it just returns the first node. But we can also use a for...of loop with break; that also gets first quickly.

Alternatively, we can maintain a doubly linked list for O(1) removal of head, but using Map is simpler and should be fine within constraints.

Potential performance: For 300k operations, Map operations are fast. However, the evict step using keys().next() might be okay. But note: In some JS engines, iterating over Map keys may not be O(1) to get the first? Actually, the first element is accessible in O(1) because the Map's internal structure is a hash table with linked list for order; the first element is just the head of the list. So .next() should be O(1). So it's fine.

But we must be careful: When we delete a key, the order of the remaining keys is preserved. The first key after deletion is the next in order. So it's correct.

One nuance: When we do GET and move to end, we delete and set. That changes order: the key becomes last. That's correct.

Now, we need to ensure that the output format: "all GET results separated by spaces, or EMPTY if there were no GET operations." So if there were GET operations but some returned -1, we still output those numbers. So we just join.

Second line: "remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty." So if cache empty, output EMPTY.

Edge Cases:

- C can be up to 200k, N up to 300k.
- Keys may be reused.
- Values can be negative.

We should also consider that the input may have trailing spaces or empty lines. We'll trim each line.

Implementation in TypeScript: We'll write a class or just script.

We need to output only TypeScript code, no explanation, no Markdown fence. So we'll produce a plain TypeScript file content.

We'll include necessary imports: import * as fs from 'fs';.

Now, we must ensure O(1) amortized per operation. Using Map with delete+set for moving is O(1) average. However, some might argue that delete+set is two operations but still O(1). It's acceptable.

But there is a subtle issue: In JS, Map's order is based on insertion order, and when you delete and reinsert, it moves to end. That's exactly LRU. However, the spec says "a successful GET makes the key most recently used." So after GET, it becomes MRU. That's satisfied.

Now, we need to be careful about the eviction order: The least recently used is the one that hasn't been accessed for the longest time. In our Map, the first key is the least recently used because it was inserted earliest and never moved to end. When we access a key (GET or PUT existing), we move it to end, so it becomes more recent. So the order is correct.

Now, what about PUT for a key that already exists? We update value and move to end. That's correct.

Now, what about DEL? It just removes.

Now, we need to handle the case where C is large, but we might have many operations. The Map approach should be fine.

Potential pitfalls: The input may have extra whitespace. We'll split by space and ignore empty strings.

Now, we need to output two lines. Use console.log.

Now, let's write the TypeScript code.

We'll define a function main() and call it.

We'll read all input at once: const data = fs.readFileSync(0, 'utf8').trim(); const lines = data.split(/\r?\n/); But careful: if there are trailing newlines, trim first.

But note: The input may be large, so reading all at once is okay for 300k lines? 300k lines with maybe 10 chars each is about 3 MB, fine.

Alternatively, we could use readline, but fs.readFileSync is simpler.

We'll parse first line: const firstLine = lines[0].trim(); const [C, N] = firstLine.split(' ').map(Number);

Then loop i from 1 to N inclusive (since there are N operations). But lines may have more lines? We'll assume exactly N lines follow. But there might be extra empty lines at end; we can ignore.

We'll for (let i = 1; i <= N; i++) { const line = lines[i].trim(); if (!line) continue; // but we expect exactly N lines; maybe skip empty lines if any? Better to process only lines that start with an operation. But we can trust input.

We'll split line: const parts = line.split(/\s+/); const op = parts[0]; switch(op) { ... }

Now, we need to store getResults as number[].

Now, after loop, output.

Now, we must ensure that we use number for values, but note that values are signed 32-bit integers, so they fit.

Now, let's write code.

But we need to be careful about the eviction step: When we evict, we need to remove the least recent key. Using cache.keys().next().value is fine. However, we must ensure that we don't accidentally get undefined if cache is empty, but we only evict when size === C, and C >=1, so cache not empty.

Now, we also need to consider that after we delete the key, the cache size decreases, then we set new key, size becomes C again.

Now, we need to be careful about the order of operations in PUT: If key exists, we delete and set. That's fine. If not exists, we may need to evict before set. But we must check capacity before set. So:

if (cache.has(key)) {
    cache.delete(key);
} else if (cache.size === C) {
    // evict
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
}
cache.set(key, value);

But note: If key exists, we delete it, then set it. That reduces size by 1 then increases, net size unchanged. That's correct. If key doesn't exist and cache is full, we evict (size becomes C-1), then set (size becomes C). Good.

Now, for GET: if cache.has(key), we get value, then delete and set to move to end. That's two operations but fine.

Now, for DEL: if cache.has(key), cache.delete(key).

Now, we need to output keys in reverse order. We'll get keys: const keys = Array.from(cache.keys()); This yields least to most recent. Then reverse.

Now, we need to ensure that we output "EMPTY" exactly.

Now, we should test with a simple example.

Example input:
5 10
PUT 1 10
PUT 2 20
PUT 3 30
GET 1
GET 4
PUT 4 40
PUT 5 50
PUT 6 60
GET 2
DEL 3
GET 2

Let's simulate:

C=5.

1. PUT 1 10 -> cache: {1:10}
2. PUT 2 20 -> {1:10,2:20}
3. PUT 3 30 -> {1:10,2:20,3:30}
4. GET 1 -> present, value=10, output 10, move to end: delete 1, set 1:10 -> order: 2,3,1 (since 2 and 3 were inserted earlier, then 1 moved to end). Actually after step3 order: 1,2,3 (insertion order). After GET 1: delete 1, then set 1:10, so order becomes 2,3,1. So MRU is 1.
5. GET 4 -> not present, output -1.
6. PUT 4 40 -> cache size=3, not full, insert 4:40 -> order: 2,3,1,4 (since 4 added at end). Actually after step4 order: 2,3,1. Insert 4: order: 2,3,1,4.
7. PUT 5 50 -> size=4, insert 5: order: 2,3,1,4,5.
8. PUT 6 60 -> size=5, full. Need evict least recent: first key is 2. Delete 2. Then insert 6: order: 3,1,4,5,6. (Because after delete 2, order becomes 3,1,4,5; then add 6 at end: 3,1,4,5,6)
9. GET 2 -> not present (evicted), output -1.
10. DEL 3 -> remove 3: order becomes 1,4,5,6.
11. GET 2 -> not present, output -1? Wait, step11 is GET 2 after DEL 3. So output -1.

But the example input says 10 operations, but we have 11? Let's recount: The example I gave has 11 lines after first? Actually I wrote 10 operations but listed 11? Let's recount: lines: PUT1, PUT2, PUT3, GET1, GET4, PUT4, PUT5, PUT6, GET2, DEL3, GET2 -> that's 11. But N=10, so maybe I miscount. Let's adjust: Suppose N=10, then we have 10 operations. I'll create a simpler test.

But anyway, the algorithm seems correct.

Now, we need to ensure that the output for GET results is in order of operations.

Now, we need to handle large inputs efficiently. Using split on whole input might create a large array of lines, but that's okay for 300k lines. However, we can also process line by line using a stream, but not necessary.

Now, we should consider memory: Map with up to 200k entries, each entry a string key and number value. That's fine.

Now, we need to output keys in reverse order. Using Array.from(cache.keys()) creates an array of up to 200k strings, then reverse, then join. That's okay.

Now, we should be careful about the case where there are no GET operations: getResults.length === 0, output "EMPTY". That's correct.

Now, we need to ensure that we treat keys as strings, not numbers. The input keys are strings without spaces, could be numeric but we treat as strings.

Now, we need to ensure that we don't accidentally treat keys as numbers when they are numbers; but it's fine.

Now, we should consider the possibility that the input may have extra spaces between parts. Using split(/\s+/) handles multiple spaces.

Now, we need to write TypeScript code with proper types.

We'll define:

import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0].split(/\s+/).map(Number);
    const C = firstLine[0];
    const N = firstLine[1];

    const cache = new Map<string, number>();
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (!line) continue; // skip empty lines if any
        const parts = line.split(/\s+/);
        const op = parts[0];
        const key = parts[1];
        switch (op) {
            case 'PUT': {
                const value = Number(parts[2]);
                if (cache.has(key)) {
                    cache.delete(key);
                } else if (cache.size === C) {
                    // evict least recent
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                cache.set(key, value);
                break;
            }
            case 'GET': {
                if (cache.has(key)) {
                    const value = cache.get(key);
                    getResults.push(value);
                    // move to end
                    cache.delete(key);
                    cache.set(key, value);
                } else {
                    getResults.push(-1);
                }
                break;
            }
            case 'DEL': {
                if (cache.has(key)) {
                    cache.delete(key);
                }
                break;
            }
            default:
                // ignore?
                break;
        }
    }

    const firstOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const keys = Array.from(cache.keys());
    const secondOutput = keys.length > 0 ? keys.reverse().join(' ') : 'EMPTY';

    console.log(firstOutput);
    console.log(secondOutput);
}

main();

Now, we need to ensure that we don't have any off-by-one errors with lines indices. If input has trailing newline, lines may have an extra empty string at the end. But we only loop up to N, and we skip empty lines if encountered. However, if there is an empty line among the operations, it might be counted as an operation? The problem says N lines are operations, so there should be exactly N non-empty lines. So we can assume lines[i] exists and is non-empty. But to be safe, we can skip empty lines and not count them as operations? But that would mess up N. Better to just process lines[1] to lines[N] and assume they are valid. If there is an extra newline at the end, lines[N+1] may be empty, but we don't access it. So it's fine.

But we need to ensure that we have enough lines. If the input has fewer lines than N+1, we might get undefined. But we can trust input.

Alternatively, we can use a more robust approach: read lines with a while loop, but not needed.

Now, we should consider the performance of split(/\s+/) on each line. That's fine.

Now, we need to ensure that we treat values as numbers, but they could be negative. Number() handles that.

Now, we need to ensure that we output -1 for missing keys, not something else.

Now, we need to ensure that we output keys in the correct order: most recent first. Our reverse does that.

Now, we should test with a small example.

Test 1:

Input:
3 5
PUT a 1
PUT b 2
PUT c 3
GET a
GET d

Expected:
GET results: 1 and -1 -> "1 -1"
After operations: cache contains a, b, c? Let's simulate:

C=3.

1. PUT a 1 -> {a:1}
2. PUT b 2 -> {a:1, b:2}
3. PUT c 3 -> {a:1, b:2, c:3}
4. GET a -> present, value=1, output 1, move to end: delete a, set a:1 -> order: b, c, a (since b and c were inserted earlier, then a moved to end). So MRU is a.
5. GET d -> not present, output -1.

Cache after: order b, c, a (least to most recent). So most recent first: a, c, b. So second line: "a c b".

Our code would produce: firstOutput "1 -1", secondOutput "a c b". Good.

Test 2: No GET operations.

Input:
2 2
PUT x 10
PUT y 20

Expected: first line "EMPTY", second line "y x" (since y inserted after x, so MRU is y). Our code: getResults empty -> "EMPTY". keys = ["x","y"] (order x then y). reverse -> ["y","x"] -> "y x". Good.

Test 3: DEL operation.

Input:
2 3
PUT a 1
PUT b 2
DEL a
GET a

Expected: After PUT a, PUT b, cache order a,b. DEL a removes a, cache order b. GET a -> -1. So first line "-1". Second line: cache has b -> "b". Our code: after DEL a, cache.delete('a'), order remains b. GET a -> -1. keys = ["b"], reverse -> ["b"] -> "b". Good.

Test 4: Eviction.

Input:
2 4
PUT a 1
PUT b 2
PUT c 3
GET a

Simulate: C=2.

1. PUT a 1 -> {a:1}
2. PUT b 2 -> {a:1, b:2} (order a,b)
3. PUT c 3 -> cache full, evict least recent = a, then set c:3 -> order b,c (since after evict a, order is b; then add c -> b,c)
4. GET a -> not present (evicted), output -1.

First line: "-1". Second line: cache has b,c; order b,c (least to most recent: b then c). Most recent first: c,b -> "c b". Our code: after PUT c, we evict a, then set c. So cache: b,c. GET a -> -1. keys = ["b","c"] -> reverse -> ["c","b"] -> "c b". Good.

Now, we should consider that the eviction uses cache.keys().next().value. In step 3, when we evict, we get firstKey = 'a'. That works.

Now, we need to ensure that we handle the case where C=1.

Input:
1 3
PUT a 1
GET a
PUT b 2

Simulate: C=1.

1. PUT a 1 -> {a:1}
2. GET a -> present, value=1, output 1, move to end (but only one element, order unchanged). So still {a:1}.
3. PUT b 2 -> cache full, evict least recent = a, then set b:2 -> {b:2}.

First line: "1". Second line: "b". Our code: after GET a, we delete and set a, still only a. Then PUT b: cache.has(b)? false, cache.size===1, evict firstKey = 'a', then set b. So keys = ["b"] -> reverse -> "b". Good.

Now, we need to consider that the input might have keys that are the same as operation names like "PUT", "GET", "DEL". That's fine, they are just strings.

Now, we should think about performance: For 300k operations, each operation does a few Map operations. That's fine.

But there is a potential issue: In the eviction step, we use cache.keys().next().value. In some JavaScript implementations, this might not be O(1) if the Map is implemented as a hash table with a linked list for order, but the first element is just the head of the list, so it should be O(1). However, to be absolutely safe, we could maintain a doubly linked list ourselves. But given constraints and typical JS engines, it's likely fine. But we can also implement a custom LRU using a doubly linked list and a Map for O(1) guaranteed. However, the problem says O(1) amortized per operation, and using Map with delete+set is amortized O(1) because delete and set are O(1) average. But the eviction using keys().next() might be O(1) as well. So it's acceptable.

But let's consider: In V8, Map is implemented as a hash table with a linked list for insertion order. The first element is stored as a pointer, so .next() should be O(1). So it's fine.

Now, we need to ensure that we don't use any external libraries, just standard Node.js.

Now, we need to output only TypeScript code, no explanation, no Markdown fence. So we'll output the code as plain text.

Now, we might want to add some type annotations for clarity, but not required.

Now, we should also consider that the input may be large and reading all at once might cause memory issues? 300k lines is about 3-4 MB, fine.

Now, we can finalize.

But wait: The problem says "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8")." So we are doing that.

Now, we need to ensure that we handle the case where there might be carriage returns. We split by /\r?\n/.

Now, we need to ensure that we don't have any console.log extra.

Now, we should test with a sample that includes negative values.

Input:
2 4
PUT a -1
PUT b -2
GET a
GET b

Expected: GET results: -1 -2; cache order after GET a: delete a, set a -> order b,a; GET b: present, value -2, move to end: delete b, set b -> order a,b. So final order a,b (least to most recent). Most recent first: b,a. So second line "b a". Our code: after PUT a,b, order a,b. GET a: delete a, set a -> order b,a. GET b: delete b, set b -> order a,b. So keys = ["a","b"] -> reverse -> ["b","a"] -> "b a". Good.

Now, we should also consider that the output for GET results should be separated by spaces, not commas. We use join(' ').

Now, we should consider that the output for keys should be separated by spaces.

Now, we need to ensure that we don't have trailing spaces.

Now, we should also consider that the input may have leading/trailing spaces on lines. We trim each line.

Now, we should also consider that the first line may have extra spaces. We split by /\s+/.

Now, we should also consider that N may be 0? But constraints say 1 <= N, so at least one operation.

Now, we should also consider that C may be 0? But 1 <= C, so at least 1.

Now, we should also consider that the number of operations may be less than N? No.

Now, we should also consider that we might need to handle the case where the input contains Windows line endings (\r\n). Our split handles that.

Now, we should also consider that we might need to use process.stdin.read instead of fs.readFileSync? But the requirement says use fs.readFileSync(0, "utf8"). So we are good.

Now, we should also consider that the code should be a complete TypeScript program, so we need to include the import and the main invocation.

Now, we should also consider that we might need to set the environment to Node.js, but that's assumed.

Now, we should also consider that we might need to use strict mode? Not required.

Now, we should also consider that we might need to handle potential errors, but not needed.

Now, we should also consider that we might want to use a faster I/O method, but not necessary.

Now, we can produce the final code.

But before finalizing, let's double-check the eviction logic: When we evict, we need to remove the least recently used key. In our Map, the order is based on insertion order, and the first key is the least recently used. However, after we delete a key (e.g., during GET or PUT existing), the order of the remaining keys is preserved, and the first key becomes the next least recently used. So it's correct.

But there is a nuance: When we do a GET on a key, we delete it and then set it. This temporarily removes the key, which might affect the order of other keys? No, because we delete it and then add it at the end. The order of other keys remains the same relative to each other. So the first key remains the same unless the key we accessed was the first key. If we access the first key (the least recently used), then after deletion, the new first key becomes the second key, which is the next least recently used. That's correct because after accessing that key, it becomes most recent, so it should no longer be the least recent. So the eviction logic still works: if later we need to evict, we will evict the new first key, which is the least recent among the remaining.

Thus, it's correct.

Now, we should also consider that when we evict, we use cache.keys().next().value. This gets the first key. But if the cache is empty, this would throw, but we only evict when size === C and C >=1, so not empty.

Now, we should also consider that we might need to handle the case where the key is a string that could be a reserved word? Not an issue.

Now, we should also consider that we might need to ensure that the output for keys is in the correct order when there are duplicate keys? Not possible.

Now, we should also consider that the problem might require that we output the keys in the order of most recent to least recent, which is reverse of insertion order. Our reverse does that.

Now, we should also consider that we might need to output "EMPTY" if no GET operations, but also if cache empty, second line "EMPTY". That's fine.

Now, we should also consider that the input may have extra lines after N operations. We ignore them by only processing up to N lines.

Now, we should also consider that we might need to parse the first line as two numbers, but there could be more numbers? No.

Now, we should also consider that we might need to handle the case where the first line has only C and N, but there might be extra spaces. We split by whitespace, so fine.

Now, we should also consider that we might need to use BigInt for values? No, they fit in 32-bit signed, which fits in JS numbers (which are double-precision, but can exactly represent integers up to 2^53, so fine).

Now, we should also consider that we might need to handle the case where the value is something like "-0"? That's 0, fine.

Now, we should also consider that we might need to ensure that we don't have any floating point issues; we treat values as numbers.

Now, we should also consider that we might need to use a different approach for eviction to avoid using cache.keys().next() which might be considered O(n) in some implementations? I doubt it. But to be absolutely safe, we could implement a doubly linked list. However, the problem says O(1) amortized, and using Map with delete+set is amortized O(1). The eviction using keys().next() is O(1) in V8. But if we want to be 100% sure, we could implement a custom LRU with a doubly linked list and a Map. That would also be O(1) and not rely on Map order. But it's more code. However, the problem likely expects a standard LRU implementation. Since the requirement is to write a complete TypeScript program, either approach is fine. But we need to ensure that we meet O(1) amortized. The Map approach is amortized O(1) because delete and set are O(1) average. But the eviction using keys().next() might be O(1) as well. So it's acceptable.

But I recall that in some JavaScript engines, Map iteration order is guaranteed, but accessing the first key might be O(1) because it's just a pointer. So it's fine.

However, there is a subtle point: When we delete a key from the Map, the internal order of the remaining keys is preserved, but the "first" key might change if we delete the first key. But we only delete the first key during eviction, which is fine. But if we delete some other key (e.g., during GET or PUT existing), that doesn't affect the first key unless we delete the first key. So the first key remains the same until it is either accessed (and moved to end) or evicted. So it's consistent.

Now, we should also consider that we might need to handle the case where the cache capacity is large and we have many operations, and the Map's internal rebalancing might cause occasional O(log n) operations, but amortized O(1). So it's fine.

Now, we should also consider that we might need to use a more efficient way to get the first key: We could maintain a separate variable for the least recent key, but that would require updating it on deletions and accesses, which is more complex. So we stick with Map.

Now, we should also consider that we might need to ensure that we don't have any memory leaks or performance issues.

Now, we can produce the final code.

But before final, let's think about potential pitfalls:

- The input may have leading/trailing spaces on lines. We trim each line, but if a line has only spaces, it might be considered empty. But we assume it's an operation line, so it should have at least three tokens for PUT, two for GET/DEL. So it's fine.

- The first line might have more than two numbers? No.

- The number of operations N might be larger than the number of lines provided? We'll assume valid input.

- The keys may contain uppercase/lowercase, but case-sensitive.

- The values may be negative, and we need to output -1 for missing keys. That's fine.

- The output for GET results should be in the order of GET operations, even if they are interspersed with other operations.

- The second line should list keys in order from most recent to least recent, i.e., reverse of insertion order after all operations.

Now, we should also consider that after we process all operations, the cache may contain keys that were inserted and never accessed. Their order is based on insertion order, with the most recently inserted at the end. So reverse gives most recent first.

Now, we should also consider that if we have many operations, the array getResults might be large, but joining is fine.

Now, we should also consider that we might need to use a faster output method, but console.log is fine.

Now, we should also consider that we might need to use process.stdout.write for performance, but not necessary.

Now, we can finalize.

But wait: The problem says "Return only TypeScript code, no explanation and no Markdown fence." So we should output just the code.

Now, I'll produce the final code.

One more thing: We need to ensure that we import fs correctly. In TypeScript, we need to have the fs module available. In a Node.js TypeScript project, we would need to have @types/node installed, but the code itself just uses import. The environment might have it. We'll assume it's okay.

Alternatively, we could use require, but TypeScript prefers ES modules. We'll use import.

Now, the code:

import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0].split(/\s+/).map(Number);
    const C = firstLine[0];
    const N = firstLine[1];

    const cache = new Map<string, number>();
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        const op = parts[0];
        const key = parts[1];
        switch (op) {
            case 'PUT': {
                const value = Number(parts[2]);
                if (cache.has(key)) {
                    cache.delete(key);
                } else if (cache.size === C) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                cache.set(key, value);
                break;
            }
            case 'GET': {
                if (cache.has(key)) {
                    const value = cache.get(key);
                    getResults.push(value);
                    cache.delete(key);
                    cache.set(key, value);
                } else {
                    getResults.push(-1);
                }
                break;
            }
            case 'DEL': {
                if (cache.has(key)) {
                    cache.delete(key);
                }
                break;
            }
        }
    }

    const firstOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const keys = Array.from(cache.keys());
    const secondOutput = keys.length > 0 ? keys.reverse().join(' ') : 'EMPTY';

    console.log(firstOutput);
    console.log(secondOutput);
}

main();

Now, we should consider that the split(/\s+/) on the first line might produce an array with more than two elements if there are extra numbers, but we only take first two. That's fine.

Now, we should also consider that we might need to handle the case where the input has fewer lines than N+1. We'll just let it throw, but we can add a check: if (i >= lines.length) break; but not needed.

Now, we can finalize.

But wait: The problem says "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8")." So we are doing that.

Now, we should also consider that the program should be self-contained and run in Node.js.

Now, we can output the code.

But before output, we should test with a few examples manually.

Example 1:

Input:
5 10
PUT 1 10
PUT 2 20
PUT 3 30
GET 1
GET 4
PUT 4 40
PUT 5 50
PUT 6 60
GET 2
DEL 3
GET 2

Let's simulate with our code.

C=5.

Operations:

1. PUT 1 10 -> cache: {1:10}
2. PUT 2 20 -> {1:10,2:20}
3. PUT 3 30 -> {1:10,2:20,3:30}
4. GET 1 -> has, value=10, push 10, delete 1, set 1:10 -> order: 2,3,1
5. GET 4 -> not has, push -1
6. PUT 4 40 -> not has, size=3, not full, set 4:40 -> order: 2,3,1,4
7. PUT 5 50 -> set 5:50 -> order: 2,3,1,4,5
8. PUT 6 60 -> size=5, full, evict firstKey = 2, delete 2, set 6:60 -> order: 3,1,4,5,6
9. GET 2 -> not has (evicted), push -1
10. DEL 3 -> delete 3 -> order: 1,4,5,6
11. GET 2 -> not has, push -1

But wait, there are 11 operations? The input says N=10, but we have 11 lines after first? Actually the input I wrote has 10 operations? Let's count: after first line, there are 10 lines? Let's list: 1. PUT 1 10, 2. PUT 2 20, 3. PUT 3 30, 4. GET 1, 5. GET 4, 6. PUT 4 40, 7. PUT 5 50, 8. PUT 6 60, 9. GET 2, 10. DEL 3, 11. GET 2. That's 11 lines. So N should be 11 if we include all. So my example is inconsistent. Let's adjust to N=11. But that's fine.

Anyway, the code would process 11 operations if N=11. So it's fine.

Now, the GET results: 10, -1, -1, -1? Actually we have GET at step4:10, step5:-1, step9:-1, step11:-1 => four GET results: 10 -1 -1 -1. But step9 and step11 are after DEL 3, both GET 2, so -1. So first line: "10 -1 -1 -1". After all operations, cache keys: order after step10: 1,4,5,6 (since we deleted 3). After step11 GET 2 (not present), cache unchanged. So keys: 1,4,5,6 (least to most recent). Most recent first: 6,5,4,1. So second line: "6 5 4 1". That seems plausible.

Now, let's test with a simpler example that matches the problem statement maybe.

But we trust.

Now, we should also consider that the problem might have a specific output format: "all GET results separated by spaces, or EMPTY if there were no GET operations." So if there are GET operations but all return -1, we still output those -1s.

Now, we should also consider that the second line should list keys in order from most-recently-used to least-recently-used. That's what we do.

Now, we should also consider that the cache capacity C can be up to 200k, and N up to 300k, so our Map approach should be fine.

Now, we can output the code.

But before final, I want to double-check the eviction logic when we have a PUT for an existing key and the cache is full? Actually, if the key exists, we delete it first, then set it. That reduces size by 1, then we set, size returns to same. So we don't need to evict because the key is already in the cache. So the else if (cache.size === C) only triggers when the key is not present. That's correct.

Now, we should also consider that when we evict, we use cache.keys().next().value. But if the cache is full and we are inserting a new key, we need to evict the least recent. That's fine.

Now, we should also consider that the order of keys after eviction: we delete the first key, then set the new key at the end. That's correct.

Now, we should also consider that the input might have keys that are numbers, but we treat them as strings. That's fine.

Now, we should also consider that the output for keys should be the keys as they appear, not modified.

Now, we should also consider that we might need to handle the case where the input contains empty lines between operations. Our code skips empty lines (if (!line) continue;). But if we skip an empty line, we might not process N operations if we only count non-empty lines? But we are looping i from 1 to N, and we assume lines[i] corresponds to the i-th operation. If there is an empty line, then lines[i] might be empty, and we skip it, but we still increment i, so we would miss an operation. That would be wrong. So we should not skip empty lines; we should treat them as invalid? The problem says each line is an operation, so there should be no empty lines. So we can assume no empty lines. However, to be robust, we could read lines until we have processed N operations, ignoring empty lines. But that would complicate. Since the input is guaranteed, we can just process lines[i] directly. But if there is an accidental empty line, it would cause parts[0] to be undefined, leading to error. So we can add a check: if (line === '') { i--; continue; } to skip empty lines and not count them as operations. But that would change the count of operations. Actually, if we skip an empty line, we still need to process N operations, so we should not count that line as an operation. So we could use a separate counter for operations processed, and read lines sequentially, ignoring empty lines. That might be safer. But the problem says "Next N lines are one of: ...", so we can trust that there are exactly N non-empty lines. So we can just process lines[1] to lines[N] without skipping.

But what if there is a trailing newline that creates an extra empty line at the end? That would be lines[N+1] maybe, but we don't access it. So it's fine.

Thus, we can remove the `if (!line) continue;` to avoid accidentally skipping a line that is supposed to be an operation but is empty (which shouldn't happen). But if there is an empty line, it would cause an error. I'd rather keep the check but decrement i if we skip? Actually, we can do: while i <= N and lines[i] is empty, i++ and continue? But that would skip lines and not process them as operations, which would be wrong if an empty line is not supposed to be there. So better to assume no empty lines. I'll remove the `if (!line) continue;` and just use line.trim() and split. If line is empty, parts[0] will be undefined, causing error. But that's acceptable because input is guaranteed.

I'll keep the trim but not skip.

But I'll keep the `if (!line) continue;`? Actually, if line is empty, trim returns '', and split(/\s+/) on '' returns ['']? Let's test: ''.split(/\s+/) returns ['']? Actually, in JS, ''.split(/\s+/) returns [''] because the string is empty, the split returns an array containing the empty string. So parts[0] would be '', which is not a valid operation. So it would fall through to default and not process, but we would have missed an operation. So better to not skip.

Thus, I'll remove the `if (!line) continue;` and just process.

But to be safe, we can add a check: if (line.length === 0) { i--; continue; } to skip empty lines and not count them as operations. But that would change the number of operations processed if there are extra empty lines. However, the problem says N lines, so there shouldn't be extra empty lines. So I'll just not handle empty lines.

I'll remove the `if (!line) continue;` and just do:

const line = lines[i].trim();
const parts = line.split(/\s+/);
if (parts.length < 2) { /* error */ } // but not needed.

But to avoid runtime error, we can just assume valid.

I'll keep it simple.

Now, final code.

But wait: The problem says "Return only TypeScript code, no explanation and no Markdown fence." So we should output the code as plain text.

Now, I'll produce the final answer.

But before final, I want to consider if there is any more efficient way to get the first key. We could maintain a variable `leastRecent` that is updated on deletions and accesses. But that's more complex. So we stick with Map.

Now, I'll output the code.

However, I realize that in the PUT case when the key exists, we delete and then set. That's two operations. But we could also just update the value and then move to end by delete and set. That's fine.

Now, we should also consider that in the GET case, we do cache.delete(key) and cache.set(key, value). That's also two operations.

Now, we should also consider that the Map's order might be affected by the delete and set operations, but it's as intended.

Now, we can finalize.

One more thing: The problem says "O(1) amortized per operation." Our implementation is amortized O(1) because Map operations are O(1) average. However, some might argue that delete and set are two O(1) operations, still O(1). So fine.

Now, I'll produce the final code.

But I want to test with a small script mentally.

Input:
2 3
PUT a 1
PUT b 2
GET a

Our code:

- lines[0] = "2 3", C=2,N=3.
- i=1: line="PUT a 1", op=PUT, key="a", value=1. cache.has? false, size=0 !=2, set. cache={a:1}.
- i=2: line="PUT b 2", op=PUT, key="b", value=2. cache.has? false, size=1 !=2, set. cache={a:1, b:2} (order a,b).
- i=3: line="GET a", op=GET, key="a". cache.has true, value=1, push 1, delete a, set a:1 -> cache={b:2, a:1} (order b,a). getResults=[1].
After loop, firstOutput = "1". keys = Array.from(cache.keys()) = ["b","a"], reverse -> ["a","b"], secondOutput = "a b". But is that correct? After GET a, the most recent is a, then b. So most recent first: a, b. So second line should be "a b". That matches.

Now, test with eviction:

Input:
2 4
PUT a 1
PUT b 2
PUT c 3
GET a

Our code:

- PUT a -> {a:1}
- PUT b -> {a:1, b:2}
- PUT c -> cache.full, evict firstKey = 'a', delete a, set c:3 -> {b:2, c:3} (order b,c)
- GET a -> not has, push -1, getResults=[-1]
After loop, firstOutput = "-1". keys = ["b","c"], reverse -> ["c","b"], secondOutput = "c b". That's correct: after PUT c, cache order b (least), c (most). So most recent first: c, b. Good.

Now, test with DEL:

Input:
2 3
PUT a 1
PUT b 2
DEL a
GET a

Our code:

- PUT a -> {a:1}
- PUT b -> {a:1, b:2}
- DEL a -> delete a -> {b:2} (order b)
- GET a -> not has, push -1, getResults=[-1]
After loop, firstOutput = "-1". keys = ["b"], reverse -> ["b"], secondOutput = "b". Correct.

Now, test with no GET:

Input:
2 2
PUT a 1
PUT b 2

Our code:

- PUT a -> {a:1}
- PUT b -> {a:1, b:2}
After loop, getResults=[], firstOutput = "EMPTY". keys = ["a","b"], reverse -> ["b","
