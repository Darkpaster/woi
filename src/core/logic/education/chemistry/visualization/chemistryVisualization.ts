import {ChemicalSystem} from "../chemicalSystem.ts";
import {ChemicalEntity} from "../chemicalEntity.ts";
import {Reaction} from "../reactions/reaction.ts";
import {DecompositionReaction} from "../reactions/decomposition/decompositionReaction.ts";
import {SynthesisReaction} from "../reactions/synthesis/synthesisReaction.ts";
import {EquilibriumReaction} from "../reactions/equilibrium/equilibriumReaction.ts";
import {RedoxReaction} from "../reactions/redox/redoxReaction.ts";
import {Compound} from "../compounds/compound.ts";
import {Ion} from "../ions/ion.ts";

export class ChemistryVisualization {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private system: ChemicalSystem;
    private animationFrameId: number | null = null;
    private isRunning: boolean = false;
    private lastTimestamp: number = 0;
    private simulationSpeed: number = 1.0; // Multiplier for time steps
    private showLabels: boolean = true;
    private showBonds: boolean = true;
    private showReactions: boolean = true;
    private zoomLevel: number = 1.0;
    private panOffset: { x: number, y: number } = { x: 0, y: 0 };
    private selectedEntity: ChemicalEntity | null = null;
    private hoverEntity: ChemicalEntity | null = null;

    // Color schemes for different reaction types
    private static REACTION_COLORS = {
        'Decomposition': '#FF5733',
        'Synthesis': '#33FF57',
        'Equilibrium': '#5733FF',
        'Redox': '#FF33F5'
    };

