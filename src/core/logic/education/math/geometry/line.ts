import {Geometry} from "./geometry.ts";
import Point = Geometry.Point;
import {RenderOptions, Visualizable} from "../../../../../utils/math/graphics.ts";
import {CoordinateSystem} from "../visualization/coordinateSystem.ts";
import {MathObject} from "../mathObject.ts";

/**
 * Class representing a line in 2D
 */
export class Line extends MathObject implements Visualizable {
    // Line equation: ax + by + c = 0
    private a: number;
    private b: number;
    private c: number;

    constructor(a: number, b: number, c: number, name: string = "Line", description?: string) {
        super(name, description);

        // Ensure we don't have a degenerate line (a = b = 0)
        if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
            throw new Error("Degenerate line: a and b cannot both be zero");
        }

        this.a = a;
        this.b = b;
        this.c = c;

        // Normalize coefficients for easier comparisons
        this.normalize();
    }

    getA(): number {
        return this.a;
    }

    getB(): number {
        return this.b;
    }

    getC(): number {
        return this.c;
    }

    // Normalize line equation so that √(a² + b²) = 1
    private normalize(): void {
        const norm = Math.sqrt(this.a * this.a + this.b * this.b);

        if (norm > 0) {
            this.a /= norm;
            this.b /= norm;
            this.c /= norm;
        }
    }

    // Create a line from two points
    static fromPoints(p1: Point, p2: Point, name: string = "Line"): Line {
        const a = p2.getY() - p1.getY();
        const b = p1.getX() - p2.getX();
        const c = p2.getX() * p1.getY() - p1.getX() * p2.getY();

        return new Line(a, b, c, name);
    }

    // Create a line from point and slope
    static fromPointAndSlope(point: Point, slope: number, name: string = "Line"): Line {
        // Line equation: y - y₀ = m(x - x₀)
        // Expanded: -m·x + y + (m·x₀ - y₀) = 0
        // So: a = -m, b = 1, c = m·x₀ - y₀

        const a = -slope;
        const b = 1;
        const c = slope * point.getX() - point.getY();

        return new Line(a, b, c, name);
    }

    // Calculate the distance from a point to this line
    distanceToPoint(point: Point): number {
        // Distance formula: |ax₀ + by₀ + c| / √(a² + b²)
        // Since we normalized our line coefficients, √(a² + b²) = 1

        return Math.abs(this.a * point.getX() + this.b * point.getY() + this.c);
    }

    // Find the intersection point with another line
    intersect(other: Line): Point | null {
        const det = this.a * other.b - this.b * other.a;

        // If det is close to zero, the lines are parallel
        if (Math.abs(det) < 1e-10) {
            return null;
        }

        const x = (this.b * other.c - this.c * other.b) / det;
        const y = (this.c * other.a - this.a * other.c) / det;

        return new Point(x, y, `Intersection`);
    }

    // Check if a point lies on this line
    containsPoint(point: Point, tolerance: number = 1e-10): boolean {
        return this.distanceToPoint(point) < tolerance;
    }

    // Calculate the slope of the line (if possible)
    getSlope(): number {
        if (Math.abs(this.b) < 1e-10) {
            throw new Error("Vertical line has undefined slope");
        }

        return -this.a / this.b;
    }

    // Get y-intercept (b in y = mx + b) if it exists
    getYIntercept(): number {
        if (Math.abs(this.b) < 1e-10) {
            throw new Error("Vertical line has no y-intercept");
        }

        return -this.c / this.b;
    }

    // Get x-intercept if it exists
    getXIntercept(): number {
        if (Math.abs(this.a) < 1e-10) {
            throw new Error("Horizontal line has no x-intercept");
        }

        return -this.c / this.a;
    }

    // Get a parallel line passing through a given point
    getParallelThroughPoint(point: Point): Line {
        // Parallel line has the same a and b coefficients
        const c = -(this.a * point.getX() + this.b * point.getY());
        return new Line(this.a, this.b, c, `${this.getName()} parallel`);
    }

    // Get a perpendicular line passing through a given point
    getPerpendicularThroughPoint(point: Point): Line {
        // Perpendicular line has a and b swapped and one negated
        const a = this.b;
        const b = -this.a;
        const c = -(a * point.getX() + b * point.getY());

        return new Line(a, b, c, `${this.getName()} perpendicular`);
    }

    // Render the line on canvas
    render(ctx: CanvasRenderingContext2D, options?: RenderOptions & {
        coordinateSystem?: CoordinateSystem;
        showInfinite?: boolean;
        segment?: { p1: Point, p2: Point };
    }): void {
        const coordinateSystem = options?.coordinateSystem;
        if (!coordinateSystem) {
            console.error('Coordinate system is required for line rendering');
            return;
        }

        ctx.save();

        ctx.strokeStyle = options?.color || 'blue';
        ctx.lineWidth = options?.strokeWidth || 2;

        // Define how to draw the line
        if (options?.segment) {
            // Draw a line segment between two points
            const { p1, p2 } = options.segment;

            const screenP1 = coordinateSystem.toScreenCoordinates(p1);
            const screenP2 = coordinateSystem.toScreenCoordinates(p2);

            ctx.beginPath();
            ctx.moveTo(screenP1.x, screenP1.y);
            ctx.lineTo(screenP2.x, screenP2.y);
            ctx.stroke();

            // Draw endpoints if needed
            if (options.showLabels) {
                p1.render(ctx, {
                    ...options,
                    coordinateSystem,
                    radius: 3,
                    color: options.color
                });

                p2.render(ctx, {
                    ...options,
                    coordinateSystem,
                    radius: 3,
                    color: options.color
                });
            }
        } else {
            // Draw the full line by finding where it intersects the canvas bounds
            const canvas = ctx.canvas;
            const width = canvas.width;
            const height = canvas.height;

            // Find the corners of the viewport in math coordinates
            const topLeft = coordinateSystem.toMathCoordinates(new Point(0, 0));
            const bottomRight = coordinateSystem.toMathCoordinates(new Point(width, height));

            let x1, y1, x2, y2;

            // Handle different line cases
            if (Math.abs(this.b) < 1e-10) {
                // Vertical line: x = -c/a
                const x = -this.c / this.a;
                x1 = x2 = x;
                y1 = topLeft.getY();
                y2 = bottomRight.getY();
            } else if (Math.abs(this.a) < 1e-10) {
                // Horizontal line: y = -c/b
                const y = -this.c / this.b;
                x1 = topLeft.getX();
                x2 = bottomRight.getX();
                y1 = y2 = y;
            } else {
                // Get line as y = mx + b
                const slope = this.getSlope();
                const yInt = this.getYIntercept();

                // Intersect with viewport borders
                // Left edge
                let points = [];
                let x = topLeft.getX();
                let y = slope * x + yInt;
                if (y >= topLeft.getY() && y <= bottomRight.getY()) {
                    points.push(new Point(x, y));
                }

                // Right edge
                x = bottomRight.getX();
                y = slope * x + yInt;
                if (y >= topLeft.getY() && y <= bottomRight.getY()) {
                    points.push(new Point(x, y));
                }

                // Top edge
                y = topLeft.getY();
                x = (y - yInt) / slope;
                if (x >= topLeft.getX() && x <= bottomRight.getX()) {
                    points.push(new Point(x, y));
                }

                // Bottom edge
                y = bottomRight.getY();
                x = (y - yInt) / slope;
                if (x >= topLeft.getX() && x <= bottomRight.getX()) {
                    points.push(new Point(x, y));
                }

                if (points.length < 2) {
                    // Line doesn't intersect viewport
                    ctx.restore();
                    return;
                }

                // Use the first two points found
                x1 = points[0].getX();
                y1 = points[0].getY();
                x2 = points[1].getX();
                y2 = points[1].getY();
            }

            // Convert to screen coordinates and draw
            const screenP1 = coordinateSystem.toScreenCoordinates(new Point(x1, y1));
            const screenP2 = coordinateSystem.toScreenCoordinates(new Point(x2, y2));

            ctx.beginPath();
            ctx.moveTo(screenP1.x, screenP1.y);
            ctx.lineTo(screenP2.x, screenP2.y);
            ctx.stroke();
        }

        // Add label if needed
        if (options?.showLabels && this.getName()) {
            ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
            ctx.fillStyle = options?.color || 'blue';

            // Find a good position for the label
            let labelX, labelY;

            if (options?.segment) {
                // If it's a segment, put the label in the middle
                const { p1, p2 } = options.segment;
                const midX = (p1.getX() + p2.getX()) / 2;
                const midY = (p1.getY() + p2.getY()) / 2;

                const midPoint = coordinateSystem.toScreenCoordinates(new Point(midX, midY));
                labelX = midPoint.x;
                labelY = midPoint.y;
            } else {
                // For a full line, use a point near the center of the visible portion
                const canvas = ctx.canvas;
                const centerMath = coordinateSystem.toMathCoordinates(
                    new Point(canvas.width / 2, canvas.height / 2)
                );

                // Project the center point onto the line
                const a = this.a;
                const b = this.b;
                const c = this.c;

                const cx = centerMath.getX();
                const cy = centerMath.getY();

                // Find the closest point on the line
                const k = -(a * cx + b * cy + c) / (a * a + b * b);
                const px = cx + k * a;
                const py = cy + k * b;

                const labelPoint = coordinateSystem.toScreenCoordinates(new Point(px, py));
                labelX = labelPoint.x;
                labelY = labelPoint.y;
            }

            // Add a slight offset to avoid drawing on the line
            labelX += 10;
            labelY -= 10;

            ctx.fillText(this.getName(), labelX, labelY);
        }

        ctx.restore();
    }
}