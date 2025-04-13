import {ChemicalSystem} from "../chemicalSystem.ts";
import {ChemistryVisualization} from "../visualization/chemistryVisualization.ts";
import {ElementFactory} from "../elements/elementFactory.ts";
import {CompoundFactory} from "../compounds/compoundFactory.ts";
import {IonFactory} from "../ions/ionFactory.ts";
import {PeriodicTable} from "../elements/periodicTable.ts";
import {RedoxReaction} from "../reactions/redox/redoxReaction.ts";
import {Acid} from "../compounds/inorganic/acids/acid.ts";
import {Base} from "../compounds/inorganic/bases/base.ts";
import {EquilibriumReaction} from "../reactions/equilibrium/equilibriumReaction.ts";

export class ChemistrySimulationApp {
    private system: ChemicalSystem;
    private visualization: ChemistryVisualization;
    private elementFactory: ElementFactory;
    private compoundFactory: CompoundFactory;
    private ionFactory: IonFactory;
    private periodicTable: PeriodicTable;
    private uiControls: {
        startButton: HTMLButtonElement;
        stopButton: HTMLButtonElement;
        resetButton: HTMLButtonElement;
        temperatureSlider: HTMLInputElement;
        pressureSlider: HTMLInputElement;
        speedSlider: HTMLInputElement;
        reactionSelector: HTMLSelectElement;
        addEntityButton: HTMLButtonElement;
        entitySelector: HTMLSelectElement;
    };

    constructor(canvasId: string) {
        // Initialize factories
        this.elementFactory = new ElementFactory();
        this.compoundFactory = new CompoundFactory();
        this.ionFactory = new IonFactory();
        this.periodicTable = new PeriodicTable();

        // Create chemical system
        // this.system = new ChemicalSystem("Water Electrolysis", "Demonstration of H₂O electrolysis", 298.15, 101325, 1.0);

        this.system = new ChemicalSystem();
        // Set up visualization
        this.visualization = new ChemistryVisualization(canvasId, this.system);

        // Set up UI controls
        this.initializeUIControls();

        // Prepare demo scenario
        this.setupElectrolysisDemo();
    }

    private initializeUIControls(): void {
        // This would be implemented to connect the DOM elements
        // For demonstration purposes, we'll use placeholders
        this.uiControls = {
            startButton: document.getElementById("start-button") as HTMLButtonElement,
            stopButton: document.getElementById("stop-button") as HTMLButtonElement,
            resetButton: document.getElementById("reset-button") as HTMLButtonElement,
            temperatureSlider: document.getElementById("temperature-slider") as HTMLInputElement,
            pressureSlider: document.getElementById("pressure-slider") as HTMLInputElement,
            speedSlider: document.getElementById("speed-slider") as HTMLInputElement,
            reactionSelector: document.getElementById("reaction-selector") as HTMLSelectElement,
            addEntityButton: document.getElementById("add-entity-button") as HTMLButtonElement,
            entitySelector: document.getElementById("entity-selector") as HTMLSelectElement
        };

        // Set up event listeners
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Start simulations
        this.uiControls.startButton.addEventListener("click", () => {
            this.visualization.start();
        });

        // Stop simulations
        this.uiControls.stopButton.addEventListener("click", () => {
            this.visualization.stop();
        });

        // Reset simulations
        this.uiControls.resetButton.addEventListener("click", () => {
            this.resetSimulation();
        });

        // Temperature control
        this.uiControls.temperatureSlider.addEventListener("input", (event) => {
            const temperature = parseFloat((event.target as HTMLInputElement).value);
            this.system.setTemperature(temperature);
        });

        // Pressure control
        this.uiControls.pressureSlider.addEventListener("input", (event) => {
            const pressure = parseFloat((event.target as HTMLInputElement).value);
            this.system.setPressure(pressure);
        });

        // Simulation speed control
        this.uiControls.speedSlider.addEventListener("input", (event) => {
            const speed = parseFloat((event.target as HTMLInputElement).value);
            this.visualization.setSimulationSpeed(speed);
        });

        // Add entity button
        this.uiControls.addEntityButton.addEventListener("click", () => {
            const selectedEntity = this.uiControls.entitySelector.value;
            this.addEntityToSystem(selectedEntity);
        });

        // Reaction selector
        this.uiControls.reactionSelector.addEventListener("change", (event) => {
            const selectedReaction = (event.target as HTMLSelectElement).value;
            this.setupSelectedReaction(selectedReaction);
        });

        // Populate entity selector with available elements and compounds
        this.populateEntitySelector();
        this.populateReactionSelector();
    }

