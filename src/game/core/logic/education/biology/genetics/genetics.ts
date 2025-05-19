import {DNAStrand} from "../molecularBiology/dnaStrand.ts";
import {Protein} from "../molecularBiology/protein.ts";

export enum NucleotideBase {
    A = 'A', // Adenine
    T = 'T', // Thymine
    G = 'G', // Guanine
    C = 'C', // Cytosine
    U = 'U'  // Uracil (RNA only)
}

export enum GeneticEvent {
    MUTATION = 'mutation',
    TRANSCRIPTION = 'transcription',
    TRANSLATION = 'translation',
    REPLICATION = 'replication'
}

export interface MutationData {
    position: number;
    originalBase: NucleotideBase;
    newBase: NucleotideBase;
    strand: DNAStrand;
}

export interface TranscriptionData {
    geneId: string;
    startPosition: number;
    endPosition: number;
    strand: DNAStrand;
    rnaSequence: string;
}

export interface TranslationData {
    rnaSequence: string;
    protein: Protein;
}

export interface ReplicationData {
    parentStrand: DNAStrand;
    daughterStrand: DNAStrand;
    errorCount: number;
}
