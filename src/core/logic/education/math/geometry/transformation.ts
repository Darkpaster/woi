import {Polygon} from "./polygon.ts";
import {Line} from "./line.ts";
import {Geometry} from "./geometry.ts";
import Point = Geometry.Point;

/**
 * Class for demonstrating geometric transformations
 */
export class Transformation {
    // Apply translation to a point
    static translate(point: Point, dx: number, dy: number): Point {
        return new Point(
            point.getX() + dx,
            point.getY() + dy,
            `${point.getName()}'`
        );
    }

    // Apply translation to a polygon
    static translatePolygon(polygon: Polygon, dx: number, dy: number): Polygon {
        const vertices = polygon.getVertices();
        const transformedVertices = vertices.map(v => Transformation.translate(v, dx, dy));

        return new Polygon(
            transformedVertices,
            `${polygon.getName()}'`,
            polygon.getDescription()
        );
    }

    // Apply rotation to a point around the origin
    static rotateAroundOrigin(point: Point, angle: number): Point {
        const x = point.getX();
        const y = point.getY();

        const cos = Math.cos(angle);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const newX = x * cos - y * sin;
        const newY = x * sin + y * cos;

        return new Point(newX, newY, `${point.getName()}'`);
    }

    // Apply rotation to a point around another point
    static rotateAroundPoint(point: Point, center: Point, angle: number): Point {
        // Translate to origin
        const translated = Transformation.translate(point, -center.getX(), -center.getY());

        // Rotate around origin
        const rotated = Transformation.rotateAroundOrigin(translated, angle);

        // Translate back
        return Transformation.translate(rotated, center.getX(), center.getY());
    }

    // Apply rotation to a polygon around a point
    static rotatePolygon(polygon: Polygon, center: Point, angle: number): Polygon {
        const vertices = polygon.getVertices();
        const transformedVertices = vertices.map(v =>
            Transformation.rotateAroundPoint(v, center, angle)
        );

        return new Polygon(
            transformedVertices,
            `${polygon.getName()}'`,
            polygon.getDescription()
        );
    }

    // Apply scaling to a point relative to the origin
    static scaleFromOrigin(point: Point, sx: number, sy: number): Point {
        return new Point(
            point.getX() * sx,
            point.getY() * sy,
            `${point.getName()}'`
        );
    }

    // Apply scaling to a point relative to another point
    static scaleFromPoint(point: Point, center: Point, sx: number, sy: number): Point {
        // Translate to origin
        const translated = Transformation.translate(point, -center.getX(), -center.getY());

        // Scale
        const scaled = Transformation.scaleFromOrigin(translated, sx, sy);

        // Translate back
        return Transformation.translate(scaled, center.getX(), center.getY());
    }

    // Apply scaling to a polygon
    static scalePolygon(polygon: Polygon, center: Point, sx: number, sy: number): Polygon {
        const vertices = polygon.getVertices();
        const transformedVertices = vertices.map(v =>
            Transformation.scaleFromPoint(v, center, sx, sy)
        );

        return new Polygon(
            transformedVertices,
            `${polygon.getName()}'`,
            polygon.getDescription()
        );
    }

    // Apply reflection across a line
    static reflectAcrossLine(point: Point, line: Line): Point {
        const a = line.getA();
        const b = line.getB();
        const c = line.getC();

        const x = point.getX();
        const y = point.getY();

        // Calculate the closest point on the line (projection)
        const denominator = a * a + b * b;
        const t = -(a * x + b * y + c) / denominator;

        const projX = x + t * a;
        const projY = y + t * b;

        // The reflection is twice the projection minus the original point
        const newX = 2 * projX - x;
        const newY = 2 * projY - y;

        return new Point(newX, newY, `${point.getName()}'`);
    }

    // Apply reflection of a polygon across a line
    static reflectPolygonAcrossLine(polygon: Polygon, line: Line): Polygon {
        const vertices = polygon.getVertices();
        const transformedVertices = vertices.map(v =>
            Transformation.reflectAcrossLine(v, line)
        );

        return new Polygon(
            transformedVertices,
            `${polygon.getName()}'`,
            polygon.getDescription()
        );
    }
}