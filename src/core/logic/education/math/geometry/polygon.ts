import {CoordinateSystem} from "../visualization/coordinateSystem.ts";
import {RenderOptions, Visualizable} from "../../../../../utils/math/graphics.ts";
import {Geometry} from "./geometry.ts";
import Point = Geometry.Point;
import {MathObject} from "../mathObject.ts";

export class Polygon extends MathObject implements Visualizable {
    private vertices: Point[];

    constructor(vertices: Point[], name: string = "Polygon", description?: string) {
        super(name, description);

        // Ensure we have at least 3 points
        if (vertices.length < 3) {
            throw new Error("A polygon must have at least 3 vertices");
        }

        this.vertices = [...vertices];
    }

    getVertices(): Point[] {
        return [...this.vertices];
    }

    getVertexCount(): number {
        return this.vertices.length;
    }

    // Calculate the perimeter of the polygon
    getPerimeter(): number {
        let perimeter = 0;
        const n = this.vertices.length;

        for (let i = 0; i < n; i++) {
            const next = (i + 1) % n;
            perimeter += this.vertices[i].distanceTo(this.vertices[next]);
        }

        return perimeter;
    }

    // Calculate the area of the polygon using the Shoelace formula
    getArea(): number {
        let area = 0;
        const n = this.vertices.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += this.vertices[i].getX() * this.vertices[j].getY();
            area -= this.vertices[j].getX() * this.vertices[i].getY();
        }

        return Math.abs(area) / 2;
    }

    // Check if a point is inside the polygon (ray casting algorithm)
    containsPoint(point: Point): boolean {
        const x = point.getX();
        const y = point.getY();
        const n = this.vertices.length;

        let inside = false;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = this.vertices[i].getX();
            const yi = this.vertices[i].getY();
            const xj = this.vertices[j].getX();
            const yj = this.vertices[j].getY();

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    }

    // Create a regular polygon with n sides
    static regular(center: Point, radius: number, sides: number, rotation: number = 0, name: string = "Regular Polygon"): Polygon {
        if (sides < 3) {
            throw new Error("A regular polygon must have at least 3 sides");
        }

        const vertices: Point[] = [];
        const angleStep = 2 * Math.PI / sides;

        for (let i = 0; i < sides; i++) {
            const angle = rotation + i * angleStep;
            const x = center.getX() + radius * Math.cos(angle);
            const y = center.getY() + radius * Math.sin(angle);
            vertices.push(new Point(x, y));
        }

        return new Polygon(vertices, name);
    }

    // Render the polygon on canvas
    render(ctx: CanvasRenderingContext2D, options?: RenderOptions & {
        coordinateSystem?: CoordinateSystem;
        fillPolygon?: boolean;
        showVertices?: boolean;
    }): void {
        const coordinateSystem = options?.coordinateSystem;
        if (!coordinateSystem) {
            console.error('Coordinate system is required for polygon rendering');
            return;
        }

        ctx.save();

        // Draw the polygon
        ctx.beginPath();

        const n = this.vertices.length;

        if (n > 0) {
            const firstVertex = coordinateSystem.toScreenCoordinates(this.vertices[0]);
            ctx.moveTo(firstVertex.x, firstVertex.y);

            for (let i = 1; i < n; i++) {
                const vertex = coordinateSystem.toScreenCoordinates(this.vertices[i]);
                ctx.lineTo(vertex.x, vertex.y);
            }

            ctx.closePath();
        }

        if (options?.fillPolygon) {
            ctx.fillStyle = options?.fillStyle || 'rgba(0, 0, 255, 0.2)';
            ctx.fill();
        }

        ctx.strokeStyle = options?.color || 'blue';
        ctx.lineWidth = options?.strokeWidth || 2;
        ctx.stroke();

        // Show vertices if requested
        if (options?.showVertices) {
            for (const vertex of this.vertices) {
                vertex.render(ctx, {
                    ...options,
                    coordinateSystem,
                    radius: 3,
                    color: options?.color,
                    showLabels: false  // Don't show individual vertex labels to avoid clutter
                });
            }
        }

        // Add label if needed
        if (options?.showLabels && this.getName()) {
            ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
            ctx.fillStyle = options?.color || 'blue';

            // Calculate centroid for label placement
            let cx = 0, cy = 0;

            for (const vertex of this.vertices) {
                cx += vertex.getX();
                cy += vertex.getY();
            }

            cx /= n;
            cy /= n;

            const centroid = coordinateSystem.toScreenCoordinates(new Point(cx, cy));
            ctx.fillText(this.getName(), centroid.x, centroid.y);
        }

        ctx.restore();
    }
}