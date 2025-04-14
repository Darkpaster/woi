/**
 * 2d.ts — набор утилитарных математических моделей для работы с объектами на плоскости.
 */
import {RenderOptions, Visualizable} from "./graphics.ts";
import {CoordinateSystem} from "../../core/logic/education/math/visualization/coordinateSystem.ts";
import {MathObject} from "./general.ts";

export class Vector2D extends MathObject implements Visualizable {
    public x: number;
    public y: number;

    constructor(x: number, y: number, name: string = "", description?: string) {
        super(name || `V(${x.toFixed(1)},${y.toFixed(1)})`, description);
        this.x = x;
        this.y = y;
    }

    public add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    public subtract(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    public multiply(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    public divide(scalar: number): Vector2D {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    public magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(): Vector2D {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector2D(0, 0);
        }
        return this.divide(mag);
    }

    public rotate(angle: number): Vector2D {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2D(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }

    public distance(other: Vector2D): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Отрисовка вектора
     */
    render(ctx: CanvasRenderingContext2D, options?: RenderOptions): void {
        const coordinateSystem = options?.coordinateSystem;
        const start = new Point(0, 0); // Начало вектора в начале координат

        let startScreen: Point;
        let endScreen: Point;

        if (coordinateSystem) {
            startScreen = coordinateSystem.toScreenCoordinates(start);
            endScreen = coordinateSystem.toScreenCoordinates(new Point(this.x, this.y));
        } else {
            startScreen = start;
            endScreen = new Point(this.x, this.y);
        }

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(startScreen.x, startScreen.y);
        ctx.lineTo(endScreen.x, endScreen.y);

        ctx.strokeStyle = options?.strokeStyle || options?.color || 'red';
        ctx.lineWidth = options?.lineWidth || 2;
        ctx.stroke();

        // Рисуем стрелку
        const angle = Math.atan2(endScreen.y - startScreen.y, endScreen.x - startScreen.x);
        const arrowSize = 10;

        ctx.beginPath();
        ctx.moveTo(endScreen.x, endScreen.y);
        ctx.lineTo(
            endScreen.x - arrowSize * Math.cos(angle - Math.PI / 6),
            endScreen.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endScreen.x - arrowSize * Math.cos(angle + Math.PI / 6),
            endScreen.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();

        ctx.fillStyle = options?.fillStyle || options?.color || 'red';
        ctx.fill();

        // Добавляем метку, если нужно
        if (options?.showLabels && this.getName()) {
            ctx.font = `${options?.fontSize || 12}px ${options?.fontFamily || 'Arial'}`;
            ctx.fillStyle = options?.color || 'black';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';

            const midX = (startScreen.x + endScreen.x) / 2 + 5;
            const midY = (startScreen.y + endScreen.y) / 2 - 5;

            ctx.fillText(this.getName(), midX, midY);
        }

        ctx.restore();
    }


}


/**
 * Координатная точка в 2D пространстве
 */
export class Point extends MathObject implements Visualizable {
    x: number;
    y: number;

    constructor(x: number, y: number, name: string = "", description?: string) {
        super(name || `P(${x.toFixed(1)},${y.toFixed(1)})`, description);
        this.x = x;
        this.y = y;
    }

    distanceTo(other: Point): number {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }

    // Create a point with an offset from this point
    offset(dx: number, dy: number): Point {
        return new Point(this.x + dx, this.y + dy);
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    public add(other: Vector2D): Point {
        return new Point(this.x + other.x, this.y + other.y);
    }

    public subtract(other: Vector2D): Point {
        return new Point(this.x - other.x, this.y - other.y);
    }

    public multiply(scalar: number): Point {
        return new Point(this.x * scalar, this.y * scalar);
    }

    public normalize(): Point {
        const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
        if (magnitude === 0) return new Point(0, 0);
        return new Point(this.x / magnitude, this.y / magnitude);
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


/**
 * Class representing a line in 2D
 */
export class Line extends MathObject {
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
        const a = p2.y - p1.y;
        const b = p1.x - p2.x;
        const c = p2.x * p1.y - p1.x * p2.y;

        return new Line(a, b, c, name);
    }

    // Create a line from point and slope
    static fromPointAndSlope(point: Point, slope: number, name: string = "Line"): Line {
        // Line equation: y - y₀ = m(x - x₀)
        // Expanded: -m·x + y + (m·x₀ - y₀) = 0
        // So: a = -m, b = 1, c = m·x₀ - y₀

        const a = -slope;
        const b = 1;
        const c = slope * point.x - point.y;

        return new Line(a, b, c, name);
    }

    // Calculate the distance from a point to this line
    distanceToPoint(point: Point): number {
        // Distance formula: |ax₀ + by₀ + c| / √(a² + b²)
        // Since we normalized our line coefficients, √(a² + b²) = 1

        return Math.abs(this.a * point.x + this.b * point.y + this.c);
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
        const c = -(this.a * point.x + this.b * point.y);
        return new Line(this.a, this.b, c, `${this.getName()} parallel`);
    }

    // Get a perpendicular line passing through a given point
    getPerpendicularThroughPoint(point: Point): Line {
        // Perpendicular line has a and b swapped and one negated
        const a = this.b;
        const b = -this.a;
        const c = -(a * point.x + b * point.y);

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
                y1 = topLeft.y;
                y2 = bottomRight.y;
            } else if (Math.abs(this.a) < 1e-10) {
                // Horizontal line: y = -c/b
                const y = -this.c / this.b;
                x1 = topLeft.x;
                x2 = bottomRight.x;
                y1 = y2 = y;
            } else {
                // Get line as y = mx + b
                const slope = this.getSlope();
                const yInt = this.getYIntercept();

                // Intersect with viewport borders
                // Left edge
                let points = [];
                let x = topLeft.x;
                let y = slope * x + yInt;
                if (y >= topLeft.y && y <= bottomRight.y) {
                    points.push(new Point(x, y));
                }

                // Right edge
                x = bottomRight.x;
                y = slope * x + yInt;
                if (y >= topLeft.y && y <= bottomRight.y) {
                    points.push(new Point(x, y));
                }

                // Top edge
                y = topLeft.y;
                x = (y - yInt) / slope;
                if (x >= topLeft.x && x <= bottomRight.x) {
                    points.push(new Point(x, y));
                }

                // Bottom edge
                y = bottomRight.y;
                x = (y - yInt) / slope;
                if (x >= topLeft.x && x <= bottomRight.x) {
                    points.push(new Point(x, y));
                }

                if (points.length < 2) {
                    // Line doesn't intersect viewport
                    ctx.restore();
                    return;
                }

                // Use the first two points found
                x1 = points[0].x;
                y1 = points[0].y;
                x2 = points[1].x;
                y2 = points[1].y;
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
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;

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

                const cx = centerMath.x;
                const cy = centerMath.y;

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



export class Circle extends MathObject {
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

        const x1 = this.center.x;
        const y1 = this.center.y;
        const x2 = other.center.x;
        const y2 = other.center.y;

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
        const h = this.center.x;
        const k = this.center.y;
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
        const tempPoint = new Point(this.center.x + this.radius, this.center.y);
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



export class Polygon extends MathObject {
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
            area += this.vertices[i].x * this.vertices[j].y;
            area -= this.vertices[j].x * this.vertices[i].y;
        }

        return Math.abs(area) / 2;
    }

    // Check if a point is inside the polygon (ray casting algorithm)
    containsPoint(point: Point): boolean {
        const x = point.x;
        const y = point.y;
        const n = this.vertices.length;

        let inside = false;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = this.vertices[i].x;
            const yi = this.vertices[i].y;
            const xj = this.vertices[j].x;
            const yj = this.vertices[j].y;

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
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
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
                cx += vertex.x;
                cy += vertex.y;
            }

            cx /= n;
            cy /= n;

            const centroid = coordinateSystem.toScreenCoordinates(new Point(cx, cy));
            ctx.fillText(this.getName(), centroid.x, centroid.y);
        }

        ctx.restore();
    }
}



export class Vector {
    /**
     * Сложение двух векторов
     */
    static add(v1: Vector2D, v2: Vector2D) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y
        };
    }

    /**
     * Вычитание векторов (v1 - v2)
     */
    static subtract(v1: Vector2D, v2: Vector2D) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y
        };
    }

    /**
     * Умножение вектора на скаляр
     */
    static multiply(v: Vector2D, scalar: number) {
        return new Vector2D(v.x * scalar,v.y * scalar);
    }

    /**
     * Деление вектора на скаляр
     */
    static divide(v: Vector2D, scalar: number) {
        if (scalar === 0) {
            throw new Error("Деление на ноль");
        }
        return new Vector2D(v.x / scalar,v.y / scalar);
    }

    /**
     * Вычисление длины (модуля) вектора
     */
    static magnitude(v: Vector2D): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    /**
     * Нормализация вектора (получение единичного вектора)
     */
    static normalize(v: Vector2D) {
        const mag = this.magnitude(v);
        if (mag === 0) {
            return { x: 0, y: 0 };
        }
        return this.divide(v, mag);
    }

    /**
     * Скалярное произведение двух векторов
     */
    static dot(v1: Vector2D, v2: Vector2D): number {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * Вычисление расстояния между двумя точками
     */
    static distance(v1: Vector2D, v2: Vector2D): number {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Вращение вектора на заданный угол (в радианах)
     */
    static rotate(v: Vector2D, angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x * cos - v.y * sin,
            y: v.x * sin + v.y * cos
        };
    }

    /**
     * Угол между двумя векторами (в радианах)
     */
    static angle(v1: Vector2D, v2: Vector2D): number {
        const dot = this.dot(v1, v2);
        const mag1 = this.magnitude(v1);
        const mag2 = this.magnitude(v2);

        if (mag1 === 0 || mag2 === 0) {
            return 0;
        }

        const cosAngle = dot / (mag1 * mag2);

        // Обработка погрешностей вычислений
        if (cosAngle > 1) return 0;
        if (cosAngle < -1) return Math.PI;

        return Math.acos(cosAngle);
    }

    /**
     * Ограничение максимальной длины вектора
     */
    // static limit(v: Vector2D, max: number) {
    //     const mag = this.magnitude(v);
    //     if (mag > max) {
    //         return this.multiply(new Vector2D(this.normalize(v), max));
    //     }
    //     return { ...v };
    // }

    /**
     * Отражение вектора относительно нормали поверхности
     */
    // static reflect(v: Vector2D, normal: Vector2D) {
    //     const normalizedNormal = this.normalize(normal);
    //     new Vector2D()
    //     const dot = this.dot(v, normalizedNormal);
    //     return this.subtract(v, this.multiply(normalizedNormal, 2 * dot));
    // }

    /**
     * Линейная интерполяция между двумя векторами
     */
    static lerp(v1: Vector2D, v2: Vector2D, t: number) {
        // Ограничение t в диапазоне [0, 1]
        const clampedT = Math.max(0, Math.min(1, t));
        return {
            x: v1.x + (v2.x - v1.x) * clampedT,
            y: v1.y + (v2.y - v1.y) * clampedT
        };
    }

    /**
     * Создание случайного вектора
     */
    static random(magnitude: number = 1) {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.cos(angle) * magnitude,
            y: Math.sin(angle) * magnitude
        };
    }

    /**
     * Создание случайного вектора в заданном диапазоне
     */
    static randomRange(minX: number, maxX: number, minY: number, maxY: number) {
        return {
            x: minX + Math.random() * (maxX - minX),
            y: minY + Math.random() * (maxY - minY)
        };
    }

    /**
     * Проверка равенства векторов с учетом погрешности
     */
    static equals(v1: Vector2D, v2: Vector2D, epsilon: number = 0.0001): boolean {
        return Math.abs(v1.x - v2.x) < epsilon && Math.abs(v1.y - v2.y) < epsilon;
    }

    /**
     * Получение перпендикулярного вектора (повернутого на 90 градусов)
     */
    static perpendicular(v: Vector2D) {
        return {
            x: -v.y,
            y: v.x
        };
    }
}


/**
 * Получение расстояния между двумя объектами на плоскости
 */
export function calcDistance<T extends { x: number, y: number }>(entity1: T, entity2: T): number {
    return Math.sqrt(Math.pow(entity2!.x - entity1!.x, 2) + Math.pow(entity2!.y - entity1!.y, 2));
}
/**
 * Получение расстояния между двумя объектами на плоскости по оси X
 */
export function calcDistanceX<T extends { x: number, y: number }>(entity1: T, entity2: T): number {
    return Math.abs(entity1.x - entity2.x);
}
/**
 * Получение расстояния между двумя объектами на плоскости по оси Y
 */
export function calcDistanceY<T extends { x: number, y: number }>(entity1: T, entity2: T): number {
    return Math.abs(entity1.y - entity2.y);
}

