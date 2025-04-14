import {CoordinateSystem} from "./coordinateSystem.ts";
import {RenderOptions, Visualizable} from "../../../../../utils/math/graphics.ts";
import {Point} from "../../../../../utils/math/2d.ts";

export namespace Visualization {
    /**
     * Class for mathematical canvas to visualize geometric objects
     */
    export class MathCanvas {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private coordinateSystem: CoordinateSystem;
        private objects: Array<{ object: Visualizable, options: RenderOptions }>;
        private animationFrameId: number | null = null;
        private eventListeners: { [key: string]: Function[] } = {};

        constructor(
            canvasElement: HTMLCanvasElement | string,
            originX?: number,
            originY?: number,
            scaleX?: number,
            scaleY?: number,
            invertY: boolean = true
        ) {
            // Initialize canvas
            if (typeof canvasElement === 'string') {
                const element = document.getElementById(canvasElement) as HTMLCanvasElement;
                if (!element) {
                    throw new Error(`Canvas with id '${canvasElement}' not found`);
                }
                this.canvas = element;
            } else {
                this.canvas = canvasElement;
            }

            this.canvas.width = 600;
            this.canvas.height = 600;

            const context = this.canvas.getContext('2d');
            if (!context) {
                throw new Error('Failed to get canvas 2D context');
            }
            this.ctx = context;

            // Initialize coordinate system with default values if not provided
            this.coordinateSystem = new CoordinateSystem(
                new Point(originX ?? this.canvas.width / 2, originY ?? this.canvas.height / 2),
                scaleX ?? 50,
                scaleY ?? 50,
                // invertY
            );

            // Initialize objects array
            this.objects = [];

            // Set up event handlers
            this.setupEventListeners();

            // Initial render
            this.render();
        }

        // Get canvas element
        getCanvas(): HTMLCanvasElement {
            return this.canvas;
        }

        // Get canvas context
        getContext(): CanvasRenderingContext2D {
            return this.ctx;
        }

        // Get coordinate system
        getCoordinateSystem(): CoordinateSystem {
            return this.coordinateSystem;
        }

        // Set new coordinate system
        setCoordinateSystem(coordSystem: CoordinateSystem): void {
            this.coordinateSystem = coordSystem;
            this.render();
        }

        // Add a visualizable object to the canvas
        addObject(object: Visualizable, renderOptions?: RenderOptions): void {
            if (typeof object.render !== 'function') {
                console.error('Object does not have a render method', object);
                return;
            }

            this.objects.push({ object: object, options: renderOptions });

            this.render();
        }

        // Remove an object from the canvas
        removeObject(object: Visualizable): boolean {
            const index = this.objects.findIndex(o => o.object === object);

            if (index >= 0) {
                this.objects.splice(index, 1);
                this.render();
                return true;
            }

            return false;
        }

        // Clear all objects
        clearObjects(): void {
            this.objects = [];
            this.render();
        }

        // Convert screen coordinates to math coordinates
        screenToMath(x: number, y: number): Point {
            return this.coordinateSystem.toMathCoordinates(new Point(x, y));
        }

        // Convert math coordinates to screen coordinates
        mathToScreen(point: Point): Point {
            return this.coordinateSystem.toScreenCoordinates(point);
        }

        // Render all objects
        render(): void {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.coordinateSystem.render(this.ctx, {
                showGrid: true,
                showAxes: true,
                showLabels: true
            });

            for (const item of this.objects) {
                item.object.render(this.ctx, {
                    ...item.options,
                    coordinateSystem: this.coordinateSystem
                });
            }
        }

        // Set up pan and zoom event handlers
        private setupEventListeners(): void {
            let isDragging = false;
            let lastX = 0;
            let lastY = 0;

            // Mouse wheel for zoom
            this.canvas.addEventListener('wheel', (e) => {
                e.preventDefault();

                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Determine zoom direction and factor
                const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

                // Zoom coordinate system around mouse position
                this.coordinateSystem.zoom(zoomFactor, mouseX, mouseY); //zoom тоже надо создать

                // Trigger zoom event
                this.triggerEvent('zoom', { factor: zoomFactor, x: mouseX, y: mouseY });

                // Re-render
                this.render();
            });

            // Mouse down to start panning
            this.canvas.addEventListener('mousedown', (e) => {
                isDragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
                this.canvas.style.cursor = 'grabbing';
            });

            // Mouse move for panning
            this.canvas.addEventListener('mousemove', (e) => {
                // Track mouse position for user interaction
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Trigger mousemove event
                const mathPoint = this.screenToMath(mouseX, mouseY);
                this.triggerEvent('mousemove', {
                    x: mouseX,
                    y: mouseY,
                    mathX: mathPoint.x,
                    mathY: mathPoint.y
                });

                if (isDragging) {
                    const dx = e.clientX - lastX;
                    const dy = e.clientY - lastY;

                    this.coordinateSystem.pan(dx, dy); // функцию pan тоже надо создать

                    // Trigger pan event
                    this.triggerEvent('pan', { dx, dy });

                    // Update last position
                    lastX = e.clientX;
                    lastY = e.clientY;

                    // Re-render
                    this.render();
                }
            });

            // Mouse up to end panning
            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    this.canvas.style.cursor = 'default';
                }
            });

            // Resize canvas to fill parent
            window.addEventListener('resize', () => {
                this.resizeToParent();
            });
        }

        // Resize canvas to match parent element dimensions
        resizeToParent(): void {
            const parent = this.canvas.parentElement;

            if (parent) {
                const oldWidth = this.canvas.width;
                const oldHeight = this.canvas.height;

                // Get parent dimensions
                const rect = parent.getBoundingClientRect();

                // Update canvas size
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;

                // Adjust coordinate system origin to maintain center
                const origin = this.coordinateSystem.getOrigin();
                const newOriginX = origin.x * (this.canvas.width / oldWidth);
                const newOriginY = origin.y * (this.canvas.height / oldHeight);

                this.coordinateSystem = new CoordinateSystem(
                    new Point(newOriginX, newOriginY),
                    this.coordinateSystem.getScale().scaleX,
                    this.coordinateSystem.getScale().scaleY,
                    // true
                );

                // Re-render
                this.render();
            }
        }

        // Start animation loop
        startAnimation(animationFn: (time: number, deltaTime: number) => void): void {
            let lastTime = 0;

            const animate = (time: number) => {
                // Calculate time delta in seconds
                const deltaTime = (time - lastTime) / 1000;
                lastTime = time;

                // Call animation function
                animationFn(time, deltaTime);

                // Re-render
                this.render();

                // Continue animation loop
                this.animationFrameId = requestAnimationFrame(animate);
            };

            // Start animation loop
            this.animationFrameId = requestAnimationFrame(animate);
        }

        // Stop animation loop
        stopAnimation(): void {
            if (this.animationFrameId !== null) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }

        // Add event listener
        addEventListener(event: string, callback: Function): void {
            if (!this.eventListeners[event]) {
                this.eventListeners[event] = [];
            }

            this.eventListeners[event].push(callback);
        }

        // Remove event listener
        removeEventListener(event: string, callback: Function): void {
            if (this.eventListeners[event]) {
                this.eventListeners[event] = this.eventListeners[event].filter(
                    fn => fn !== callback
                );
            }
        }

        // Trigger event
        private triggerEvent(event: string, data: any): void {
            if (this.eventListeners[event]) {
                for (const callback of this.eventListeners[event]) {
                    callback(data);
                }
            }
        }
    }
}