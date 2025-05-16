export interface EnvironmentConditions {
    temperature: number;
    oxygen: number;
    light: number;
    pH: number;
    moisture: number;
}

export class Environment {
    private width: number;
    private height: number;
    private conditions: EnvironmentConditions[][];
    private timeOfDay: number = 0; // 0-24 hours
    private season: 'spring' | 'summer' | 'autumn' | 'winter' = 'spring';
    private dayLength: number = 24; // hours in a day
    private yearLength: number = 4; // seasons in a year
    private timeScale: number = 0.1; // time passing speed

    private globalTemperatureOffset: number = 0;
    private globalLightOffset: number = 0;
    private globalMoistureOffset: number = 0;

    public setGlobalTemperature(value: number): void {
        // Calculate offset from default temperature
        this.globalTemperatureOffset = value - 25; // Assuming 25 is the default
    }

    public setGlobalLight(value: number): void {
        this.globalLightOffset = value - 50; // Assuming 50 is the default
    }

    public setGlobalMoisture(value: number): void {
        this.globalMoistureOffset = value - 60; // Assuming 60 is the default
    }

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        // Initialize environment grid
        this.conditions = Array(height).fill(null).map(() =>
            Array(width).fill(null).map(() => ({
                temperature: 25, // 25°C default
                oxygen: 21, // 21% oxygen
                light: 50, // 50% light
                pH: 7, // neutral pH
                moisture: 60 // 60% moisture
            }))
        );

