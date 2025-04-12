import {MathObject} from "../mathObject.ts";
import {RenderOptions, Visualizable} from "../../../../../utils/math/graphics.ts";
import {CoordinateSystem} from "../visualization/coordinateSystem.ts";

export namespace Geometry {

    // ---- Primitive geometric objects ----

    /**
     * Class representing a 2D point
     */
    export class Point extends MathObject implements Visualizable {
        private x: number;
        private y: number;

        constructor(x: number, y: number, name: string = "", description?: string) {
            super(name || `P(${x.toFixed(1)},${y.toFixed(1)})`, description);
            this.x = x;
            this.y = y;
        }

        getX(): number {
            return this.x;
        }

        getY(): number {
            return this.y;
        }

        // Calculate distance to another point
        distanceTo(other: Point): number {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        // Create a point with an offset from this point
        offset(dx: number, dy: number): Point {
            return new Point(this.x + dx, this.y + dy);
        }

        // Render the point on canvas
        render(ctx: CanvasRenderingContext2D, options?: RenderOptions & {
            coordinateSystem?: CoordinateSystem;
            radius?: number;
        }): void {
            const coordinateSystem = options?.coordinateSystem;

            let screenX = this.x;
            let screenY = this.y;

            // Transform to screen coordinates if a coordinate system is provided
            if (coordinateSystem) {
                const screenPoint = coordinateSystem.toScreenCoordinates(this);
                screenX = screenPoint.x;
                screenY = screenPoint.y;
            }

            ctx.save();

            // Draw the point as a circle
            const radius = options?.radius || 4;
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);

            ctx.fillStyle = options?.fillStyle || options?.color || 'blue';
            ctx.fill();

            if (options?.strokeWidth && options?.strokeWidth > 0) {
                ctx.strokeStyle = options?.color || 'black';
                ctx.lineWidth = options?.strokeWidth;
                ctx.stroke();
            }

            // Add label if needed
            if (options?.showLabels && this.getName()) {
                ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
                ctx.fillStyle = options?.color || 'black';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(this.getName(), screenX + radius + 2, screenY + radius + 2);
            }

            ctx.restore();
        }
    }
}