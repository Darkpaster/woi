interface ChemicalEquation {
    reactants: string;
    products: string;
    difficulty: string;
    topic: string;
    balanced: boolean;
}

export class ChemicalEquationGenerator {
    private difficulties = ['elementary', 'middle-school', 'high-school', 'undergraduate', 'graduate'];

    private elementaryEquations: ChemicalEquation[] = [
        { reactants: "H_2 + O_2", products: "H_2O", difficulty: "elementary", topic: "Simple synthesis", balanced: false },
        { reactants: "NaHCO_3", products: "Na_2CO_3 + H_2O + CO_2", difficulty: "elementary", topic: "Decomposition", balanced: false },
        { reactants: "Fe + O_2", products: "Fe_2O_3", difficulty: "elementary", topic: "Simple oxidation", balanced: false },
        { reactants: "HCl + NaOH", products: "NaCl + H_2O", difficulty: "elementary", topic: "Neutralization", balanced: false },
        { reactants: "C + O_2", products: "CO_2", difficulty: "elementary", topic: "Combustion", balanced: false },
    ];

    private middleSchoolEquations: ChemicalEquation[] = [
        { reactants: "CH_4 + O_2", products: "CO_2 + H_2O", difficulty: "middle-school", topic: "Combustion", balanced: false },
        { reactants: "Zn + HCl", products: "ZnCl_2 + H_2", difficulty: "middle-school", topic: "Single replacement", balanced: false },
        { reactants: "H_2SO_4 + NaOH", products: "Na_2SO_4 + H_2O", difficulty: "middle-school", topic: "Neutralization", balanced: false },
        { reactants: "NaCl + AgNO_3", products: "NaNO_3 + AgCl", difficulty: "middle-school", topic: "Double replacement", balanced: false },
        { reactants: "CaCO_3", products: "CaO + CO_2", difficulty: "middle-school", topic: "Thermal decomposition", balanced: false },
    ];

    private highSchoolEquations: ChemicalEquation[] = [
        { reactants: "C_6H_{12}O_6 + O_2", products: "CO_2 + H_2O", difficulty: "high-school", topic: "Cellular respiration", balanced: false },
        { reactants: "Cu + HNO_3", products: "Cu(NO_3)_2 + NO_2 + H_2O", difficulty: "high-school", topic: "Redox reaction", balanced: false },
        { reactants: "Fe_2O_3 + CO", products: "Fe + CO_2", difficulty: "high-school", topic: "Reduction", balanced: false },
        { reactants: "KMnO_4 + HCl", products: "KCl + MnCl_2 + H_2O + Cl_2", difficulty: "high-school", topic: "Redox reaction", balanced: false },
        { reactants: "Al + CuSO_4", products: "Al_2(SO_4)_3 + Cu", difficulty: "high-school", topic: "Activity series", balanced: false },
    ];

    private undergraduateEquations: ChemicalEquation[] = [
        { reactants: "CH_3COOH + NH_3", products: "CH_3COONH_4", difficulty: "undergraduate", topic: "Acid-base", balanced: true },
        { reactants: "KMnO_4 + H_2C_2O_4 + H_2SO_4", products: "K_2SO_4 + MnSO_4 + CO_2 + H_2O", difficulty: "undergraduate", topic: "Redox titration", balanced: false },
        { reactants: "C_6H_5COOH + SOCl_2", products: "C_6H_5COCl + SO_2 + HCl", difficulty: "undergraduate", topic: "Organic synthesis", balanced: false },
        { reactants: "AgNO_3 + Na_3PO_4", products: "Ag_3PO_4 + NaNO_3", difficulty: "undergraduate", topic: "Precipitation", balanced: false },
        { reactants: "(NH_4)_2Cr_2O_7", products: "Cr_2O_3 + N_2 + H_2O", difficulty: "undergraduate", topic: "Decomposition", balanced: false },
    ];