        this.generateTerrain();
    }

    private generateTerrain(): void {
        // Create different zones in the environment
        const zones = [
            { name: 'water', coverage: 0.3 },
            { name: 'forest', coverage: 0.3 },
            { name: 'desert', coverage: 0.2 },
            { name: 'tundra', coverage: 0.2 }
        ];

        // Simple Perlin-like noise to create terrain zones
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const noiseValue = this.simplexNoise(x / 50, y / 50);

                // Assign different conditions based on noise value
                if (noiseValue < 0.3) {
                    // Water zone
                    this.conditions[y][x].moisture = 100;
                    this.conditions[y][x].temperature = 20;
                    this.conditions[y][x].oxygen = 8; // dissolved oxygen
                    this.conditions[y][x].pH = 8.2; // slightly alkaline
                } else if (noiseValue < 0.6) {
                    // Forest zone
                    this.conditions[y][x].moisture = 70;
                    this.conditions[y][x].temperature = 22;
                    this.conditions[y][x].oxygen = 23;
                    this.conditions[y][x].pH = 6.5; // slightly acidic
                } else if (noiseValue < 0.8) {
                    // Desert zone
                    this.conditions[y][x].moisture = 15;
                    this.conditions[y][x].temperature = 35;
                    this.conditions[y][x].oxygen = 21;
                    this.conditions[y][x].pH = 9; // alkaline
                } else {
                    // Tundra zone
                    this.conditions[y][x].moisture = 40;
                    this.conditions[y][x].temperature = 5;
                    this.conditions[y][x].oxygen = 22;
                    this.conditions[y][x].pH = 5.5; // acidic
                }
            }
        }
    }

    private simplexNoise(x: number, y: number): number {
        // Simple noise function - in real implementation you would use a proper noise library
        return (Math.sin(x) * Math.cos(y) + Math.sin(x * 0.7) * Math.cos(y * 1.3)) * 0.5 + 0.5;
    }

    public update(dt: number): void {
        // Update time of day
        this.timeOfDay = (this.timeOfDay + dt * this.timeScale) % this.dayLength;

        // Update season if a "year" has passed
        if (this.timeOfDay < dt * this.timeScale) {
            this.updateSeason();
        }

        // Update environment conditions based on time of day and season
        this.updateConditions();
    }

    private updateSeason(): void {
        // Cycle through seasons
        switch(this.season) {
            case 'spring': this.season = 'summer'; break;
            case 'summer': this.season = 'autumn'; break;
            case 'autumn': this.season = 'winter'; break;
            case 'winter': this.season = 'spring'; break;
        }
    }

    private updateConditions(): void {
        // Calculate light level based on time of day
        const dayProgress = this.timeOfDay / this.dayLength;
        let lightLevel = Math.sin(dayProgress * Math.PI) * 100;
        lightLevel = Math.max(0, lightLevel); // No negative light

        // Apply seasonal effects
        let temperatureModifier = 0;
        let moistureModifier = 0;

        switch(this.season) {
            case 'spring':
                temperatureModifier = 5;
                moistureModifier = 20;
                break;
            case 'summer':
                temperatureModifier = 10;
                moistureModifier = -10;
                break;
            case 'autumn':
                temperatureModifier = 0;
                moistureModifier = 10;
                break;
            case 'winter':
                temperatureModifier = -15;
                moistureModifier = 0;
                break;
        }

        // Update all grid cells
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // Update light level
                this.conditions[y][x].light = lightLevel;

                // Apply seasonal temperature adjustments
                const baseTemp = this.conditions[y][x].temperature;
                this.conditions[y][x].temperature = this.clamp(
                    baseTemp + temperatureModifier + (Math.sin(dayProgress * Math.PI * 2) * 5), // Daily temperature cycle
                    -20, 45
                );

                // Apply seasonal moisture adjustments
                const baseMoisture = this.conditions[y][x].moisture;
                this.conditions[y][x].moisture = this.clamp(
                    baseMoisture + moistureModifier,
                    5, 100
                );

                this.conditions[y][x].temperature += this.globalTemperatureOffset;
                this.conditions[y][x].light = Math.max(0, Math.min(100, this.conditions[y][x].light + this.globalLightOffset));
                this.conditions[y][x].moisture = Math.max(0, Math.min(100, this.conditions[y][x].moisture + this.globalMoistureOffset));
            }
        }
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    public getConditionsAt(x: number, y: number): EnvironmentConditions {
        // Convert coordinates to grid positions
        const gridX = Math.floor(x / (this.width / this.conditions[0].length));
        const gridY = Math.floor(y / (this.height / this.conditions.length));

        // Ensure we're within bounds
        const safeX = this.clamp(gridX, 0, this.conditions[0].length - 1);
        const safeY = this.clamp(gridY, 0, this.conditions.length - 1);

        return this.conditions[safeY][safeX];
    }

    public getTimeOfDay(): number {
        return this.timeOfDay;
    }

    public getSeason(): string {
        return this.season;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const cellWidth = this.width / this.conditions[0].length;
        const cellHeight = this.height / this.conditions.length;

        // Draw environment background
        for (let y = 0; y < this.conditions.length; y++) {
            for (let x = 0; x < this.conditions[0].length; x++) {
                const conditions = this.conditions[y][x];

                // Calculate color based on conditions
                const moisture = conditions.moisture / 100;
                const temp = (conditions.temperature + 20) / 65; // Normalize -20 to 45

                let r = 0, g = 0, b = 0;

                if (moisture > 0.8) {
                    // Water - blue
                    r = 0;
                    g = 100 + (temp * 50);
                    b = 200 + (temp * 55);
                } else if (temp < 0.3) {
                    // Cold area - white/blue
                    r = 200 + (moisture * 55);
                    g = 200 + (moisture * 55);
                    b = 255;
                } else if (moisture < 0.3) {
                    // Desert - yellow/orange
                    r = 230;
                    g = 180 + (moisture * 75);
                    b = 140 - (moisture * 100);
                } else {
                    // Forest/Grassland - green
                    r = 50 - (moisture * 30) + (temp * 50);
                    g = 100 + (moisture * 100);
                    b = 50 + (moisture * 50) - (temp * 30);
                }

                // Apply light level
                const lightFactor = 0.5 + (conditions.light / 200); // 0.5 to 1
                r *= lightFactor;
                g *= lightFactor;
                b *= lightFactor;

                ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }

        // Draw time indicator
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "14px Arial";
        ctx.fillText(`Time: ${Math.floor(this.timeOfDay).toString().padStart(2, '0')}:${Math.floor((this.timeOfDay % 1) * 60).toString().padStart(2, '0')}`, 10, this.height - 40);
        ctx.fillText(`Season: ${this.season}`, 10, this.height - 20);
    }
}