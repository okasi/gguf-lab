const lru = dummyTail.prev!;
            map.delete(lru.key);
            removeNode(lru);
        }
        const newNode = { key, value, prev: null, next: null };
        addToFront(newNode);
        map.set(key, newNode);
    }