    constructor(canvasId: string, system: ChemicalSystem) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas with id ${canvasId} not found`);
        }

        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }

        this.ctx = ctx;
        this.system = system;

        // Set up initial canvas size
        this.resizeCanvas();

        // Set up event listeners
        this.setupEventListeners();
    }

    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTimestamp = performance.now();
        this.animationLoop();
    }

    public stop(): void {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    public setSimulationSpeed(speed: number): void {
        this.simulationSpeed = Math.max(0.1, Math.min(10, speed));
    }

    public toggleLabels(): void {
        this.showLabels = !this.showLabels;
    }

    public toggleBonds(): void {
        this.showBonds = !this.showBonds;
    }

    public toggleReactions(): void {
        this.showReactions = !this.showReactions;
    }

    public setZoom(level: number): void {
        this.zoomLevel = Math.max(0.5, Math.min(3, level));
    }

    public setPan(x: number, y: number): void {
        this.panOffset.x = x;
        this.panOffset.y = y;
    }

    public selectEntity(entity: ChemicalEntity | null): void {
        this.selectedEntity = entity;
    }

    public getSystem(): ChemicalSystem {
        return this.system;
    }

    private resizeCanvas(): void {
        // Set canvas dimensions to match its display size
        const { width, height } = this.canvas.getBoundingClientRect();
        this.canvas.width = width;
        this.canvas.height = height;
    }

    private setupEventListeners(): void {
        // Handle window resizing
        window.addEventListener('resize', () => this.resizeCanvas());

        // Mouse interaction
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('click', (event) => this.handleMouseClick(event));
        this.canvas.addEventListener('wheel', (event) => this.handleMouseWheel(event));

        // Touch interaction
        this.canvas.addEventListener('touchmove', (event) => this.handleTouchMove(event));
        this.canvas.addEventListener('touchstart', (event) => this.handleTouchStart(event));
    }

    private animationLoop(): void {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTimestamp) / 1000; // Convert to seconds
        this.lastTimestamp = currentTime;

        // Simulate system with appropriate time step
        const timeStep = deltaTime * this.simulationSpeed;
        this.system.simulate(timeStep);

        // Render the system
        this.render();

        // Continue animation loop
        this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
    }

    private render(): void {
        const ctx = this.ctx;
        const { width, height } = this.canvas;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Apply transformations
        ctx.save();
        ctx.translate(this.panOffset.x, this.panOffset.y);
        ctx.scale(this.zoomLevel, this.zoomLevel);

        // Draw background
        this.renderBackground();

        // Draw chemical bonds if enabled
        if (this.showBonds) {
            this.renderBonds();
        }

        // Draw reaction visualizations if enabled
        if (this.showReactions) {
            this.renderReactions();
        }

        // Draw all entities
        this.renderEntities();

        // Draw system information panel
        this.renderSystemInfo();

        // Draw selection highlight and info
        if (this.selectedEntity) {
            this.renderEntityDetails(this.selectedEntity);
        }

        // Draw hover entity indicator
        if (this.hoverEntity) {
            this.renderHoverIndicator(this.hoverEntity);
        }

        // Restore context
        ctx.restore();
    }

    private renderBackground(): void {
        const ctx = this.ctx;
        const { width, height } = this.canvas;

        // Draw a gradient background based on system temperature
        const temperature = this.system.getTemperature();

        // Calculate color based on temperature (blue for cold, red for hot)
        const r = Math.min(255, Math.max(0, Math.floor((temperature - 273) / 2)));
        const b = Math.min(255, Math.max(0, Math.floor(255 - ((temperature - 273) / 2))));
        const backgroundClr = `rgba(${r}, 240, ${b}, 0.2)`;

        // Fill background
        ctx.fillStyle = backgroundClr;
        ctx.fillRect(0, 0, width, height);

        // Draw grid for reference
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 1;

        const gridSize = 50 * this.zoomLevel;

        // Adjust grid for pan
        const offsetX = this.panOffset.x % gridSize;
        const offsetY = this.panOffset.y % gridSize;

        // Vertical lines
        for (let x = offsetX; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = offsetY; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    private renderEntities(): void {
        const entities = this.system.getEntities();

        // Render entities
        for (const entity of entities) {
            // Skip the selected entity, we'll render it last to keep it on top
            if (entity === this.selectedEntity) continue;

            entity.render(this.ctx);

            // Render labels if enabled
            if (this.showLabels) {
                this.renderEntityLabel(entity);
            }
        }

        // Render selected entity on top
        if (this.selectedEntity) {
            this.selectedEntity.render(this.ctx);
            this.renderEntityLabel(this.selectedEntity);
        }
    }

    private renderEntityLabel(entity: ChemicalEntity): void {
        const { x, y } = entity.getPosition();
        const ctx = this.ctx;

        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // Display name below the entity
        ctx.fillText(entity.getName(), x, y + 40);

        // Display formula smaller
        ctx.font = '10px Arial';
        ctx.fillText(entity.getFormula(), x, y + 52);
    }

    private renderBonds(): void {
        const entities = this.system.getEntities();

        // Find potential bonds between entities
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entity1 = entities[i];
                const entity2 = entities[j];

                // Skip rendering bonds between same entity types (simplification)
                if (entity1.getType() === entity2.getType()) continue;

                const pos1 = entity1.getPosition();
                const pos2 = entity2.getPosition();

                // Calculate distance
                const dx = pos2.x - pos1.x;
                const dy = pos2.y - pos1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Only draw bonds for nearby entities
                const bondThreshold = 100;
                if (distance < bondThreshold) {
                    this.renderBond(entity1, entity2, distance);
                }
            }
        }
    }

    private renderBond(entity1: ChemicalEntity, entity2: ChemicalEntity, distance: number): void {
        const pos1 = entity1.getPosition();
        const pos2 = entity2.getPosition();
        const ctx = this.ctx;

        // Determine bond type and color based on entity types
        let bondColor = 'rgba(100, 100, 100, 0.5)';
        let bondWidth = 1;
        let bondStyle: 'solid' | 'dashed' | 'dotted' = 'solid';

        // Ionic bond between ion and opposite charge
        if (
            (entity1.getType().includes('Ion') && entity2.getType().includes('Ion')) &&
            (entity1.getCharge() * entity2.getCharge() < 0)
        ) {
            bondColor = 'rgba(255, 0, 0, 0.6)';
            bondWidth = 2;
            bondStyle = 'dotted';
        }
        // Covalent bond (between elements)
        else if (entity1.getType() === 'Element' && entity2.getType() === 'Element') {
            bondColor = 'rgba(0, 200, 0, 0.6)';
            bondWidth = 2;
            bondStyle = 'solid';
        }
        // Hydrogen bond
        else if (
            (entity1.getFormula().includes('H') || entity2.getFormula().includes('H')) &&
            (entity1.getFormula().includes('O') || entity2.getFormula().includes('O'))
        ) {
            bondColor = 'rgba(0, 100, 255, 0.4)';
            bondWidth = 1;
            bondStyle = 'dashed';
        }

        // Fade bonds based on distance
        const opacity = 1 - (distance / 100);
        bondColor = bondColor.replace(/[\d.]+\)$/, `${opacity})`);

        // Draw the bond
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.strokeStyle = bondColor;
        ctx.lineWidth = bondWidth;

        // Handle different bond styles
        if (bondStyle === 'dashed') {
            ctx.setLineDash([5, 3]);
        } else if (bondStyle === 'dotted') {
            ctx.setLineDash([2, 2]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.stroke();
        ctx.setLineDash([]); // Reset dash pattern
    }

    private renderReactions(): void {
        const reactions = this.system.getReactions();

        // Find potential reaction sites
        const entities = this.system.getEntities();

        for (const reaction of reactions) {
            // Check if reaction can occur
            if (!reaction.canReact(entities)) continue;

            // Find entities involved in the reaction
            const reactants = reaction.getReactants();
            const reactantEntities: ChemicalEntity[] = [];

            // Match reactants to actual entities in the system
            for (const reactant of reactants) {
                const matchingEntity = entities.find(e => e.getId() === reactant.getId());
                if (matchingEntity) {
                    reactantEntities.push(matchingEntity);
                }
            }

            // Only visualize if we found all reactants
            if (reactantEntities.length === reactants.length) {
                this.renderReactionVis(reaction, reactantEntities);
            }
        }
    }

    private renderReactionVis(reaction: Reaction, reactantEntities: ChemicalEntity[]): void {
        const ctx = this.ctx;

        // Calculate center point of all reactant entities
        let centerX = 0;
        let centerY = 0;

        for (const entity of reactantEntities) {
            const { x, y } = entity.getPosition();
            centerX += x;
            centerY += y;
        }

        centerX /= reactantEntities.length;
        centerY /= reactantEntities.length;

        // Get reaction type color
        const reactionType = reaction.getType();
        const color = ChemistryVisualization.REACTION_COLORS[reactionType as keyof typeof ChemistryVisualization.REACTION_COLORS] || '#888888';

        // Calculate pulse effect based on time
        const time = Date.now() / 1000;
        const pulseSize = 20 + Math.sin(time * 2) * 5;

        // Draw reaction indicator
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = color + '40'; // Add alpha
        ctx.fill();

        // Draw border
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw reaction symbol based on type
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let symbol = '';

        if (reaction instanceof DecompositionReaction) {
            symbol = '→|';
        } else if (reaction instanceof SynthesisReaction) {
            symbol = '|→';
        } else if (reaction instanceof EquilibriumReaction) {
            symbol = '⇌';
        } else if (reaction instanceof RedoxReaction) {
            symbol = 'e⁻';
        }

        ctx.fillText(symbol, centerX, centerY);

        // Draw lines from entities to reaction center
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (const entity of reactantEntities) {
            const { x, y } = entity.getPosition();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(centerX, centerY);
            ctx.stroke();
        }

        ctx.setLineDash([]);
    }

    private renderSystemInfo(): void {
        const ctx = this.ctx;
        const { width, height } = this.canvas;

        // Draw info panel in top-right corner
        const panelWidth = 200;
        const panelHeight = 120;
        const padding = 10;

        ctx.save();
        // Reset transformations for UI elements
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.fillStyle = 'rgba(240, 240, 240, 0.8)';
        ctx.fillRect(width - panelWidth - padding, padding, panelWidth, panelHeight);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(width - panelWidth - padding, padding, panelWidth, panelHeight);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // System name
        ctx.fillText(this.system.getName(), width - panelWidth - padding + 10, padding + 10);

        // System properties
        ctx.font = '12px Arial';
        const systemProps = [
            `Temperature: ${this.system.getTemperature().toFixed(1)} K`,
            `Pressure: ${(this.system.getPressure() / 1000).toFixed(1)} kPa`,
            `Entities: ${this.system.getEntities().length}`,
            `Time: ${this.system.getTime().toFixed(1)} s`,
            `Speed: ${this.simulationSpeed.toFixed(1)}x`
        ];

        systemProps.forEach((prop, index) => {
            ctx.fillText(prop, width - panelWidth - padding + 10, padding + 30 + index * 17);
        });

        ctx.restore();
    }

    private renderEntityDetails(entity: ChemicalEntity): void {
        const ctx = this.ctx;
        const { width, height } = this.canvas;

        // Highlight selected entity
        const { x, y } = entity.getPosition();

        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.strokeStyle = '#FF9900';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw entity details panel in bottom-left corner
        const panelWidth = 250;
        const panelHeight = 180;
        const padding = 10;

        ctx.save();
        // Reset transformations for UI elements
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(padding, height - panelHeight - padding, panelWidth, panelHeight);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, height - panelHeight - padding, panelWidth, panelHeight);

        // Entity title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${entity.getName()} (${entity.getFormula()})`, padding + 10, height - panelHeight - padding + 10);

        // Entity info
        ctx.font = '12px Arial';
        const info = [
            `Type: ${entity.getType()}`,
            `ID: ${entity.getId()}`,
            `Molar Mass: ${entity.getMolarMass().toFixed(2)} g/mol`,
            `Charge: ${entity.getCharge() >= 0 ? '+' + entity.getCharge() : entity.getCharge()}`
        ];

        // Add type-specific properties
        if (entity instanceof Element) {
            info.push(
                `Atomic Number: ${entity.getAtomicNumber()}`,
                `Electronegativity: ${entity.getElectronegativity().toFixed(2)}`,
                `Group: ${entity.getGroupNumber()}, Period: ${entity.getPeriodNumber()}`
            );
        } else if (entity instanceof Compound) {
            info.push(
                `State: ${entity.getState()}`,
                `Composition: ${this.formatComposition(entity.getComposition())}`
            );
        } else if (entity instanceof Ion) {
            info.push(
                `Source: ${entity.getSourceElement()?.getSymbol() || 'Complex'}`,
                `Charge: ${entity.getCharge() > 0 ? '+' + entity.getCharge() : entity.getCharge()}`
            );
        }

        info.forEach((line, index) => {
            ctx.fillText(line, padding + 10, height - panelHeight - padding + 35 + index * 17);
        });

        ctx.restore();
    }

    private renderHoverIndicator(entity: ChemicalEntity): void {
        const { x, y } = entity.getPosition();
        const ctx = this.ctx;

        // Simple hover effect
        ctx.beginPath();
        ctx.arc(x, y, 33, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Show name tooltip above entity
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const worldPos = this.worldToScreen(x, y);

        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText(entity.getName(), worldPos.x, worldPos.y - 35);

        ctx.restore();
    }

    // Helper method to format composition for display
    private formatComposition(composition: any[]): string {
        return composition.map(comp =>
            `${comp.element.getSymbol()}${comp.count > 1 ? comp.count : ''}`
        ).join(' ');
    }

    // Event handlers
    private handleMouseMove(event: MouseEvent): void {
        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);

        // Find entity under mouse
        const entity = this.findEntityAtPosition(x, y);
        this.hoverEntity = entity;
    }

    private handleMouseClick(event: MouseEvent): void {
        const { x, y } = this.screenToWorld(event.offsetX, event.offsetY);

        // Find and select entity under mouse
        const entity = this.findEntityAtPosition(x, y);
        this.selectEntity(entity);
    }

    private handleMouseWheel(event: WheelEvent): void {
        event.preventDefault();

        // Adjust zoom level
        const zoomDelta = -Math.sign(event.deltaY) * 0.1;
        this.setZoom(this.zoomLevel + zoomDelta);
    }

    private handleTouchMove(event: TouchEvent): void {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];
        const { x, y } = this.screenToWorld(touch.clientX, touch.clientY);

        // Update hover entity
        this.hoverEntity = this.findEntityAtPosition(x, y);
    }

    private handleTouchStart(event: TouchEvent): void {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];
        const { x, y } = this.screenToWorld(touch.clientX, touch.clientY);

        // Select entity
        this.selectEntity(this.findEntityAtPosition(x, y));
    }

    // Find entity at world position
    private findEntityAtPosition(x: number, y: number): ChemicalEntity | null {
        const entities = this.system.getEntities();

        // Search in reverse order (top to bottom)
        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];
            const entityPos = entity.getPosition();

            // Simple circular hit test
            const dx = entityPos.x - x;
            const dy = entityPos.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) { // Assuming entity radius is 30
                return entity;
            }
        }

        return null;
    }

    // Coordinate conversion methods
    private worldToScreen(worldX: number, worldY: number): { x: number, y: number } {
        return {
            x: worldX * this.zoomLevel + this.panOffset.x,
            y: worldY * this.zoomLevel + this.panOffset.y
        };
    }

    private screenToWorld(screenX: number, screenY: number): { x: number, y: number } {
        return {
            x: (screenX - this.panOffset.x) / this.zoomLevel,
            y: (screenY - this.panOffset.y) / this.zoomLevel
        };
    }
}