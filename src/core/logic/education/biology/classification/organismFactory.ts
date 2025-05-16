import {Thaumarchaeota} from "./archaea/thaumarchaeota/thaumarchaeota.ts";
import {Organism} from "./organism.ts";
import {Cyanobacteria} from "./bacteria/cyanobacteria/cyanobacteria.ts";
import {Carnivora} from "./eukaryota/animalia/vertebrata/mammalia/eutheria/carnivora/carnivora.ts";
import {RNAVirus} from "./viruses/rnc/rnaVirus.ts";

export class OrganismFactory {
    public createRandomArchaea(maxX: number, maxY: number): Organism {
        // For now, just create Thaumarchaeota
        return new Thaumarchaeota(
            Math.random() * maxX,
            Math.random() * maxY
        );
    }

    public createRandomBacteria(maxX: number, maxY: number): Organism {
        // For now, just create Cyanobacteria
        return new Cyanobacteria(
            Math.random() * maxX,
            Math.random() * maxY
        );
    }

    public createRandomEukarya(maxX: number, maxY: number): Organism {
        // For now, just create Carnivora
        return new Carnivora(
            Math.random() * maxX,
            Math.random() * maxY
        );
    }

    public createRandomVirus(maxX: number, maxY: number): Organism {
        // For now, just create RNAVirus
        return new RNAVirus(
            Math.random() * maxX,
            Math.random() * maxY
        );
    }
}