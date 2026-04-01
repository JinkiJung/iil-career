import { useEffect, useRef } from 'react';
import type { HeroComponentProps } from './types';
import { useMousePosition } from './useMousePosition';

interface Feature {
    x: number;
    y: number;
    depth: number;
    opacity: number;
    trail: { x: number; y: number }[];
}

function createFeatures(width: number, height: number, count: number): Feature[] {
    const features: Feature[] = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = 0.15 + (((i * 7 + 3) % 11) / 11) * 0.7;
        features.push({
            x: width * (0.5 + r * 0.45 * Math.cos(angle + i * 0.3)),
            y: height * (0.5 + r * 0.4 * Math.sin(angle + i * 0.5)),
            depth: 0.5 + ((i * 13 + 7) % 17) / 17 * 1.5,
            opacity: 1,
            trail: [],
        });
    }
    return features;
}

export const FeatureTracker = ({
    contentColor,
    secondaryColor,
    titleColor,
    progress,
    width,
    height,
}: HeroComponentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const featuresRef = useRef<Feature[]>([]);
    const prevMouseRef = useRef({ x: 0.5, y: 0.5 });
    const rafRef = useRef(0);
    const mouse = useMousePosition(containerRef);

    useEffect(() => {
        if (width > 0 && height > 0) {
            featuresRef.current = createFeatures(width, height, 20);
        }
    }, [width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || width <= 0 || height <= 0) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const parseColor = (hex: string) => {
            const c = hex.replace('#', '');
            if (c.length === 3) {
                return {
                    r: parseInt(c[0] + c[0], 16),
                    g: parseInt(c[1] + c[1], 16),
                    b: parseInt(c[2] + c[2], 16),
                };
            }
            return {
                r: parseInt(c.slice(0, 2), 16),
                g: parseInt(c.slice(2, 4), 16),
                b: parseInt(c.slice(4, 6), 16),
            };
        };

        const secondary = parseColor(secondaryColor);
        const title = parseColor(titleColor === 'white' ? '#ffffff' : titleColor);
        const content = parseColor(contentColor);

        const animate = () => {
            if (progress > 0.9) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            const features = featuresRef.current;
            const dx = (mouse.x - prevMouseRef.current.x) * width * 0.5;
            const dy = (mouse.y - prevMouseRef.current.y) * height * 0.5;
            prevMouseRef.current = { x: mouse.x, y: mouse.y };

            // Update features
            for (const f of features) {
                // Push current position to trail
                f.trail.push({ x: f.x, y: f.y });
                if (f.trail.length > 10) f.trail.shift();

                // Move by mouse delta scaled by depth
                f.x += dx * f.depth;
                f.y += dy * f.depth;

                // Out of bounds handling
                const margin = 30;
                if (f.x < -margin || f.x > width + margin || f.y < -margin || f.y > height + margin) {
                    f.opacity = Math.max(0, f.opacity - 0.05);
                    if (f.opacity <= 0) {
                        // Respawn on opposite side
                        if (dx > 0) f.x = -10;
                        else if (dx < 0) f.x = width + 10;
                        else f.x = Math.random() * width;

                        if (dy > 0) f.y = -10;
                        else if (dy < 0) f.y = height + 10;
                        else f.y = Math.random() * height;

                        f.depth = 0.5 + Math.random() * 1.5;
                        f.trail = [];
                        f.opacity = 0;
                    }
                } else {
                    f.opacity = Math.min(1, f.opacity + 0.05);
                }
            }

            // Render
            ctx.clearRect(0, 0, width, height);

            // Background dot grid
            const gridSpacing = 30;
            ctx.fillStyle = `rgba(${content.r}, ${content.g}, ${content.b}, 0.08)`;
            for (let gx = gridSpacing / 2; gx < width; gx += gridSpacing) {
                for (let gy = gridSpacing / 2; gy < height; gy += gridSpacing) {
                    ctx.beginPath();
                    ctx.arc(gx, gy, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw trails
            for (const f of features) {
                if (f.trail.length < 2) continue;
                for (let i = 1; i < f.trail.length; i++) {
                    const alpha = (i / f.trail.length) * 0.4 * f.opacity;
                    ctx.strokeStyle = `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(f.trail[i - 1].x, f.trail[i - 1].y);
                    ctx.lineTo(f.trail[i].x, f.trail[i].y);
                    ctx.stroke();
                }
            }

            // Draw crosshair feature points
            for (const f of features) {
                const a = f.opacity;
                if (a <= 0) continue;

                const armLen = 6;

                // Crosshair arms
                ctx.strokeStyle = `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${a * 0.7})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(f.x - armLen, f.y);
                ctx.lineTo(f.x - 2, f.y);
                ctx.moveTo(f.x + 2, f.y);
                ctx.lineTo(f.x + armLen, f.y);
                ctx.moveTo(f.x, f.y - armLen);
                ctx.lineTo(f.x, f.y - 2);
                ctx.moveTo(f.x, f.y + 2);
                ctx.lineTo(f.x, f.y + armLen);
                ctx.stroke();

                // Center dot
                ctx.fillStyle = `rgba(${title.r}, ${title.g}, ${title.b}, ${a})`;
                ctx.beginPath();
                ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [width, height, secondaryColor, titleColor, contentColor, progress, mouse]);

    if (width <= 0 || height <= 0) return null;

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
        >
            <canvas
                ref={canvasRef}
                style={{ display: 'block', width: '100%', height: '100%' }}
            />
        </div>
    );
};
