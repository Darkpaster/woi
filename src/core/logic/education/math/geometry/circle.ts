import {Geometry} from "./geometry.ts";
import Point = Geometry.Point;
import {CoordinateSystem} from "../visualization/coordinateSystem.ts";
import {RenderOptions, Visualizable} from "../../../../../utils/math/graphics.ts";
import {Line} from "./line.ts";
import {MathObject} from "../mathObject.ts";

export class Circle extends MathObject implements Visualizable {
    private center: Point;
    private radius: number;

    constructor(center: Point, radius: number, name: string = "Circle", description?: string) {
        super(name, description);

        if (radius <= 0) {
            throw new Error("Circle radius must be positive");
        }

        this.center = center;
        this.radius = radius;
    }

    getCenter(): Point {
        return this.center;
    }

    getRadius(): number {
        return this.radius;
    }

    // Calculate the area of the circle
    getArea(): number {
        return Math.PI * this.radius * this.radius;
    }

    // Calculate the circumference of the circle
    getCircumference(): number {
        return 2 * Math.PI * this.radius;
    }

    // Check if a point is inside the circle
    containsPoint(point: Point): boolean {
        return this.center.distanceTo(point) <= this.radius;
    }

    // Find the intersection points with another circle
    intersectWithCircle(other: Circle): Point[] {
        const r1 = this.radius;
        const r2 = other.radius;

        const x1 = this.center.getX();
        const y1 = this.center.getY();
        const x2 = other.center.getX();
        const y2 = other.center.getY();

        // Distance between centers
        const d = this.center.distanceTo(other.center);

        // Check if circles don't intersect or one is inside the other
        if (d > r1 + r2 || d < Math.abs(r1 - r2)) {
            return [];
        }

        // Check if circles are exactly touching (tangent)
        if (Math.abs(d - (r1 + r2)) < 1e-10 || Math.abs(d - Math.abs(r1 - r2)) < 1e-10) {
            // Circles touch at exactly one point
            const ratio = r1 / d;
            const x = x1 + ratio * (x2 - x1);
            const y = y1 + ratio * (y2 - y1);
            return [new Point(x, y, "Tangent point")];
        }

        // Calculate intersection points
        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        const h = Math.sqrt(r1 * r1 - a * a);

        // Find point P2 (the point on the line connecting centers, at distance a from center1)
        const x3 = x1 + a * (x2 - x1) / d;
        const y3 = y1 + a * (y2 - y1) / d;

        // Calculate the two intersection points
        const x4_1 = x3 + h * (y2 - y1) / d;
        const y4_1 = y3 - h * (x2 - x1) / d;

        const x4_2 = x3 - h * (y2 - y1) / d;
        const y4_2 = y3 + h * (x2 - x1) / d;

        return [
            new Point(x4_1, y4_1, "Intersection1"),
            new Point(x4_2, y4_2, "Intersection2")
        ];
    }

    // Find the intersection points with a line
    intersectWithLine(line: Line): Point[] {
        // Convert to the standard form: (x-h)² + (y-k)² = r²
        const h = this.center.getX();
        const k = this.center.getY();
        const r = this.radius;

        // Get line coefficients: ax + by + c = 0
        const a = line.getA();
        const b = line.getB();
        const c = line.getC();

        // The distance from center to line
        const dist = Math.abs(a * h + b * k + c) / Math.sqrt(a * a + b * b);

        // Check if line doesn't intersect the circle
        if (dist > r) {
            return [];
        }

        // If the line is tangent to the circle (touches at exactly one point)
        if (Math.abs(dist - r) < 1e-10) {
            // Find the tangent point
            const t = -1 * (a * h + b * k + c) / (a * a + b * b);
            const x = h + t * a;
            const y = k + t * b;
            return [new Point(x, y, "Tangent point")];
        }

        // The line intersects the circle at two points
        // Find the closest point on the line to the center
        const t = -(a * h + b * k + c) / (a * a + b * b);
        const x0 = h + t * a;
        const y0 = k + t * b;

        // Find the distance from this closest point to the intersection points
        const d = Math.sqrt(r * r - dist * dist);

        // Direction vector of the line
        const norm = Math.sqrt(a * a + b * b);
        const ex = b / norm;  // Perpendicular to the line normal
        const ey = -a / norm;

        const x1 = x0 + ex * d;
        const y1 = y0 + ey * d;

        const x2 = x0 - ex * d;
        const y2 = y0 - ey * d;

        return [
            new Point(x1, y1, "Intersection1"),
            new Point(x2, y2, "Intersection2")
        ];
    }

    // Render the circle on canvas
    render(ctx: CanvasRenderingContext2D, options?: RenderOptions & {
        coordinateSystem?: CoordinateSystem;
        fillCircle?: boolean;
        showCenter?: boolean;
        showRadius?: boolean;
    }): void {
        const coordinateSystem = options?.coordinateSystem;
        if (!coordinateSystem) {
            console.error('Coordinate system is required for circle rendering');
            return;
        }

        ctx.save();

        // Convert center to screen coordinates
        const screenCenter = coordinateSystem.toScreenCoordinates(this.center);

        // Calculate radius in screen coordinates
        const tempPoint = new Point(this.center.getX() + this.radius, this.center.getY());
        const screenTempPoint = coordinateSystem.toScreenCoordinates(tempPoint);
        const screenRadius = Math.abs(screenTempPoint.x - screenCenter.x);

        // Draw the circle
        ctx.beginPath();
        ctx.arc(screenCenter.x, screenCenter.y, screenRadius, 0, 2 * Math.PI);

        if (options?.fillCircle) {
            ctx.fillStyle = options?.fillStyle || 'rgba(0, 0, 255, 0.2)';
            ctx.fill();
        }

        ctx.strokeStyle = options?.color || 'blue';
        ctx.lineWidth = options?.strokeWidth || 2;
        ctx.stroke();

        // Show center point if requested
        if (options?.showCenter) {
            ctx.beginPath();
            ctx.arc(screenCenter.x, screenCenter.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = options?.color || 'blue';
            ctx.fill();
        }

        // Show radius line if requested
        if (options?.showRadius) {
            ctx.beginPath();
            ctx.moveTo(screenCenter.x, screenCenter.y);
            ctx.lineTo(screenCenter.x + screenRadius, screenCenter.y);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Add label if needed
        if (options?.showLabels && this.getName()) {
            ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
            ctx.fillStyle = options?.color || 'blue';

            // Position the label above the circle
            ctx.fillText(
                this.getName(),
                screenCenter.x - screenRadius,
                screenCenter.y - screenRadius - 5
            );

            // Add radius length if showing radius
            if (options?.showRadius) {
                ctx.fillText(
                    `r = ${this.radius.toFixed(2)}`,
                    screenCenter.x + screenRadius / 2,
                    screenCenter.y - 5
                );
            }
        }

        ctx.restore();
    }
}