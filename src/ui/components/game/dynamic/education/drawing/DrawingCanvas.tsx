import {useEffect, useRef} from "react";

interface CanvasProps {
    onRef: (ref: HTMLCanvasElement | null) => void;
}

const DrawingCanvas: React.FC<CanvasProps> = ({ onRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const resizeCanvas = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    const parent = canvas.parentElement;
                    if (parent) {
                        canvas.width = parent.clientWidth;
                        canvas.height = parent.clientHeight;
                    }
                }
            };

            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            onRef(canvasRef.current);

            return () => {
                window.removeEventListener('resize', resizeCanvas);
                onRef(null);
            };
        }
    }, [onRef]);

    return <canvas ref={canvasRef} id="drawing-canvas" />;
};

export default DrawingCanvas;