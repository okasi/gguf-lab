if (node.prev) node.prev.next = node.next;
        else head = node.next;
        if (node.next) node.next.prev = node.prev;
        else tail = node.prev;
