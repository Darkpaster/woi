import {SimulationEntity} from "../../../../../../utils/simulation/simulationEntity.ts";
import {Dataset, DatasetType} from "../dataScience/dataset.ts";
import {Model, ModelStatus, ModelType} from "../dataScience/model.ts";
import {Pipeline, PipelineStatus} from "../dataScience/pipeline.ts";
import {ComputeResource, ComputeResourceType, PipelineResult, TrainingResult} from "../dataScience/computeResource.ts";
import {Visualization, VisualizationType} from "../dataScience/visualization.ts";

export class DataScienceSystem extends SimulationEntity {
    private datasets: Dataset[];
    private models: Model[];
    private pipelines: Pipeline[];
    private visualizations: Visualization[];
    private computeResources: ComputeResource[];

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this.datasets = [];
        this.models = [];
        this.pipelines = [];
        this.visualizations = [];
        this.computeResources = [];
    }

    public addDataset(name: string, type: DatasetType, size: number): Dataset {
        const dataset = new Dataset(name, type, size);
        this.datasets.push(dataset);
        return dataset;
    }

    public addModel(name: string, type: ModelType, complexity: number): Model {
        const model = new Model(name, type, complexity);
        this.models.push(model);
        return model;
    }

    public createPipeline(name: string): Pipeline {
        const pipeline = new Pipeline(name);
        this.pipelines.push(pipeline);
        return pipeline;
    }

    public createVisualization(name: string, type: VisualizationType): Visualization {
        const visualization = new Visualization(name, type);
        this.visualizations.push(visualization);
        return visualization;
    }

    public addComputeResource(name: string, type: ComputeResourceType, capacity: number): ComputeResource {
        const resource = new ComputeResource(name, type, capacity);
        this.computeResources.push(resource);
        return resource;
    }

    public trainModel(model: Model, dataset: Dataset, computeResource: ComputeResource): TrainingResult {
        // Check if compute resource has enough capacity
        if (computeResource.getAvailableCapacity() < model.getComplexity() * dataset.getSize() / 100) {
            return {
                success: false,
                accuracy: 0,
                trainingTime: 0,
                message: "Insufficient compute resources"
            };
        }

        // Allocate compute resource
        const requiredCapacity = model.getComplexity() * dataset.getSize() / 100;
        computeResource.allocateCapacity(requiredCapacity);

        // Calculate training time and accuracy based on dataset/model compatibility
        const compatibility = this.calculateCompatibility(model.getType(), dataset.getType());
        const trainingTime = dataset.getSize() * model.getComplexity() / (computeResource.getCapacity() * compatibility);

        // Calculate accuracy based on compatibility and model complexity
        const baseAccuracy = compatibility * 0.7;
        const complexityBonus = model.getComplexity() / 100 * 0.2;
        const datasetBonus = Math.min(dataset.getSize() / 10000, 1) * 0.1;
        const accuracy = Math.min(0.99, baseAccuracy + complexityBonus + datasetBonus);

        // Release compute resource
        computeResource.releaseCapacity(requiredCapacity);

        // Update model to trained state
        model.train(dataset, accuracy);

        return {
            success: true,
            accuracy,
            trainingTime,
            message: `Training completed in ${trainingTime.toFixed(2)} seconds with ${(accuracy * 100).toFixed(2)}% accuracy`
        };
    }

    public runPipeline(pipeline: Pipeline, computeResource: ComputeResource): PipelineResult {
        const steps = pipeline.getSteps();
        const results = [];
        let success = true;
        let totalTime = 0;

        // Process each step sequentially
        for (const step of steps) {
            const stepTime = step.estimateTime(computeResource);

            // Check if compute resource has enough capacity
            if (computeResource.getAvailableCapacity() < step.getResourceRequirement()) {
                results.push({
                    stepName: step.getName(),
                    success: false,
                    time: 0,
                    message: "Insufficient compute resources"
                });
                success = false;
                break;
            }

            // Allocate compute resource
            computeResource.allocateCapacity(step.getResourceRequirement());

            // Simulate step execution
            const stepSuccess = Math.random() < 0.95; // 95% success rate

            // Release compute resource
            computeResource.releaseCapacity(step.getResourceRequirement());

            totalTime += stepTime;

            results.push({
                stepName: step.getName(),
                success: stepSuccess,
                time: stepTime,
                message: stepSuccess ? "Step completed successfully" : "Step failed"
            });

            if (!stepSuccess) {
                success = false;
                break;
            }
        }

        return {
            success,
            stepResults: results,
            totalTime,
            message: success ? "Pipeline executed successfully" : "Pipeline execution failed"
        };
    }

    public generateVisualization(visualization: Visualization, dataset: Dataset, computeResource: ComputeResource): string {
        // Simple visualization generation simulations
        const compatibleTypes = this.getCompatibleVisualizationTypes(dataset.getType());

        if (!compatibleTypes.includes(visualization.getType())) {
            return "Error: Dataset and visualization type are incompatible";
        }

        // Simulate SVG generation
        const svgWidth = 600;
        const svgHeight = 400;
        let svgContent = `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

        switch (visualization.getType()) {
            case VisualizationType.BarChart:
                svgContent += this.generateBarChartSVG(svgWidth, svgHeight);
                break;
            case VisualizationType.LineChart:
                svgContent += this.generateLineChartSVG(svgWidth, svgHeight);
                break;
            case VisualizationType.ScatterPlot:
                svgContent += this.generateScatterPlotSVG(svgWidth, svgHeight);
                break;
            case VisualizationType.PieChart:
                svgContent += this.generatePieChartSVG(svgWidth, svgHeight);
                break;
            case VisualizationType.Heatmap:
                svgContent += this.generateHeatmapSVG(svgWidth, svgHeight);
                break;
            default:
                svgContent += `<text x="300" y="200" text-anchor="middle">Visualization type not supported</text>`;
        }

        svgContent += "</svg>";
        return svgContent;
    }

    private calculateCompatibility(modelType: ModelType, datasetType: DatasetType): number {
        // Compatibility matrix between model types and dataset types (0-1)
        const compatibilityMatrix: Record<ModelType, Record<DatasetType, number>> = {
            [ModelType.LinearRegression]: {
                [DatasetType.Tabular]: 0.9,
                [DatasetType.TimeSeries]: 0.7,
                [DatasetType.Text]: 0.2,
                [DatasetType.Image]: 0.1,
                [DatasetType.Graph]: 0.3
            },
            [ModelType.LogisticRegression]: {
                [DatasetType.Tabular]: 0.8,
                [DatasetType.TimeSeries]: 0.5,
                [DatasetType.Text]: 0.2,
                [DatasetType.Image]: 0.1,
                [DatasetType.Graph]: 0.2
            },
            [ModelType.DecisionTree]: {
                [DatasetType.Tabular]: 0.8,
                [DatasetType.TimeSeries]: 0.6,
                [DatasetType.Text]: 0.3,
                [DatasetType.Image]: 0.1,
                [DatasetType.Graph]: 0.4
            },
            [ModelType.RandomForest]: {
                [DatasetType.Tabular]: 0.9,
                [DatasetType.TimeSeries]: 0.7,
                [DatasetType.Text]: 0.4,
                [DatasetType.Image]: 0.2,
                [DatasetType.Graph]: 0.5
            },
            [ModelType.SVM]: {
                [DatasetType.Tabular]: 0.8,
                [DatasetType.TimeSeries]: 0.6,
                [DatasetType.Text]: 0.5,
                [DatasetType.Image]: 0.3,
                [DatasetType.Graph]: 0.4
            },
            [ModelType.NeuralNetwork]: {
                [DatasetType.Tabular]: 0.7,
                [DatasetType.TimeSeries]: 0.8,
                [DatasetType.Text]: 0.9,
                [DatasetType.Image]: 0.9,
                [DatasetType.Graph]: 0.6
            },
            [ModelType.CNN]: {
                [DatasetType.Tabular]: 0.4,
                [DatasetType.TimeSeries]: 0.5,
                [DatasetType.Text]: 0.4,
                [DatasetType.Image]: 0.95,
                [DatasetType.Graph]: 0.3
            },
            [ModelType.RNN]: {
                [DatasetType.Tabular]: 0.5,
                [DatasetType.TimeSeries]: 0.9,
                [DatasetType.Text]: 0.8,
                [DatasetType.Image]: 0.3,
                [DatasetType.Graph]: 0.4
            },
            [ModelType.Transformer]: {
                [DatasetType.Tabular]: 0.6,
                [DatasetType.TimeSeries]: 0.7,
                [DatasetType.Text]: 0.95,
                [DatasetType.Image]: 0.7,
                [DatasetType.Graph]: 0.5
            },
            [ModelType.GNN]: {
                [DatasetType.Tabular]: 0.4,
                [DatasetType.TimeSeries]: 0.3,
                [DatasetType.Text]: 0.3,
                [DatasetType.Image]: 0.2,
                [DatasetType.Graph]: 0.95
            }
        };

        return compatibilityMatrix[modelType][datasetType];
    }

    private getCompatibleVisualizationTypes(datasetType: DatasetType): VisualizationType[] {
        // Return compatible visualization types for given dataset type
        switch (datasetType) {
            case DatasetType.Tabular:
                return [
                    VisualizationType.BarChart,
                    VisualizationType.LineChart,
                    VisualizationType.ScatterPlot,
                    VisualizationType.PieChart,
                    VisualizationType.Heatmap
                ];
            case DatasetType.TimeSeries:
                return [
                    VisualizationType.LineChart,
                    VisualizationType.BarChart
                ];
            case DatasetType.Text:
                return [
                    VisualizationType.WordCloud,
                    VisualizationType.NetworkGraph
                ];
            case DatasetType.Image:
                return [
                    VisualizationType.Heatmap,
                    VisualizationType.ScatterPlot
                ];
            case DatasetType.Graph:
                return [
                    VisualizationType.NetworkGraph,
                    VisualizationType.Heatmap
                ];
            default:
                return [];
        }
    }

    // Visualization SVG generation methods
    private generateBarChartSVG(width: number, height: number): string {
        const barCount = 5;
        const barWidth = width / (barCount * 2);
        const maxBarHeight = height * 0.7;

        let svg = `
      <g transform="translate(50, ${height - 50})">
        <line x1="0" y1="0" x2="${width - 100}" y2="0" stroke="black" stroke-width="2" />
        <line x1="0" y1="0" x2="0" y2="-${maxBarHeight + 20}" stroke="black" stroke-width="2" />
    `;

        for (let i = 0; i < barCount; i++) {
            const barHeight = Math.random() * maxBarHeight;
            svg += `
        <rect 
          x="${i * (barWidth * 2) + 10}" 
          y="-${barHeight}" 
          width="${barWidth}" 
          height="${barHeight}" 
          fill="steelblue" 
        />
        <text 
          x="${i * (barWidth * 2) + 10 + barWidth/2}" 
          y="15" 
          text-anchor="middle"
          font-size="12"
        >Cat ${i+1}</text>
      `;
        }

        svg += `</g>`;
        return svg;
    }

    private generateLineChartSVG(width: number, height: number): string {
        const pointCount = 10;
        const xStep = (width - 100) / (pointCount - 1);
        const maxY = height * 0.7;

        const points: Array<{x: number, y: number}> = [];

        for (let i = 0; i < pointCount; i++) {
            const y = Math.random() * maxY;
            points.push({ x: i * xStep, y });
        }

        let pathData = `M ${points[0].x} ${-points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            pathData += ` L ${points[i].x} ${-points[i].y}`;
        }

        let svg = `
      <g transform="translate(50, ${height - 50})">
        <line x1="0" y1="0" x2="${width - 100}" y2="0" stroke="black" stroke-width="2" />
        <line x1="0" y1="0" x2="0" y2="-${maxY + 20}" stroke="black" stroke-width="2" />
        <path d="${pathData}" fill="none" stroke="steelblue" stroke-width="2" />
    `;

        // Add points
        for (const point of points) {
            svg += `<circle cx="${point.x}" cy="${-point.y}" r="4" fill="steelblue" />`;
        }

        svg += `</g>`;
        return svg;
    }

    private generateScatterPlotSVG(width: number, height: number): string {
        const pointCount = 30;
        const maxX = width - 100;
        const maxY = height * 0.7;

        let svg = `
      <g transform="translate(50, ${height - 50})">
        <line x1="0" y1="0" x2="${maxX}" y2="0" stroke="black" stroke-width="2" />
        <line x1="0" y1="0" x2="0" y2="-${maxY + 20}" stroke="black" stroke-width="2" />
    `;

        // Add points
        for (let i = 0; i < pointCount; i++) {
            const x = Math.random() * maxX;
            const y = Math.random() * maxY;
            svg += `<circle cx="${x}" cy="${-y}" r="5" fill="steelblue" opacity="0.7" />`;
        }

        svg += `</g>`;
        return svg;
    }

    private generatePieChartSVG(width: number, height: number): string {
        const radius = Math.min(width, height) * 0.3;
        const centerX = width / 2;
        const centerY = height / 2;

        const slices = 5;
        const colors = ["steelblue", "coral", "gold", "mediumseagreen", "mediumpurple"];

        let svg = `<g transform="translate(${centerX}, ${centerY})">`;

        let startAngle = 0;
        let remainingAngle = 2 * Math.PI;

        for (let i = 0; i < slices - 1; i++) {
            const sliceAngle = Math.random() * remainingAngle * 0.5 + remainingAngle * 0.1;
            const endAngle = startAngle + sliceAngle;

            const startX = radius * Math.cos(startAngle);
            const startY = radius * Math.sin(startAngle);
            const endX = radius * Math.cos(endAngle);
            const endY = radius * Math.sin(endAngle);

            // Create path for pie slice
            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
            const pathData = `
        M 0 0
        L ${startX} ${startY}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
        Z
      `;

            svg += `<path d="${pathData}" fill="${colors[i]}" stroke="white" stroke-width="1" />`;

            // Label position
            const labelAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = labelRadius * Math.cos(labelAngle);
            const labelY = labelRadius * Math.sin(labelAngle);

            svg += `
        <text 
          x="${labelX}" 
          y="${labelY}" 
          text-anchor="middle" 
          dominant-baseline="middle"
          fill="white"
          font-size="12"
        >${Math.round(sliceAngle / (2 * Math.PI) * 100)}%</text>
      `;

            startAngle = endAngle;
            remainingAngle -= sliceAngle;
        }

        // Last slice
        const startX = radius * Math.cos(startAngle);
        const startY = radius * Math.sin(startAngle);
        const endX = radius * Math.cos(2 * Math.PI);
        const endY = radius * Math.sin(2 * Math.PI);

        const largeArcFlag = (2 * Math.PI - startAngle) > Math.PI ? 1 : 0;
        const pathData = `
      M 0 0
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      Z
    `;

        svg += `<path d="${pathData}" fill="${colors[slices - 1]}" stroke="white" stroke-width="1" />`;

        // Label for last slice
        const labelAngle = startAngle + (2 * Math.PI - startAngle) / 2;
        const labelRadius = radius * 0.7;
        const labelX = labelRadius * Math.cos(labelAngle);
        const labelY = labelRadius * Math.sin(labelAngle);

        svg += `
      <text 
        x="${labelX}" 
        y="${labelY}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        fill="white"
        font-size="12"
      >${Math.round((2 * Math.PI - startAngle) / (2 * Math.PI) * 100)}%</text>
    `;

        svg += `</g>`;
        return svg;
    }

    private generateHeatmapSVG(width: number, height: number): string {
        const rows = 8;
        const cols = 10;
        const cellWidth = (width - 100) / cols;
        const cellHeight = (height - 100) / rows;

        let svg = `<g transform="translate(50, 50)">`;

        // Generate cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const value = Math.random();
                // Color from blue (low) to red (high)
                const color = `hsl(${240 - value * 240}, 70%, 60%)`;

                svg += `
          <rect 
            x="${col * cellWidth}" 
            y="${row * cellHeight}" 
            width="${cellWidth}" 
            height="${cellHeight}" 
            fill="${color}"
            stroke="white"
            stroke-width="1"
          />
        `;
            }
        }

        svg += `</g>`;
        return svg;
    }

    public simulate(timeStep: number): void {
        // Update compute resources
        this.computeResources.forEach(resource => {
            resource.simulate(timeStep);
        });

        // Update training progress for models
        this.models.forEach(model => {
            if (model.getStatus() === ModelStatus.Training) {
                model.updateTrainingProgress(timeStep);
            }
        });

        // Update running pipelines
        this.pipelines.forEach(pipeline => {
            if (pipeline.getStatus() === PipelineStatus.Running) {
                pipeline.updateProgress(timeStep);
            }
        });
    }

    public render(): void {
        console.log("Data Science System Status:");
        console.log(`Datasets: ${this.datasets.length}`);
        console.log(`Models: ${this.models.length} (${this.models.filter(m => m.getStatus() === ModelStatus.Trained).length} trained)`);
        console.log(`Pipelines: ${this.pipelines.length}`);
        console.log(`Visualizations: ${this.visualizations.length}`);
        console.log(`Compute Resources: ${this.computeResources.length}`);
    }
}