    private populateEntitySelector(): void {
        // Clear existing options
        this.uiControls.entitySelector.innerHTML = '';

        // Add option group for elements
        const elementGroup = document.createElement('optgroup');
        elementGroup.label = 'Elements';

        // Add common elements
        const commonElements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'];
        for (const symbol of commonElements) {
            const option = document.createElement('option');
            option.value = `element:${symbol}`;
            option.textContent = `${symbol} - ${this.periodicTable.getElementBySymbol(symbol)?.getName() || symbol}`;
            elementGroup.appendChild(option);
        }

        // Add option group for compounds
        const compoundGroup = document.createElement('optgroup');
        compoundGroup.label = 'Compounds';

        // Add common compounds
        const commonCompounds = [
            {formula: 'H2O', name: 'Water'},
            {formula: 'CO2', name: 'Carbon Dioxide'},
            {formula: 'NaCl', name: 'Sodium Chloride'},
            {formula: 'H2SO4', name: 'Sulfuric Acid'},
            {formula: 'NaOH', name: 'Sodium Hydroxide'},
            {formula: 'CH4', name: 'Methane'},
            {formula: 'NH3', name: 'Ammonia'},
            {formula: 'HCl', name: 'Hydrochloric Acid'}
        ];

        for (const compound of commonCompounds) {
            const option = document.createElement('option');
            option.value = `compound:${compound.formula}`;
            option.textContent = `${compound.formula} - ${compound.name}`;
            compoundGroup.appendChild(option);
        }

        // Add option group for ions
        const ionGroup = document.createElement('optgroup');
        ionGroup.label = 'Ions';

        // Add common ions
        const commonIons = [
            {formula: 'H+', name: 'Hydrogen Ion'},
            {formula: 'OH-', name: 'Hydroxide Ion'},
            {formula: 'Na+', name: 'Sodium Ion'},
            {formula: 'Cl-', name: 'Chloride Ion'},
            {formula: 'Ca2+', name: 'Calcium Ion'},
            {formula: 'SO4^2-', name: 'Sulfate Ion'}
        ];

        for (const ion of commonIons) {
            const option = document.createElement('option');
            option.value = `ion:${ion.formula}`;
            option.textContent = `${ion.formula} - ${ion.name}`;
            ionGroup.appendChild(option);
        }

        // Add option groups to selector
        this.uiControls.entitySelector.appendChild(elementGroup);
        this.uiControls.entitySelector.appendChild(compoundGroup);
        this.uiControls.entitySelector.appendChild(ionGroup);
    }

    private populateReactionSelector(): void {
        // Clear existing options
        this.uiControls.reactionSelector.innerHTML = '';

        // Define common reactions
        const reactions = [
            {id: 'water-electrolysis', name: 'Water Electrolysis'},
            {id: 'acid-base', name: 'Acid-Base Neutralization'},
            {id: 'combustion', name: 'Hydrocarbon Combustion'},
            {id: 'redox', name: 'Redox Reaction'},
            {id: 'precipitation', name: 'Precipitation Reaction'},
            {id: 'equilibrium', name: 'Chemical Equilibrium'}
        ];

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select a Reaction --';
        this.uiControls.reactionSelector.appendChild(defaultOption);

        // Add reaction options
        for (const reaction of reactions) {
            const option = document.createElement('option');
            option.value = reaction.id;
            option.textContent = reaction.name;
            this.uiControls.reactionSelector.appendChild(option);
        }
    }

    private addEntityToSystem(entitySelector: string): void {
        // Parse the selector format: type:id
        const [type, id] = entitySelector.split(':');

        // Random position within canvas bounds
        const canvas = document.getElementById('chemistry-canvas') as HTMLCanvasElement;
        const padding = 50;
        const x = padding + Math.random() * (canvas.width - 2 * padding);
        const y = padding + Math.random() * (canvas.height - 2 * padding);

        try {
            let entity;

            if (type === 'element') {
                entity = this.elementFactory.createElement(id);
            } else if (type === 'compound') {
                entity = this.compoundFactory.createCompound(id);
            } else if (type === 'ion') {
                entity = this.ionFactory.createIon(id);
            } else {
                console.error(`Unknown entity type: ${type}`);
                return;
            }

            if (entity) {
                // Set position for visualization
                entity.setPosition(x, y);

                // Add to the system
                this.system.addEntity(entity);

                console.log(`Added ${entity.getName()} to the system`);
            }
        } catch (error) {
            console.error(`Failed to create entity: ${error}`);
        }
    }

    private setupSelectedReaction(reactionId: string): void {
        // Clear existing reactions
        this.system.clearReactions();

        // Add selected reaction
        switch (reactionId) {
            case 'water-electrolysis':
                this.setupElectrolysisDemo();
                break;
            case 'acid-base':
                this.setupAcidBaseDemo();
                break;
            case 'combustion':
                this.setupCombustionDemo();
                break;
            case 'redox':
                this.setupRedoxDemo();
                break;
            case 'precipitation':
                this.setupPrecipitationDemo();
                break;
            case 'equilibrium':
                this.setupEquilibriumDemo();
                break;
            default:
                console.log('No reaction selected');
        }
    }

