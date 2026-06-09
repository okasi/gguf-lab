"use strict";
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
class DoublyLinkedList {
    constructor() {
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    pushFront(key, value) {
        const node = new Node(key, value);
        const first = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = first;
        first.prev = node;
    }
    remove(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev)
            prev.next = next;
        if (next)
            next.prev = prev;
    }
    moveToFront(key, value) {
        // But we need to know the node; we will have map to node.
        // Actually we can first remove then pushFront, but we can also just remove and then pushFront.
        // However, we need to update value if key exists. So we will have separate update.
    }
    popBack() {
        // remove the node before tail
        if (this.tail.prev === this.head)
            return null;
        const node = this.tail.prev;
        this.remove(node);
        return node;
    }
}
But;
moveToFront;
can;
be;
done;
by;
first;
removing;
node, then;
pushFront;
with (same)
    key;
and;
value.But;
if (we)
    have;
node;
reference, we;
can;
just;
remove;
it;
and;
then;
pushFront.So;
we;
need;
a;
method;
removeNode(node);
and;
pushFront(key, value).So;
we;
can;
do
    : remove(node);
while (pushFront(key, value).That);
's fine.;
Alternatively, we;
can;
implement;
a;
method;
that;
moves;
existing;
node;
to;
front;
without;
creating;
a;
new node;
just;
remove;
it;
and;
then;
insert;
at;
front.But;
we;
already;
have;
remove, then;
pushFront.That;
's O(1). Good.;
Now;
Cache: class LRUCache {
    constructor(capacity) {
        this.Processing = 1;
        this.N = 3.;
        this.capacity = capacity;
        this.map = new Map();
        this.list = new DoublyLinkedList();
    }
    get(key) {
        const env_2 = { stack: [], error: void 0, hasError: false };
        try {
            const node = this.map.get(key);
            if (!node)
                return -1;
            // move to front
            this.list.remove(node);
            this.list.pushFront(key, node.value);
            // But we need to update map entry? The node is removed and a new node created, so map now points to old node? Actually we removed the node from map? No, we didn't remove from map. We have map entry pointing to the old node. After removal, the old node is no longer in list, but map still points to it. That's a problem. We need to either update map to point to the new node, or better: we should not create a new node; instead we should just move the existing node to front by adjusting pointers, and also update its value if needed. But in this get, we only need to move to front, not change value. So we can just remove the node from its current position and then insert it at front. That way we reuse the same node object. So we need a method to move a node to front without creating a new node. Let's implement:
            moveToFront(node, Node);
            {
                this.list.remove(node);
                this.list.pushFront(node.key, node.value); // but pushFront creates new node. So we need a separate method that inserts the given node at front.
            }
            Better: Implement;
            insertFront(node, Node);
            that;
            inserts;
            an;
            existing;
            node;
            at;
            front.So;
            insertFront(node, Node);
            {
                const first = this.head.next;
                this.head.next = node;
                node.prev = this.head;
                node.next = first;
                first.prev = node;
            }
            Then;
            we;
            can;
            do
                : moveToFront(node, Node);
            while ({
                this: .list.remove(node),
                this: .list.insertFront(node)
            });
            That;
            way;
            we;
            keep;
            the;
            same;
            node;
            object.
                Similarly, ;
            for (put, ; ; )
                if (key)
                    exists, we;
            can;
            update;
            the;
            node;
            's value, then move it to front. If not exists, we create new node, add to map, and insert at front; if size exceeds capacity, evict LRU by removing node before tail, and also delete from map.;
            So;
            we;
            need;
            methods: remove(node)(which, we, have), popBack();
            that;
            returns;
            node;
            to;
            be;
            evicted.
                Let;
            's design:;
            class DoublyLinkedList {
                constructor() {
                    this.head = new Node('', 0);
                    this.tail = new Node('', 0);
                    this.head.next = this.tail;
                    this.tail.prev = this.head;
                }
                // Remove a node from the list (assumes node is in the list)
                remove(node) {
                    if (node.prev)
                        node.prev.next = node.next;
                    if (node.next)
                        node.next.prev = node.prev;
                }
                // Insert a node at the front (after head)
                insertFront(node) {
                    const first = this.head.next;
                    this.head.next = node;
                    node.prev = this.head;
                    node.next = first;
                    first.prev = node;
                }
                // Remove and return the LRU node (before tail)
                popBack() {
                    if (this.tail.prev === this.head)
                        return null;
                    const node = this.tail.prev;
                    this.remove(node);
                    return node;
                }
            }
            Now;
            Cache: class LRUCache {
                constructor(capacity) {
                    this.capacity = capacity;
                    this.map = new Map();
                    this.list = new DoublyLinkedList();
                }
                get(key) {
                    const node = this.map.get(key);
                    if (!node)
                        return -1;
                    // move to front
                    this.list.remove(node);
                    this.list.insertFront(node);
                    return node.value;
                }
                put(key, value) {
                    if (this.map.has(key)) {
                        const node = this.map.get(key);
                        node.value = value;
                        this.list.remove(node);
                        this.list.insertFront(node);
                    }
                    else {
                        // new key
                        const node = new Node(key, value);
                        this.map.set(key, node);
                        this.list.insertFront(node);
                        // if over capacity, evict
                        if (this.map.size > this.capacity) {
                            const evicted = this.list.popBack();
                            if (evicted) {
                                this.map.delete(evicted.key);
                            }
                        }
                    }
                }
                del(key) {
                    if (this.map.has(key)) {
                        const node = this.map.get(key);
                        this.list.remove(node);
                        this.map.delete(key);
                    }
                }
                // Get keys in order from most recent to least recent
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
            That;
            should;
            work.
            ;
            Now;
            we;
            need;
            to;
            process;
            input.
            ;
            We;
            read;
            the;
            entire;
            input;
            with (fs.readFileSync(0, "utf8").Then)
                split;
            into;
            lines.The;
            first;
            line;
            contains;
            C;
            and;
            N.Then;
            we;
            iterate;
            over;
            the;
            next;
            N;
            lines.Each;
            line;
            is;
            like;
            "PUT key value";
            or;
            "GET key";
            or;
            "DEL key".We;
            parse;
            accordingly.
            ;
            We;
            need;
            to;
            collect;
            GET;
            results in order.We;
            'll store them in an array of strings (or numbers, but output as space-separated). If no GET operations, we output "EMPTY" for first line.;
            After;
            processing;
            all;
            operations, we;
            get;
            the;
            keys in order;
            from;
            the;
            cache, and;
            output;
            them;
            space - separated, or;
            "EMPTY";
            if (cache)
                empty.
                ;
            We;
            need;
            to;
            be;
            careful;
            about;
            large;
            output: maybe;
            we;
            can;
            build;
            a;
            string;
            with (join(' '))
                for (each; line.
                    Complexities; )
                    : O(N);
            time, O(C);
            memory.
                Now, we;
            must;
            ensure;
            that;
            the;
            Node;
            class is {
            }
            defined, and;
            we;
            don;
            't have memory leaks. But it';
            s;
            fine.
            ;
            Edge;
            cases: capacity;
            can;
            be;
            0 ? Constraints : ;
            say;
            1 <= C <= 200000, so;
            capacity;
            at;
            least;
            1.;
            Keys;
            are;
            non - empty;
            strings;
            without;
            spaces.Values;
            are;
            signed;
            32 - bit;
            integers.
            ;
            We;
            should;
            parse;
            value;
            (value, 10).It;
            's signed, but parseInt handles negative.;
            Now, we;
            need;
            to;
            write;
            the;
            TypeScript;
            code.It;
            should;
            be;
            a;
            complete;
            program, ;
            with (imports)
                : import * as fs from 'fs';
            etc.But;
            we;
            can;
            just;
            use;
            require ? In : ;
            Node.js, we;
            can;
            use;
            const fs = require('fs');
            but;
            since;
            it;
            's TypeScript, we can use import. However, for simplicity, we can use require. But TypeScript often uses ES6 modules; but Node.js supports both. We';
            ll;
            use;
            import.But;
            the;
            problem;
            says;
            "Return only TypeScript code, no explanation and no Markdown fence.";
            So;
            we;
            just;
            output;
            the;
            code.
                We;
            'll write:;
            import * as fs from 'fs';
            // define classes
            // main
            const data = fs.readFileSync(0, 'utf8');
            const lines = data.trim().split('\n');
            const firstLine = lines[0].trim();
            const parts = firstLine.split(/\s+/);
            const C = parseInt(parts[0], 10);
            const N = parseInt(parts[1], 10);
            const cache = new LRUCache(C);
            const getResults = [];
            for (let i = 1; i <= N; i++) {
                const line = lines[i].trim();
                const spaceIdx = line.indexOf(' ');
                const op = line.substring(0, spaceIdx);
                const rest = line.substring(spaceIdx + 1);
                if (op === 'PUT') {
                    // rest = "key value"
                    const keyEnd = rest.indexOf(' ');
                    const key = rest.substring(0, keyEnd);
                    const value = parseInt(rest.substring(keyEnd + 1), 10);
                    cache.put(key, value);
                }
                else if (op === 'GET') {
                    const key = rest; // no space after key
                    const val = cache.get(key);
                    getResults.push(val);
                }
                else if (op === 'DEL') {
                    const key = rest;
                    cache.del(key);
                }
            }
            if (getResults.length === 0) {
                console.log('EMPTY');
            }
            else {
                console.log(getResults.join(' '));
            }
            const keys = cache.getKeysInOrder();
            if (keys.length === 0) {
                console.log('EMPTY');
            }
            else {
                console.log(keys.join(' '));
            }
            That;
            should;
            be;
            it.
            ;
            But;
            we;
            need;
            to;
            be;
            careful: The;
            input;
            may;
            have;
            trailing;
            spaces ? We : ;
            'll trim each line.;
            Also, note;
            that;
            there;
            may;
            be;
            more;
            lines;
            than;
            N ? We : ;
            'll only process exactly N lines after the first line. But we should ensure we don';
            t;
            go;
            out;
            of;
            bounds;
            we;
            can;
            loop;
            i;
            from;
            1;
            to;
            N;
            inclusive.
                Now, check;
            for (performance; ; )
                : Using;
            indexOf;
            and;
            substring;
            is;
            fine.
            ;
            We;
            need;
            to;
            ensure;
            that;
            we;
            use;
            O(1);
            per;
            operation.Our;
            implementation;
            uses;
            Map(hash, table);
            and;
            doubly;
            linked;
            list, so;
            operations;
            are;
            O(1);
            average.
            ;
            Potential;
            pitfalls: The;
            Node;
            class {
            }
            's key and value are stored; we need to make sure that when we update value for existing key, we update node.value directly. That';
            s;
            fine.
            ;
            We;
            also;
            need;
            to;
            handle;
            the;
            where;
            capacity;
            is;
            1;
            and;
            we;
            put;
            new key;
            after;
            insertion, map.size > capacity, we;
            evict;
            the;
            LRU, which;
            is;
            the;
            node;
            we;
            just;
            inserted ? Wait : , order;
            we;
            insert;
            new node;
            at;
            front, then;
            if (map.size > capacity, we)
                popBack.Since;
            we;
            just;
            inserted;
            at;
            front, the;
            list;
            has;
            the;
            new node;
            at;
            front;
            and;
            maybe;
            the;
            old;
            one;
            at;
            back.If;
            capacity;
            is;
            1, after;
            insertion, size;
            becomes;
            2, we;
            popBack, which;
            removes;
            the;
            LRU(the, one, before, tail).That;
            would;
            remove;
            the;
            old;
            node;
            if (there)
                was;
            one, but;
            if (there)
                was;
            only;
            one;
            before;
            insertion, after;
            insertion;
            we;
            have;
            two;
            nodes: new at;
            front, old;
            at;
            back.The;
            LRU;
            is;
            the;
            old;
            one, so;
            we;
            evict;
            it, leaving;
            the;
            new one.That;
            's correct. If capacity is 1 and cache was empty, after insertion size=1, not > capacity, so no eviction. Good.;
            Now, ;
            for (DEL; ; )
                : we;
            remove;
            node;
            from;
            list;
            and;
            map.
                Now, we;
            should;
            consider;
            that;
            the;
            keys;
            may;
            be;
            large, but;
            that;
            's fine.;
            Now, output;
            first;
            line;
            GET;
            results;
            separated;
            by;
            spaces;
            if (none, EMPTY.Second)
                line;
            remaining;
            keys in order;
            from;
            most;
            recent;
            to;
            least;
            recent;
            if (empty, EMPTY.
            )
                We;
            need;
            to;
            ensure;
            that;
            we;
            output;
            exactly;
            two;
            lines, even;
            if (one)
                is;
            EMPTY.
                Now, test;
            with (a)
                small;
            example: Input: 2;
            5;
            PUT;
            a;
            1;
            PUT;
            b;
            2;
            GET;
            a;
            PUT;
            c;
            3;
            GET;
            b;
            Processing: C = 2, N = 5.;
            1;
            PUT;
            a;
            1 -  > cache;
            a(1);
            MRU;
            2;
            PUT;
            b;
            2 -  > cache;
            b(2);
            MRU, a(1);
            LRU(size, 2);
            3;
            GET;
            a -  > returns;
            1, move;
            a;
            to;
            MRU: cache: a(1);
            MRU, b(2);
            LRU.GET;
            result;
            1.;
            4;
            PUT;
            c;
            3 -  > capacity;
            2, need;
            to;
            evict;
            LRU(b).Insert;
            c;
            at;
            front: cache: c(3);
            MRU, a(1);
            LRU ? Wait : , after;
            eviction: we;
            remove;
            b;
            from;
            map;
            and;
            list.After;
            insertion, list;
            c(front), a(back).size;
            2.;
            5;
            GET;
            b -  > returns - 1(b, not, present).GET;
            result - 1.;
            GET;
            results: 1 - 1 -  > output;
            "1 -1".Remaining;
            keys: c, a(since, a, is, LRU ? Actually : , order, from, MRU, to, LRU, c(MRU), a(LRU).So, "c a".Output, "c a".
                Check, After, step, 3, order, a(MRU), b(LRU).After, step, 4, we, evict, b, insert, c.So, order, c(MRU), a(LRU).So, yes.
                Now);
            if (no)
                GET: output;
            "EMPTY";
            then;
            keys.
                Edge;
            If;
            cache;
            empty;
            after;
            all;
            ops, second;
            line;
            EMPTY.
                Now, constraints;
            N;
            up;
            to;
            300;
            k, C;
            up;
            to;
            200;
            k, so;
            memory;
            usage: each;
            node;
            has;
            key(string);
            and;
            value(number), plus;
            prev / next;
            references.That;
            's okay. Map overhead also okay.;
            We;
            should;
            ensure;
            that;
            we;
            use;
            fast;
            I / O ? Since : ;
            we;
            read;
            all;
            at;
            once, it;
            's fine.;
            Now, we;
            need;
            to;
            write;
            the;
            code in TypeScript.We;
            'll include type annotations for parameters and returns.;
            We;
            'll also define Node class with optional prev/next? We';
            ll;
            use;
            non - null;
            after;
            initialization, but;
            we;
            can;
            declare;
            We;
            'll also consider that in the remove method, we assume node is not null and has prev and next set. But we need to handle if node.prev is null? In our usage, we always remove nodes that are in the list, so they have non-null prev and next (except maybe the dummy nodes, but we never remove dummy nodes). So it';
            s;
            fine.
                Now, we;
            need;
            to;
            be;
            careful;
            about;
            the;
            popBack;
            method: we;
            check;
            if (tail.prev === head, then)
                return null.That;
            's fine.;
            Now, we;
            need;
            to;
            ensure;
            that;
            we;
            don;
            't accidentally leave orphan nodes.;
            Now, the;
            code.
                We;
            'll write:;
            import * as fs from 'fs';
            class Node {
                constructor(key, value) {
                    this.key = key;
                    this.value = value;
                    this.prev = null;
                    this.next = null;
                }
            }
            class DoublyLinkedList {
                constructor() {
                    this.head = new Node('', 0);
                    this.tail = new Node('', 0);
                    this.head.next = this.tail;
                    this.tail.prev = this.head;
                }
                remove(node) {
                    if (node.prev)
                        node.prev.next = node.next;
                    if (node.next)
                        node.next.prev = node.prev;
                }
                insertFront(node) {
                    const first = this.head.next;
                    this.head.next = node;
                    node.prev = this.head;
                    node.next = first;
                    first.prev = node;
                }
                popBack() {
                    if (this.tail.prev === this.head)
                        return null;
                    const node = this.tail.prev;
                    this.remove(node);
                    return node;
                }
            }
            class LRUCache {
                constructor(capacity) {
                    this.capacity = capacity;
                    this.map = new Map();
                    this.list = new DoublyLinkedList();
                }
                get(key) {
                    const node = this.map.get(key);
                    if (!node)
                        return -1;
                    this.list.remove(node);
                    this.list.insertFront(node);
                    return node.value;
                }
                put(key, value) {
                    if (this.map.has(key)) {
                        const node = this.map.get(key);
                        node.value = value;
                        this.list.remove(node);
                        this.list.insertFront(node);
                    }
                    else {
                        const node = new Node(key, value);
                        this.map.set(key, node);
                        this.list.insertFront(node);
                        if (this.map.size > this.capacity) {
                            const evicted = this.list.popBack();
                            if (evicted) {
                                this.map.delete(evicted.key);
                            }
                        }
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
            // main
            const data = fs.readFileSync(0, 'utf8');
            const lines = data.trim().split('\n');
            const firstLine = lines[0].trim();
            const parts = firstLine.split(/\s+/);
            const C = parseInt(parts[0], 10);
            const N = parseInt(parts[1], 10);
            const cache = new LRUCache(C);
            const getResults = [];
            for (let i = 1; i <= N; i++) {
                const line = lines[i].trim();
                const spaceIdx = line.indexOf(' ');
                const op = line.substring(0, spaceIdx);
                const rest = line.substring(spaceIdx + 1);
                if (op === 'PUT') {
                    const keyEnd = rest.indexOf(' ');
                    const key = rest.substring(0, keyEnd);
                    const value = parseInt(rest.substring(keyEnd + 1), 10);
                    cache.put(key, value);
                }
                else if (op === 'GET') {
                    const key = rest;
                    const val = cache.get(key);
                    getResults.push(val);
                }
                else if (op === 'DEL') {
                    const key = rest;
                    cache.del(key);
                }
            }
            if (getResults.length === 0) {
                console.log('EMPTY');
            }
            else {
                console.log(getResults.join(' '));
            }
            const keys = cache.getKeysInOrder();
            if (keys.length === 0) {
                console.log('EMPTY');
            }
            else {
                console.log(keys.join(' '));
            }
            That;
            should;
            be;
            complete.
            ;
            But;
            we;
            need;
            to;
            consider;
            that;
            the;
            input;
            might;
            have;
            extra;
            whitespace;
            or;
            lines ? We : ;
            'll trim each line.;
            Also, note;
            that;
            we;
            used;
            lines[i];
            for (i; from; 1)
                to;
            N;
            inclusive.But;
            what;
            if (there)
                are;
            fewer;
            lines;
            than;
            N ? The : ;
            problem;
            says;
            there;
            are;
            N;
            lines;
            after;
            the;
            first, so;
            it;
            's fine.;
            Now, we;
            need;
            to;
            ensure;
            that;
            we;
            handle;
            the;
            where;
            the;
            first;
            line;
            may;
            have;
            more;
            than;
            one;
            space;
            between;
            C;
            and;
            N;
            we;
            split;
            by;
            whitespace.
                Now, we;
            need;
            to;
            ensure;
            that;
            we;
            don;
            't use any external libraries besides fs. That';
            s;
            fine.
                Now, we;
            might;
            want;
            to;
            optimize;
            by;
            const faster = __addDisposableResource(env_2, void 0, false), parsing = __addDisposableResource(env_2, void 0, false), Not = __addDisposableResource(env_2, void 0, false), necessary = __addDisposableResource(env_2, void 0, false), Now = __addDisposableResource(env_2, void 0, false), test = __addDisposableResource(env_2, void 0, false);
            with (a)
                simple;
        }
        catch (e_2) {
            env_2.error = e_2;
            env_2.hasError = true;
        }
        finally {
            __disposeResources(env_2);
        }
    }
}
- > cache;
a;
2;
GET;
a -  > returns;
10, move;
to;
front(already, front).GET;
result;
10.;
3;
DEL;
a -  > remove;
a.Cache;
empty.
;
GET;
results: [10] -  > output;
"10".Keys;
[] -  > output;
"EMPTY".So;
10;
EMPTY;
That;
matches.
    Now, test;
with (no)
    GET: Input: 2;
2;
PUT;
a;
1;
PUT;
b;
2;
Output: EMPTY;
a;
b ? Wait : , after;
PUT;
a;
then;
PUT;
b, the;
order: b;
MRU, a;
LRU.So;
keys: b;
a.Output;
EMPTY;
b;
a;
But;
careful: If;
no;
GET, first;
line;
EMPTY, second;
line;
keys.That;
's correct.;
Now, test;
with (capacity)
    1;
and;
multiple;
puts: Input: 1;
3;
PUT;
a;
1;
PUT;
b;
2;
GET;
a;
Processing: 1;
PUT;
a;
1 -  > cache;
a;
2;
PUT;
b;
2 -  > evict;
a(LRU), cache;
b;
3;
GET;
a -  > returns - 1.;
GET;
results: [-1] -  > output;
"-1".Keys;
b -  > output;
"b".So;
-1;
b;
Now, check;
that;
GET;
a;
returns - 1, correct.
    Now, consider;
that;
PUT;
updates;
existing;
key;
and;
makes;
it;
MRU.Example;
Input: 2;
4;
PUT;
a;
1;
PUT;
b;
2;
PUT;
a;
3;
GET;
b;
Processing: 1;
a = 1;
2;
b = 2, order;
b;
MRU, a;
LRU;
3;
PUT;
a;
3 -  > a;
exists, update;
value;
to;
3, move;
to;
front: order: a;
MRU, b;
LRU;
4;
GET;
b -  > returns;
2, move;
b;
to;
front: order: b;
MRU, a;
LRU.
;
GET;
results: 2.;
Keys: b;
a.
;
So;
output: 2;
b;
a;
Works.
    Now, check;
for (large; inputs; )
    : our;
code;
uses;
Map;
and;
linked;
list, should;
be;
fine.
    Now, we;
need;
to;
ensure;
that;
we;
don;
't have any TypeScript errors: we used Map, which is global. We used parseInt, etc.;
We;
used;
optional;
chaining ? Not : ;
needed.
;
We;
used;
non - null;
assertions in some;
places: this.map.get(key);
etc.That;
's okay because we check has or after get we assume non-null.;
In;
getKeysInOrder, we;
used;
current.next;
because;
we;
know;
it;
's not null until tail.;
Now, we;
need;
to;
consider;
that;
the;
input;
might;
have;
lines;
with (leading / trailing)
    spaces;
we;
trim;
each;
line.
    Now, we;
need;
to;
ensure;
that;
we;
read;
the;
whole;
input;
fs.readFileSync(0, 'utf8');
reads;
from;
stdin.
    Now, we;
might;
want;
to;
use;
process.stdin.read ? But : ;
the;
requirement;
says;
to;
use;
fs.readFileSync(0, "utf8").So;
we;
follow;
that.
    Now, we;
should;
also;
consider;
that;
the;
input;
might;
not;
end;
with (a)
    newline;
but;
split('\n');
works.
    Now, we;
need;
to;
output;
exactly;
two;
lines, no;
extra;
spaces;
at;
end ? It : ;
's okay if we join with spaces, there won';
t;
be;
trailing;
space.
    Now, we;
need;
to;
ensure;
that;
we;
don;
't use any async; it';
s;
fine.
    Now, we;
might;
think;
about;
var a, simpler, approach, a, Map, that, maintains, insertion, order, JavaScript, Map, does, maintain, insertion, order, but, it, doesn, ts, fs;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    a = __addDisposableResource(env_1, void 0, false), simpler = __addDisposableResource(env_1, void 0, false), approach = __addDisposableResource(env_1, void 0, false), a = __addDisposableResource(env_1, void 0, false), Map = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), maintains = __addDisposableResource(env_1, void 0, false), insertion = __addDisposableResource(env_1, void 0, false), order = __addDisposableResource(env_1, void 0, false), JavaScript = __addDisposableResource(env_1, void 0, false), Map = __addDisposableResource(env_1, void 0, false), does = __addDisposableResource(env_1, void 0, false), maintain = __addDisposableResource(env_1, void 0, false), insertion = __addDisposableResource(env_1, void 0, false), order = __addDisposableResource(env_1, void 0, false), but = __addDisposableResource(env_1, void 0, false), it = __addDisposableResource(env_1, void 0, false), doesn = __addDisposableResource(env_1, void 0, false);
    't support O(1) removal of arbitrary element to move to front. However, we could use a Map and on each access, delete the key and reinsert to move to end (since Map';
    s;
    iteration;
    order;
    is;
    insertion;
    order, but;
    we;
    need;
    MRU;
    at;
    one;
    end;
    Actually, Map in JS;
    iterates in insertion;
    order, but;
    we;
    can;
    use;
    it;
    LRU;
    by: on;
    GET, ;
    if (key)
        exists, delete it;
    and;
    then;
    re - insert;
    to;
    move;
    to;
    end(most, recent).On;
    PUT, ;
    if (key)
        exists, delete and;
    re - insert;
    insert;
    then;
    if (size > capacity, delete the)
        first;
    inserted;
    key(which, is, LRU).This;
    approach;
    is;
    O(1);
    for (delete and; set, and; O(1))
        for (getting; the; first)
            key ? Actually : , to;
    get;
    the;
    first;
    key;
    for (eviction, we; need; to)
        get;
    the;
    first;
    key in the;
    Map.In;
    JavaScript, Map;
    does;
    not;
    provide;
    a;
    direct;
    way;
    to;
    get;
    the;
    first;
    key in O(1);
    we;
    would;
    need;
    to;
    iterate;
    or;
    keep;
    a;
    separate;
    reference.But;
    we;
    can;
    maintain;
    a;
    separate;
    linked;
    list;
    of;
    keys;
    for (eviction; order ? But : ; we)
        could;
    just;
    use;
    a;
    Map;
    and;
    also;
    keep;
    a;
    Set;
    or;
    something ? Actually : , we;
    could;
    use;
    a;
    Map;
    and;
    also;
    keep;
    an;
    array;
    of;
    keys in order, but;
    that;
    would;
    be;
    O(n);
    for (deletions.So; not; O(1).So)
        the;
    doubly;
    linked;
    list;
    approach;
    is;
    standard.
        Thus, our;
    implementation;
    is;
    correct.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have any memory leaks due to nodes that are evicted but still referenced? No, we delete from map, so they become garbage.;
    Now, we;
    can;
    finalize.
    ;
    But;
    we;
    need;
    to;
    output;
    only;
    TypeScript;
    code.So;
    we;
    'll produce the code as above.;
    One;
    more;
    thing: The;
    problem;
    says;
    "Return only TypeScript code, no explanation and no Markdown fence.";
    So;
    we;
    should;
    not;
    include;
    any;
    markdown;
    formatting.We;
    'll just output the raw code.;
    Now, we;
    should;
    also;
    consider;
    that;
    the;
    program;
    might;
    be;
    run;
    with (Node.js)
        and;
    TypeScript;
    might;
    need;
    to;
    be;
    compiled.But;
    we;
    are;
    providing;
    TypeScript;
    code;
    the;
    user;
    will;
    compile;
    it.So;
    it;
    's fine.;
    Now, we;
    should;
    ensure;
    that;
    we;
    use `import * as fs from 'fs';`;
    but in some;
    Node.js;
    environments, the;
    might;
    not;
    support;
    ES6;
    imports;
    without;
    proper;
    configuration.However, Node.js;
    supports;
    ES6;
    modules;
    if (using.mjs)
        extension;
    or;
    if (package.json)
        has;
    "type";
    "module".But;
    the;
    problem;
    doesn;
    't specify. Typically, in coding challenges, they accept both require and import. To be safe, we could use `const fs = require(';
    fs;
    ');` which works in both. But the requirement says "TypeScript program", so we can use require. However, TypeScript can use require with `const fs = require(';
    fs;
    ');` and that';
    s;
    fine.I;
    'll use `import` for cleanliness, but I';
    m;
    not;
    sure;
    if (the)
        judge;
    expects;
    it;
    to;
    be;
    compiled;
    to;
    CommonJS.Many;
    online;
    judges;
    that;
    support;
    TypeScript;
    use;
    ts - node;
    or;
    compile;
    to;
    JavaScript.Usually;
    they;
    accept;
    either.I;
    'll stick with import, but if there';
    s;
    a;
    risk, we;
    can;
    change;
    to;
    require.I;
    think;
    it;
    's fine.;
    But;
    note: In;
    Node.js, ;
    if (we)
        use `import * as fs from 'fs';`, we;
    need;
    to;
    have;
    the;
    file;
    with (.mjs)
        extension;
    or;
    use;
    experimental;
    modules.However, when;
    ts = __addDisposableResource(env_1, void 0, false);
    -node, it;
    might;
    transpile;
    to;
    CommonJS;
    if (configured.But)
        the;
    judge;
    might;
    just;
    run;
    the;
    TypeScript;
    directly ? Usually : ;
    they;
    compile;
    to;
    JavaScript;
    first.I;
    'll assume it';
    s;
    okay.
    ;
    To;
    be;
    safe, I;
    'll use `const fs = require(';
    fs;
    ');` which is universally supported in Node.js and works with TypeScript (just need to type the require). But TypeScript may give an error if using require without declaration? No, it';
    s;
    fine.
        I;
    'll use `const fs = require(';
    fs;
    ');` and then add a type for fs? Not necessary.;
    But;
    the;
    code;
    will;
    be;
    simpler.
        I;
    'll write:;
    fs = require('fs');
    Then;
    the;
    rest.
    ;
    But;
    note: The;
    problem;
    says;
    "Read stdin with fs.readFileSync(0, ";
    utf8;
    ").";
    That;
    works;
    with (require.
    )
        So;
    I;
    'll use require.;
    Now, final;
    code: `` `typescript
const fs = require('fs');
    ;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