    private graduateEquations: ChemicalEquation[] = [
        { reactants: "S_8 + Cr_2O_7^{2-} + H^+", products: "SO_4^{2-} + Cr^{3+} + H_2O", difficulty: "graduate", topic: "Redox equilibrium", balanced: false },
        { reactants: "Mo(CO)_6 + PPh_3", products: "Mo(CO)_5(PPh_3) + CO", difficulty: "graduate", topic: "Organometallic chemistry", balanced: false },
        { reactants: "PhLi + CO_2", products: "PhCOOLi", difficulty: "graduate", topic: "Organometallic synthesis", balanced: true },
        { reactants: "HIO_4 + I^- + H^+", products: "I_2 + IO_3^- + H_2O", difficulty: "graduate", topic: "Redox chemistry", balanced: false },
        { reactants: "[Ru(NH_3)_5Cl]^{2+} + H_2O", products: "[Ru(NH_3)_5(H_2O)]^{3+} + Cl^-", difficulty: "graduate", topic: "Coordination chemistry", balanced: false },
    ];

    private balancedEquations: ChemicalEquation[] = [
        { reactants: "2H_2 + O_2", products: "2H_2O", difficulty: "elementary", topic: "Simple synthesis", balanced: true },
        { reactants: "2NaHCO_3", products: "Na_2CO_3 + H_2O + CO_2", difficulty: "elementary", topic: "Decomposition", balanced: true },
        { reactants: "4Fe + 3O_2", products: "2Fe_2O_3", difficulty: "elementary", topic: "Simple oxidation", balanced: true },
        { reactants: "HCl + NaOH", products: "NaCl + H_2O", difficulty: "elementary", topic: "Neutralization", balanced: true },
        { reactants: "C + O_2", products: "CO_2", difficulty: "elementary", topic: "Combustion", balanced: true },
        { reactants: "CH_4 + 2O_2", products: "CO_2 + 2H_2O", difficulty: "middle-school", topic: "Combustion", balanced: true },
        { reactants: "Zn + 2HCl", products: "ZnCl_2 + H_2", difficulty: "middle-school", topic: "Single replacement", balanced: true },
        { reactants: "H_2SO_4 + 2NaOH", products: "Na_2SO_4 + 2H_2O", difficulty: "middle-school", topic: "Neutralization", balanced: true },
        { reactants: "NaCl + AgNO_3", products: "NaNO_3 + AgCl", difficulty: "middle-school", topic: "Double replacement", balanced: true },
        { reactants: "CaCO_3", products: "CaO + CO_2", difficulty: "middle-school", topic: "Thermal decomposition", balanced: true },
        { reactants: "C_6H_{12}O_6 + 6O_2", products: "6CO_2 + 6H_2O", difficulty: "high-school", topic: "Cellular respiration", balanced: true },
        { reactants: "3Cu + 8HNO_3", products: "3Cu(NO_3)_2 + 2NO + 4H_2O", difficulty: "high-school", topic: "Redox reaction", balanced: true },
        { reactants: "Fe_2O_3 + 3CO", products: "2Fe + 3CO_2", difficulty: "high-school", topic: "Reduction", balanced: true },
        { reactants: "2KMnO_4 + 16HCl", products: "2KCl + 2MnCl_2 + 8H_2O + 5Cl_2", difficulty: "high-school", topic: "Redox reaction", balanced: true },
        { reactants: "2Al + 3CuSO_4", products: "Al_2(SO_4)_3 + 3Cu", difficulty: "high-school", topic: "Activity series", balanced: true },
        { reactants: "2KMnO_4 + 5H_2C_2O_4 + 3H_2SO_4", products: "K_2SO_4 + 2MnSO_4 + 10CO_2 + 8H_2O", difficulty: "undergraduate", topic: "Redox titration", balanced: true },
        { reactants: "C_6H_5COOH + SOCl_2", products: "C_6H_5COCl + SO_2 + HCl", difficulty: "undergraduate", topic: "Organic synthesis", balanced: true },
        { reactants: "3AgNO_3 + Na_3PO_4", products: "Ag_3PO_4 + 3NaNO_3", difficulty: "undergraduate", topic: "Precipitation", balanced: true },
        { reactants: "(NH_4)_2Cr_2O_7", products: "Cr_2O_3 + N_2 + 4H_2O", difficulty: "undergraduate", topic: "Decomposition", balanced: true },
        { reactants: "S_8 + 8Cr_2O_7^{2-} + 64H^+", products: "8SO_4^{2-} + 16Cr^{3+} + 32H_2O", difficulty: "graduate", topic: "Redox equilibrium", balanced: true },
        { reactants: "4HIO_4 + 7I^- + 4H^+", products: "4I_2 + 4IO_3^- + 2H_2O", difficulty: "graduate", topic: "Redox chemistry", balanced: true },
    ];