    private setupElectrolysisDemo(): void {
        // Clear existing entities and reactions
        this.system.clearAll();

        // Create water molecules
        const water = this.compoundFactory.createCompound('H2O');

        // Add multiple water molecules to the system
        for (let i = 0; i < 10; i++) {
            const waterCopy = this.compoundFactory.createCompound('H2O');
            const x = 100 + Math.random() * 400;
            const y = 100 + Math.random() * 300;
            waterCopy.setPosition(x, y);
            this.system.addEntity(waterCopy);
        }

        // Create hydrogen and oxygen ions
        const hydrogenIon = this.ionFactory.createIon('H+');
        const hydroxideIon = this.ionFactory.createIon('OH-');

        // Position electrodes (represented by ions initially)
        hydrogenIon.setPosition(100, 200);
        hydroxideIon.setPosition(500, 200);

        this.system.addEntity(hydrogenIon);
        this.system.addEntity(hydroxideIon);

        // Create hydrogen and oxygen elements for products
        const hydrogen = this.elementFactory.createElement('H');
        const oxygen = this.elementFactory.createElement('O');

        hydrogen.setPosition(150, 300);
        oxygen.setPosition(450, 300);

        this.system.addEntity(hydrogen);
        this.system.addEntity(oxygen);

        // Create the electrolysis reaction
        const electrolysisReaction = new RedoxReaction(
            "Water Electrolysis",
            "2H₂O → 2H₂ + O₂",
            [water],
            [hydrogen, oxygen],
            1.23 // Standard potential in volts
        );

        this.system.addReaction(electrolysisReaction);

        // Set system properties for electrolysis
        this.system.setTemperature(298.15); // 25°C
        this.system.setPressure(101325); // 1 atm

        console.log("Water electrolysis demonstration set up");
    }

    private setupAcidBaseDemo(): void {
        // Clear existing entities and reactions
        this.system.clearAll();

        // Create acid and base
        const hydrochloricAcid = new Acid("Hydrochloric Acid", "HCl", 1.0);
        const sodiumHydroxide = new Base("Sodium Hydroxide", "NaOH", 13.0);

        // Position acid and base
        hydrochloricAcid.setPosition(150, 200);
        sodiumHydroxide.setPosition(450, 200);

        this.system.addEntity(hydrochloricAcid);
        this.system.addEntity(sodiumHydroxide);

        // Create products
        const water = this.compoundFactory.createCompound('H2O');
        const sodiumChloride = this.compoundFactory.createCompound('NaCl');

        water.setPosition(300, 300);
        sodiumChloride.setPosition(300, 100);

        this.system.addEntity(water);
        this.system.addEntity(sodiumChloride);

        // Create neutralization reaction
        const neutralizationReaction = new EquilibriumReaction(
            "Acid-Base Neutralization",
            "HCl + NaOH → NaCl + H₂O",
            [hydrochloricAcid, sodiumHydroxide],
            [sodiumChloride, water],
            1000 // Equilibrium constant (very large for neutralization)
        );

        this.system.addReaction(neutralizationReaction);

        console.log("Acid-base neutralization demonstration set up");
    }

    private setupCombustionDemo(): void {
        // Implement methane combustion demo
        this.system.clearAll();

        // Create methane and oxygen
        const methane = this.compoundFactory.createCompound('CH4');
        const oxygen = this.elementFactory.createElement('O');

        // Position reactants
        methane.setPosition(200, 200);

        this.system.addEntity(methane);

        // Add multiple oxygen molecules
        for (let i = 0; i < 8; i++) {
            const oxygenCopy = this.elementFactory.createElement('O');
            const angle = (i / 8) * Math.PI * 2;
            const x = 300 + Math.cos(angle) * 100;
            const y = 200 + Math.sin(angle) * 100;
            oxygenCopy.setPosition(x, y);
            this.system.addEntity(oxygenCopy);
        }

        // Create products
        const carbonDioxide = this.compoundFactory.createCompound('CO2');
        const water = this.compoundFactory.createCompound('H2O');

        carbonDioxide.setPosition(400, 150);
        water.setPosition(400, 250);

        this.system.addEntity(carbonDioxide);
        this.system.addEntity(water);

        // Create combustion reaction
        const combustionReaction = new RedoxReaction(
            "Methane Combustion",
            "CH₄ + 2O₂ → CO₂ + 2H₂O",
            [methane, oxygen],
            [carbonDioxide, water],
            890.4 // ΔH of reaction in kJ/mol
        );

        this.system.addReaction(combustionReaction);

        // Set high temperature for combustion
        this.system.setTemperature(800); // High temperature for combustion

        console.log("Combustion demonstration set up");
    }

