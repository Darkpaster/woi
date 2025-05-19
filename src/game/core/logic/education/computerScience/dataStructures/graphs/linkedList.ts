import {DataStructure} from "../dataStructure.ts";
import {ListNode} from "./listNode.ts";

export class LinkedList extends DataStructure {
    private head: ListNode | null;
    private currentNode: ListNode | null; // For visualization

    constructor() {
        super("linked-list", "Linked List", "A linear data structure of connected nodes");
        this.head = null;
        this.currentNode = null;
    }

    public insert(element: any): void {
        const newNode = new ListNode(element);

        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }

        this.elements.push(element);
        this.operations++;
    }

    public remove(element: any): boolean {
        if (!this.head) return false;

        if (this.head.data === element) {
            this.head = this.head.next;
            this.operations++;
            this.elements = this.elements.filter(e => e !== element);
            return true;
        }

        let current = this.head;
        while (current.next) {
            if (current.next.data === element) {
                current.next = current.next.next;
                this.operations++;
                this.elements = this.elements.filter(e => e !== element);
                return true;
            }
            current = current.next;
        }

        return false;
    }
    public search(element: any): boolean {
        let current = this.head;
        while (current) {
            this.operations++;
            if (current.data === element) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    public render(): void {
        // Visualization of linked list
        console.log("Linked List:", this.elements);
    }

    // For step-by-step visualization
    public startTraversal(): void {
        this.currentNode = this.head;
    }

    public nextNode(): ListNode | null {
        if (!this.currentNode) return null;

        const node = this.currentNode;
        this.currentNode = this.currentNode.next;
        return node;
    }
}