    /**
     * Get all available equations organized by difficulty level
     */
    public getAllEquations(): Record<string, ChemicalEquation[]> {
        return {
            elementary: this.elementaryEquations,
            "middle-school": this.middleSchoolEquations,
            "high-school": this.highSchoolEquations,
            undergraduate: this.undergraduateEquations,
            graduate: this.graduateEquations,
        };
    }

    /**
     * Generate a random chemical equation with specified properties
     * @param difficulty The difficulty level (elementary to graduate)
     * @param balanced Whether the equation should be balanced
     * @returns A chemical equation formatted for mhchem/KaTeX
     */
    public generateEquation(difficulty?: string, balanced = true): string {
        // Default to a random difficulty if not specified
        if (!difficulty) {
            difficulty = this.difficulties[Math.floor(Math.random() * this.difficulties.length)];
        }

        let availableEquations: ChemicalEquation[] = [];

        // Get equations matching the requested difficulty and balance state
        if (balanced) {
            availableEquations = this.balancedEquations.filter(eq => eq.difficulty === difficulty);
        } else {
            switch(difficulty) {
                case 'elementary':
                    availableEquations = this.elementaryEquations;
                    break;
                case 'middle-school':
                    availableEquations = this.middleSchoolEquations;
                    break;
                case 'high-school':
                    availableEquations = this.highSchoolEquations;
                    break;
                case 'undergraduate':
                    availableEquations = this.undergraduateEquations;
                    break;
                case 'graduate':
                    availableEquations = this.graduateEquations;
                    break;
                default:
                    // Default to high school if something went wrong
                    availableEquations = this.highSchoolEquations;
            }
        }

        // If no equations match the criteria, return a default one
        if (availableEquations.length === 0) {
            return "\\ce{H2 + O2 -> H2O}";
        }

        // Pick a random equation from the filtered list
        const randomIndex = Math.floor(Math.random() * availableEquations.length);
        const equation = availableEquations[randomIndex];

        // Format for mhchem/KaTeX
        return `\\ce{${equation.reactants} -> ${equation.products}}`;
    }

    /**
     * Generate multiple equations of varying difficulties
     * @param count Number of equations to generate
     * @param balanced Whether the equations should be balanced
     * @returns Array of formatted equations
     */
    public generateMultipleEquations(count = 5, balanced = true): string[] {
        const results: string[] = [];

        // Try to distribute across difficulty levels
        for (let i = 0; i < count; i++) {
            const difficultyIndex = Math.floor(i * this.difficulties.length / count);
            const difficulty = this.difficulties[difficultyIndex];
            results.push(this.generateEquation(difficulty, balanced));
        }

        return results;
    }

    /**
     * Generate equations for a specific topic
     * @param topic The chemistry topic to focus on
     * @param balanced Whether the equations should be balanced
     * @returns A chemical equation for the specified topic
     */
    public generateEquationByTopic(topic: string, balanced = true): string {
        // Combine all equations
        const allEquations = [
            ...this.elementaryEquations,
            ...this.middleSchoolEquations,
            ...this.highSchoolEquations,
            ...this.undergraduateEquations,
            ...this.graduateEquations,
            ...this.balancedEquations,
        ];

        // Filter by topic and balance status
        const matchingEquations = allEquations.filter(eq =>
            eq.topic.toLowerCase().includes(topic.toLowerCase()) &&
            eq.balanced === balanced
        );

        if (matchingEquations.length === 0) {
            return `\\ce{No equations found for topic "${topic}"}`;
        }

        // Pick a random equation from the filtered list
        const randomIndex = Math.floor(Math.random() * matchingEquations.length);
        const equation = matchingEquations[randomIndex];

        // Format for mhchem/KaTeX
        return `\\ce{${equation.reactants} -> ${equation.products}}`;
    }
}

