import {Point} from "../../../../../utils/math/2d.ts";
import {RenderOptions, Visualizable} from "../../../../../utils/math/graphics.ts";
import {CoordinateSystem} from "../visualization/coordinateSystem.ts";
import {MathObject} from "../../../../../utils/math/general.ts";
import {f} from "../parser.ts";

export namespace Calculus {

    // ---- Функции и исчисление ----

    /**
     * Базовый класс для математических функций
     */
    export class MathFunction extends MathObject implements Visualizable {
        protected expression = "";
        // Map of function references where key is function name and value is the function expression
        private static functionRefs: Map<string, MathFunction> = new Map();

        constructor(expression: string = "x", name: string = "default", description?: string) {
            super(name, description);
            this.expression = expression;

            // Register this function by name if provided
            if (name && name !== "default") {
                MathFunction.functionRefs.set(name, this);
            }
        }

        /**
         * Evaluate the function at a given x value
         */
        public evaluate(x: number): number {
            // const result = f(this.expression, { x: x });
            // console.log("expression: "+this.expression + ", x: "+x+", result: " + result);
            // return result
            // For simple evaluation, defer to the parser
            try {
                // Check if the expression contains references to other functions
                const compiledExpression = this.compileExpression();
                return compiledExpression(x);
            } catch (error) {
                console.error(`Error evaluating function ${this.getName()} at x=${x}:`, error);
                return NaN;
            }
        }

        /**
         * Compile the expression into a callable function
         */
        private compileExpression(): (x: number) => number {
            // This is a simplification - in a real implementation, you'd need to parse the expression
            // and replace function references with actual function calls

            // Return a function that evaluates the expression using the parser
            return (x: number) => {
                // Replace any function references in the expression with their values
                let processedExpr = this.expression;

                // Look for pattern like g(x) where g is a function name
                const functionCallRegex = /([a-zA-Z_]\w*)\(x\)/g;
                processedExpr = processedExpr.replace(functionCallRegex, (match, funcName) => {
                    const referencedFunc = MathFunction.functionRefs.get(funcName);
                    if (referencedFunc) {
                        // Replace with the actual value at this x
                        return referencedFunc.evaluate(x).toString();
                    }
                    return match; // Keep as is if function not found
                });

                // Now use the parser to evaluate the processed expression
                return f(processedExpr, { x: x });
            };
        }

        public setExpression(expression: string) {
            this.expression = expression;
        }

        /**
         * Register a function reference that can be used in expressions
         */
        public static registerFunction(name: string, func: MathFunction): void {
            MathFunction.functionRefs.set(name, func);
        }

        /**
         * Get a registered function by name
         */
        public static getFunction(name: string): MathFunction | undefined {
            return MathFunction.functionRefs.get(name);
        }

        // Numerical differentiation
        derivative(x: number, h: number = 0.0001): number {
            return (this.evaluate(x + h) - this.evaluate(x - h)) / (2 * h);
        }

        // Numerical integration (trapezoidal method)
        integrate(a: number, b: number, steps: number = 1000): number {
            if (a > b) {
                [a, b] = [b, a];
                return -this.integrate(a, b, steps);
            }

            const dx = (b - a) / steps;
            let sum = 0.5 * (this.evaluate(a) + this.evaluate(b));

            for (let i = 1; i < steps; i++) {
                const x = a + i * dx;
                sum += this.evaluate(x);
            }

            return sum * dx;
        }

        // Visualize the function on a graph
        render(ctx: CanvasRenderingContext2D, options?: RenderOptions & {
            xMin?: number,
            xMax?: number,
            yMin?: number,
            yMax?: number,
            coordinateSystem?: CoordinateSystem;
            samples?: number;
        }): void {
            const coordinateSystem = options?.coordinateSystem;
            if (!coordinateSystem) {
                console.error('Coordinate system is required for function rendering');
                return;
            }

            const canvas = ctx.canvas;
            const origin = coordinateSystem.getOrigin();
            const scale = coordinateSystem.getScale();

            // Define display boundaries
            const xMin = options?.xMin ?? -Math.floor(origin.x / scale.scaleX);
            const xMax = options?.xMax ?? Math.floor((canvas.width - origin.x) / scale.scaleX);
            const samples = options?.samples ?? canvas.width;

            ctx.save();

            // Draw function graph
            ctx.beginPath();

            // X step in mathematical coordinates
            const dx = (xMax - xMin) / samples;

            // Go through all points from xMin to xMax
            let isFirstPoint = true;

            for (let i = 0; i <= samples; i++) {
                const x = xMin + i * dx;
                let y;

                try {
                    y = this.evaluate(x);

                    // Check if the value is within a reasonable range
                    if (!isFinite(y) || isNaN(y)) {
                        // If the function is not defined at this point, break the line
                        if (!isFirstPoint) {
                            ctx.stroke();
                            ctx.beginPath();
                            isFirstPoint = true;
                        }
                        continue;
                    }

                    // Convert to screen coordinates
                    const screenPoint = coordinateSystem.toScreenCoordinates(new Point(x, y));

                    if (isFirstPoint) {
                        ctx.moveTo(screenPoint.x, screenPoint.y);
                        isFirstPoint = false;
                    } else {
                        ctx.lineTo(screenPoint.x, screenPoint.y);
                    }
                } catch (error) {
                    // If there was an error in calculation, break the line
                    if (!isFirstPoint) {
                        ctx.stroke();
                        ctx.beginPath();
                        isFirstPoint = true;
                    }
                }
            }

            ctx.strokeStyle = options?.color || 'blue';
            ctx.lineWidth = options?.strokeWidth || 2;
            ctx.stroke();

            // Add a label if needed
            if (options?.showLabels && this.getName()) {
                ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
                ctx.fillStyle = options?.color || 'blue';

                // Find a good position for the label (in the middle of the visible part of the graph)
                const midX = (xMin + xMax) / 2;
                let midY;
                try {
                    midY = this.evaluate(midX);
                    const screenMidPoint = coordinateSystem.toScreenCoordinates(new Point(midX, midY));

                    // Offset the label by a few pixels from the graph
                    ctx.fillText(this.getName(), screenMidPoint.x + 5, screenMidPoint.y - 5);
                } catch (error) {
                    // If unable to calculate value at midpoint, place label in corner
                    ctx.fillText(this.getName(), origin.x + 10, origin.y - 10);
                }
            }

            ctx.restore();
        }
    }
}