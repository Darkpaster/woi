import {DNAStrand} from "../molecularBiology/dnaStrand.ts";
import {GeneticEvent, MutationData, NucleotideBase} from "./genetics.ts";

export enum MutationType {
    SUBSTITUTION = 'substitution', // Single base change
    INSERTION = 'insertion',       // Addition of one or more bases
    DELETION = 'deletion',         // Removal of one or more bases
    DUPLICATION = 'duplication',   // Copied segment
    INVERSION = 'inversion',       // Segment reversed
    TRANSLOCATION = 'translocation' // Segment moved to different location
}

export interface MutationEvent {
    type: MutationType;
    length: number;
    newBases?: string; // For insertions and substitutions
    targetPosition?: number; // For translocations
}

export class Mutation {
    private position: number;
    private strand: DNAStrand;
    private type: MutationType;
    private originalSequence: string;
    private modifiedSequence: string;
    private length: number;

    constructor(
        position: number,
        strand: DNAStrand,
        type: MutationType,
        originalSequence: string,
        modifiedSequence: string,
        length: number
    ) {
        this.position = position;
        this.strand = strand;
        this.type = type;
        this.originalSequence = originalSequence;
        this.modifiedSequence = modifiedSequence;
        this.length = length;
    }

    public static createSubstitution(
        position: number,
        strand: DNAStrand,
        newBase: NucleotideBase
    ): Mutation {
        const originalBase = strand.getBaseAt(position);
        if (originalBase === newBase.toString()) {
            return new Mutation(
                position,
                strand,
                MutationType.SUBSTITUTION,
                originalBase,
                originalBase,
                1
            );
        }

        // Perform the substitution
        const originalSequence = originalBase;
        const modifiedSequence = newBase.toString();

        // Create mutation object
        const mutation = new Mutation(
            position,
            strand,
            MutationType.SUBSTITUTION,
            originalSequence,
            modifiedSequence,
            1
        );

        // Notify about the mutation
        const mutationData: MutationData = {
            position: position,
            originalBase: originalBase as NucleotideBase,
            newBase: newBase,
            strand: strand
        };

        EventManager.getInstance().notify(GeneticEvent.MUTATION, mutationData);

        return mutation;
    }

    public static createInsertion(
        position: number,
        strand: DNAStrand,
        insertedBases: string
    ): Mutation {
        // Get the original sequence (empty for pure insertions)
        const originalSequence = '';

        // Create mutation object
        const mutation = new Mutation(
            position,
            strand,
            MutationType.INSERTION,
            originalSequence,
            insertedBases,
            insertedBases.length
        );

        // Notify about the mutation
        const mutationData: MutationData = {
            position: position,
            originalBase: '' as unknown as NucleotideBase, // No original base for insertion
            newBase: insertedBases[0] as NucleotideBase,  // Use first base for notification
            strand: strand
        };

        EventManager.getInstance().notify(GeneticEvent.MUTATION, mutationData);

        return mutation;
    }

    public static createDeletion(
        position: number,
        strand: DNAStrand,
        length: number
    ): Mutation {
        // Get the sequence to be deleted
        const originalSequence = strand.getSequence(position, position + length - 1);

        // Create mutation object
        const mutation = new Mutation(
            position,
            strand,
            MutationType.DELETION,
            originalSequence,
            '',
            length
        );

        // Notify about the mutation
        const mutationData: MutationData = {
            position: position,
            originalBase: originalSequence[0] as NucleotideBase, // Use first deleted base
            newBase: '' as unknown as NucleotideBase,
            strand: strand
        };

        EventManager.getInstance().notify(GeneticEvent.MUTATION, mutationData);

        return mutation;
    }

    public static createDuplication(
        position: number,
        strand: DNAStrand,
        length: number
    ): Mutation {
        // Get the sequence to be duplicated
        const originalSequence = strand.getSequence(position, position + length - 1);

        // Create mutation object
        const mutation = new Mutation(
            position,
            strand,
            MutationType.DUPLICATION,
            originalSequence,
            originalSequence + originalSequence, // Duplicated sequence
            length
        );

        // Notify about the mutation
        const mutationData: MutationData = {
            position: position,
            originalBase: originalSequence[0] as NucleotideBase,
            newBase: originalSequence[0] as NucleotideBase,
            strand: strand
        };

        EventManager.getInstance().notify(GeneticEvent.MUTATION, mutationData);

        return mutation;
    }

    public static createInversion(
        position: number,
        strand: DNAStrand,
        length: number
    ): Mutation {
        // Get the sequence to be inverted
        const originalSequence = strand.getSequence(position, position + length - 1);

        // Invert the sequence
        const modifiedSequence = originalSequence
            .split('')
            .reverse()
            .map(base => {
                // Also complement the bases (A<->T, G<->C)
                switch (base) {
                    case 'A': return 'T';
                    case 'T': return 'A';
                    case 'G': return 'C';
                    case 'C': return 'G';
                    default: return base;
                }
            })
            .join('');

        // Create mutation object
        const mutation = new Mutation(
            position,
            strand,
            MutationType.INVERSION,
            originalSequence,
            modifiedSequence,
            length
        );

        // Notify about the mutation
        const mutationData: MutationData = {
            position: position,
            originalBase: originalSequence[0] as NucleotideBase,
            newBase: modifiedSequence[0] as NucleotideBase,
            strand: strand
        };

        EventManager.getInstance().notify(GeneticEvent.MUTATION, mutationData);

        return mutation;
    }

    public static createTranslocation(
        sourcePosition: number,
        targetPosition: number,
        strand: DNAStrand,
        length: number
    ): Mutation {
        // Get the sequence to be translocated
        const originalSequence = strand.getSequence(sourcePosition, sourcePosition + length - 1);

        // Create mutation object (representing the source position)
        const mutation = new Mutation(
            sourcePosition,
            strand,
            MutationType.TRANSLOCATION,
            originalSequence,
            '', // Removed from source
            length
        );

        // Notify about the mutation
        const mutationData: MutationData = {
            position: sourcePosition,
            originalBase: originalSequence[0] as NucleotideBase,
            newBase: '' as unknown as NucleotideBase,
            strand: strand
        };

        EventManager.getInstance().notify(GeneticEvent.MUTATION, mutationData);

        return mutation;
    }

    // Getters for mutation properties
    public getPosition(): number {
        return this.position;
    }

    public getType(): MutationType {
        return this.type;
    }

    public getOriginalSequence(): string {
        return this.originalSequence;
    }

    public getModifiedSequence(): string {
        return this.modifiedSequence;
    }

    public getLength(): number {
        return this.length;
    }

    public getStrand(): DNAStrand {
        return this.strand;
    }

    // Check if mutation affects a specific region
    public affectsRegion(start: number, end: number): boolean {
        const mutationEnd = this.position + this.length - 1;
        return (this.position <= end && mutationEnd >= start);
    }
}