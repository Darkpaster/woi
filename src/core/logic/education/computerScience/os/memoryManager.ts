import {Process} from "../concurrency/process.ts";

export class MemoryManager {
    private totalMemory: number;
    private memoryBlocks: MemoryBlock[];

    constructor(totalMemory: number) {
        this.totalMemory = totalMemory;
        this.memoryBlocks = [new MemoryBlock(0, totalMemory, null)];
    }

    public allocate(size: number): MemoryBlock | null {
        // Find first free block that fits (first-fit algorithm)
        for (let i = 0; i < this.memoryBlocks.length; i++) {
            const block = this.memoryBlocks[i];

            if (block.process === null && block.size >= size) {
                // Split block if it's larger than needed
                if (block.size > size) {
                    const newBlock = new MemoryBlock(block.start + size, block.size - size, null);
                    this.memoryBlocks.splice(i + 1, 0, newBlock);
                    block.size = size;
                }

                block.process = {} as Process; // Set to non-null to mark as allocated
                return block;
            }
        }

        return null; // No suitable block found
    }

    public free(block: MemoryBlock): void {
        block.process = null;

        // Merge with adjacent free blocks
        this.mergeAdjacentFreeBlocks();
    }

    private mergeAdjacentFreeBlocks(): void {
        for (let i = 0; i < this.memoryBlocks.length - 1; i++) {
            const current = this.memoryBlocks[i];
            const next = this.memoryBlocks[i + 1];

            if (current.process === null && next.process === null) {
                // Merge blocks
                current.size += next.size;
                this.memoryBlocks.splice(i + 1, 1);
                i--; // Check the merged block again
            }
        }
    }

    public getUsedMemory(): number {
        return this.memoryBlocks.reduce((total, block) =>
            total + (block.process ? block.size : 0), 0);
    }

    public getTotalMemory(): number {
        return this.totalMemory;
    }
}