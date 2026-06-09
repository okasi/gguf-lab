"use strict";
remove(node, Node);
{
    node.prev.next = node.next;
    node.next.prev = node.prev;
}
addToHead(node, Node);
{
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
}
