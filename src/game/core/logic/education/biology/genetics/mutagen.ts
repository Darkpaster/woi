// Helper class to simulate mutagens and environmental factors causing mutations
import {Mutation, MutationType} from "./mutation.ts";
import {NucleotideBase} from "./genetics.ts";
import {DNAStrand} from "../molecularBiology/dnaStrand.ts";

export class Mutagen {
    private name: string;
    private potency: number; // 0-1, mutation probability
    private specificTypes: MutationType[] = []; // Types of mutations this agent can cause
    private targetBases: NucleotideBase[] = []; // Bases preferentially affected (if any)

    constructor(
        name: string,
        potency: number,
        specificTypes: MutationType[] = [],
        targetBases: NucleotideBase[] = []
    ) {
        this.name = name;
        this.potency = Math.max(0, Math.min(1, potency)); // Clamp to 0-1
        this.specificTypes = specificTypes;
        this.targetBases = targetBases;
    }

    public applyToDNA(strand: DNAStrand, exposureTime: number): Mutation[] {
        const mutations: Mutation[] = [];
        const dnaLength = strand.getLength();

        // Calculate number of potential mutations based on potency and exposure
        const mutationCount = Math.floor(dnaLength * this.potency * exposureTime * 0.0001);

        for (let i = 0; i < mutationCount; i++) {
            // Randomly select position
            const position = Math.floor(Math.random() * dnaLength);

            // Check if base at position is one of our target bases
            const baseAtPosition = strand.getBaseAt(position);

            if (this.targetBases.length > 0 &&
                !this.targetBases.includes(baseAtPosition as NucleotideBase)) {
                continue; // Skip if not a target base
            }

            // Select mutation type
            let mutationType: MutationType;

            if (this.specificTypes.length > 0) {
                // Pick from specified types
                const typeIndex = Math.floor(Math.random() * this.specificTypes.length);
                mutationType = this.specificTypes[typeIndex];
            } else {
                // Select random type with weighted probabilities
                const typeRoll = Math.random();

                if (typeRoll < 0.7) {
                    mutationType = MutationType.SUBSTITUTION; // Most common
                } else if (typeRoll < 0.85) {
                    mutationType = MutationType.DELETION;
                } else if (typeRoll < 0.95) {
                    mutationType = MutationType.INSERTION;
                } else if (typeRoll < 0.98) {
                    mutationType = MutationType.DUPLICATION;
                } else if (typeRoll < 0.99) {
                    mutationType = MutationType.INVERSION;
                } else {
                    mutationType = MutationType.TRANSLOCATION;
                }
            }

            // Create the mutation
            let mutation: Mutation | null = null;

            switch (mutationType) {
                case MutationType.SUBSTITUTION:
                    const bases = Object.values(NucleotideBase).filter(b =>
                        b !== 'U' && b !== baseAtPosition
                    );
                    const newBase = bases[Math.floor(Math.random() * bases.length)] as NucleotideBase;
                    mutation = Mutation.createSubstitution(position, strand, newBase);
                    break;

                case MutationType.INSERTION:
                    const insertLength = Math.floor(Math.random() * 3) + 1; // 1-3 bases
                    let insertedBases = '';
                    for (let j = 0; j < insertLength; j++) {
                        const base = ['A', 'T', 'G', 'C'][Math.floor(Math.random() * 4)];
                        insertedBases += base;
                    }
                    mutation = Mutation.createInsertion(position, strand, insertedBases);
                    break;

                case MutationType.DELETION:
                    const deleteLength = Math.floor(Math.random() * 3) + 1; // 1-3 bases
                    mutation = Mutation.createDeletion(position, strand, deleteLength);
                    break;

                case MutationType.DUPLICATION:
                    const dupLength = Math.floor(Math.random() * 5) + 1; // 1-5 bases
                    mutation = Mutation.createDuplication(position, strand, dupLength);
                    break;

                case MutationType.INVERSION:
                    const invLength = Math.floor(Math.random() * 10) + 5; // 5-14 bases
                    mutation = Mutation.createInversion(position, strand, invLength);
                    break;

                case MutationType.TRANSLOCATION:
                    const transLength = Math.floor(Math.random() * 8) + 3; // 3-10 bases
                    const targetPos = Math.floor(Math.random() * dnaLength);
                    mutation = Mutation.createTranslocation(position, targetPos, strand, transLength);
                    break;
            }

            if (mutation) {
                mutations.push(mutation);

                // Apply the mutation to the DNA strand
                strand.applyMutation(mutation);
            }
        }

        return mutations;
    }

    public getName(): string {
        return this.name;
    }

    public getPotency(): number {
        return this.potency;
    }
}