    private setupRedoxDemo(): void {
        // Implement zinc-copper redox reaction
        this.system.clearAll();

        // Create zinc and copper sulfate
        const zinc = this.elementFactory.createElement('Zn');
        const copperIon = this.ionFactory.createIon('Cu2+');
        const sulfateIon = this.ionFactory.createIon('SO4^2-');

        // Position reactants
        zinc.setPosition(150, 200);
        copperIon.setPosition(350, 180);
        sulfateIon.setPosition(350, 220);

        this.system.addEntity(zinc);
        this.system.addEntity(copperIon);
        this.system.addEntity(sulfateIon);

        // Create products
        const copper = this.elementFactory.createElement('Cu');
        const zincIon = this.ionFactory.createIon('Zn2+');

        copper.setPosition(450, 200);
        zincIon.setPosition(250, 200);

        this.system.addEntity(copper);
        this.system.addEntity(zincIon);

        // Create redox reaction
        const redoxReaction = new RedoxReaction(
            "Zinc-Copper Redox",
            "Zn + Cu²⁺ → Zn²⁺ + Cu",
            [zinc, copperIon],
            [zincIon, copper],
            1.10 // Standard reduction potential in volts
        );

        this.system.addReaction(redoxReaction);

        console.log("Redox demonstration set up");
    }

    private setupPrecipitationDemo(): void {
        // Implement precipitation reaction (e.g., silver chloride)
        this.system.clearAll();

        // Create silver nitrate and sodium chloride
        const silverIon = this.ionFactory.createIon('Ag+');
        const nitrateIon = this.ionFactory.createIon('NO3-');
        const sodiumIon = this.ionFactory.createIon('Na+');
        const chlorideIon = this.ionFactory.createIon('Cl-');

        // Position reactants
        silverIon.setPosition(150, 180);
        nitrateIon.setPosition(150, 220);
        sodiumIon.setPosition(450, 180);
        chlorideIon.setPosition(450, 220);

        this.system.addEntity(silverIon);
        this.system.addEntity(nitrateIon);
        this.system.addEntity(sodiumIon);
        this.system.addEntity(chlorideIon);

        // Create products
        const silverChloride = this.compoundFactory.createCompound('AgCl');
        const sodiumNitrate = this.compoundFactory.createCompound('NaNO3');

        silverChloride.setPosition(300, 300);
        sodiumNitrate.setPosition(300, 100);

        this.system.addEntity(silverChloride);
        this.system.addEntity(sodiumNitrate);

        // Create precipitation reaction
        const precipitationReaction = new SynthesisReaction(
            "Silver Chloride Precipitation",
            "Ag⁺ + Cl⁻ → AgCl(s)",
            [silverIon, chlorideIon],
            [silverChloride],
            -1.0 // ΔG of reaction in kJ/mol
        );

        this.system.addReaction(precipitationReaction);

        console.log("Precipitation demonstration set up");
    }

    private setupEquilibriumDemo(): void {
        // Implement N2O4 ⇌ 2NO2 equilibrium
        this.system.clearAll();

        // Create dinitrogen tetroxide and nitrogen dioxide
        const n2o4 = this.compoundFactory.createCompound('N2O4');
        const no2 = this.compoundFactory.createCompound('NO2');

        // Position molecules
        n2o4.setPosition(200, 200);

        this.system.addEntity(n2o4);

        // Add multiple NO2 molecules
        for (let i = 0; i < 4; i++) {
            const no2Copy = this.compoundFactory.createCompound('NO2');
            const angle = (i / 4) * Math.PI * 2;
            const x = 400 + Math.cos(angle) * 80;
            const y = 200 + Math.sin(angle) * 80;
            no2Copy.setPosition(x, y);
            this.system.addEntity(no2Copy);
        }

        // Create equilibrium reaction
        const equilibriumReaction = new EquilibriumReaction(
            "NO2-N2O4 Equilibrium",
            "N₂O₄ ⇌ 2NO₂",
            [n2o4],
            [no2],
            4.64e-3 // Equilibrium constant at 298K
        );

        this.system.addReaction(equilibriumReaction);

        console.log("Equilibrium demonstration set up");
    }

    private resetSimulation(): void {
        // Stop the visualization
        this.visualization.stop();

        // Reset the system
        this.system.clearAll();
        this.system.setTemperature(298.15); // Reset to room temperature
        this.system.setPressure(101325); // Reset to 1 atm

        // Reset sliders
        this.uiControls.temperatureSlider.value = "298.15";
        this.uiControls.pressureSlider.value = "101325";
        this.uiControls.speedSlider.value = "1.0";

        // Reset reaction selector
        this.uiControls.reactionSelector.value = "";

        console.log("Simulation reset");
    }

    public start(): void {
        console.log("Starting Chemistry Simulation App");
        this.visualization.start();
    }
}