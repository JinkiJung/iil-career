import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useMousePosition } from './useMousePosition';
import type { HeroComponentProps } from './types';

const STATES = ['DEF', 'RDY', 'ACT', 'PAU', 'DON', 'ERR', 'CAN'] as const;
const STATE_COUNT = STATES.length;

/** Base orbital speed in radians per second. */
const BASE_SPEED = 0.4;

/** Node base radius as fraction of the shorter dimension. */
const NODE_RADIUS_FRAC = 0.032;

/** Cursor dot radius as fraction of the shorter dimension. */
const CURSOR_RADIUS_FRAC = 0.018;

/** Proximity threshold (in SVG units) to trigger hover enlargement. */
const HOVER_DISTANCE = 60;

/** How much a hovered node scales up. */
const HOVER_SCALE = 1.45;

interface NodeState {
    x: number;
    y: number;
    angle: number;
    label: string;
}

function getEllipsePoint(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    angle: number
): { x: number; y: number } {
    return {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
    };
}

function computeNodes(
    cx: number,
    cy: number,
    rx: number,
    ry: number
): NodeState[] {
    return STATES.map((label, i) => {
        const angle = (2 * Math.PI * i) / STATE_COUNT - Math.PI / 2;
        const { x, y } = getEllipsePoint(cx, cy, rx, ry, angle);
        return { x, y, angle, label };
    });
}

/**
 * Build an SVG elliptical arc path between two angles on the ellipse.
 * Uses a small arc (the shorter path) between adjacent nodes.
 */
function arcPath(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    startAngle: number,
    endAngle: number,
    segments: number = 24
): string {
    const parts: string[] = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const a = startAngle + (endAngle - startAngle) * t;
        const { x, y } = getEllipsePoint(cx, cy, rx, ry, a);
        parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return parts.join(' ');
}

export const StateMachineOrbit: React.FC<HeroComponentProps> = ({
    contentColor,
    secondaryColor,
    titleColor,
    progress,
    width,
    height,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useMousePosition(containerRef);
    const rafRef = useRef<number>(0);
    const angleRef = useRef<number>(0);
    const [cursorAngle, setCursorAngle] = useState(0);
    const lastTimeRef = useRef<number | null>(null);

    const hasDimensions = width > 0 && height > 0;

    const cx = hasDimensions ? width / 2 : 0;
    const cy = hasDimensions ? height / 2 : 0;
    // Ellipse radii — wider than tall to fit ~20vh height.
    const rx = hasDimensions ? width * 0.38 : 0;
    const ry = hasDimensions ? height * 0.36 : 0;
    const minDim = Math.min(width || 1, height || 1);
    const nodeRadius = minDim * NODE_RADIUS_FRAC;
    const cursorRadius = minDim * CURSOR_RADIUS_FRAC;

    const nodes = useMemo(() => computeNodes(cx, cy, rx, ry), [cx, cy, rx, ry]);

    // Derive cursor position from current angle.
    const cursorPos = getEllipsePoint(cx, cy, rx, ry, cursorAngle);

    // Compute per-node hover proximity (0 = far, 1 = right on top).
    const hoverWeights = useMemo(() => {
        if (!hasDimensions) return nodes.map(() => 0);
        const mouseAbsX = mouse.x * width;
        const mouseAbsY = mouse.y * height;
        return nodes.map((n) => {
            const dx = n.x - mouseAbsX;
            const dy = n.y - mouseAbsY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return Math.max(0, 1 - dist / HOVER_DISTANCE);
        });
    }, [nodes, mouse.x, mouse.y, width, height, hasDimensions]);

    // Animation loop: mouse.x controls speed.
    const animate = useCallback(
        (time: number) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = time;
            }
            const dt = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            // mouse.x 0..1 maps speed from -0.5x to 2x base speed.
            const speedMultiplier = -0.5 + mouse.x * 2.5;
            angleRef.current += BASE_SPEED * speedMultiplier * dt;
            setCursorAngle(angleRef.current);

            rafRef.current = requestAnimationFrame(animate);
        },
        [mouse.x]
    );

    useEffect(() => {
        // Freeze animation when nearly scrolled away or not yet measured.
        if (progress > 0.9 || !hasDimensions) {
            cancelAnimationFrame(rafRef.current);
            lastTimeRef.current = null;
            return;
        }

        lastTimeRef.current = null;
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [animate, progress, hasDimensions]);

    // Overall opacity fades out as the section scrolls away.
    const opacity = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;

    // Build arc data between adjacent states.
    const arcs = useMemo(() => {
        return nodes.map((node, i) => {
            const next = nodes[(i + 1) % STATE_COUNT];
            const d = arcPath(cx, cy, rx, ry, node.angle, next.angle, 32);
            return { d, fromIdx: i, toIdx: (i + 1) % STATE_COUNT };
        });
    }, [nodes, cx, cy, rx, ry]);

    // Dash animation offset keyed to cursorAngle for a flowing effect.
    const dashOffset = -cursorAngle * 40;

    // Render placeholder until dimensions are available.
    if (!hasDimensions) {
        return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                opacity,
                willChange: 'opacity',
            }}
        >
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{ display: 'block' }}
            >
                <defs>
                    {/* Glow filter for the orbiting cursor. */}
                    <filter id="smo-cursor-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                    </filter>
                    {/* Subtle glow for hovered nodes. */}
                    <filter id="smo-node-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                    </filter>
                </defs>

                {/* Center "iil" watermark. */}
                <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={contentColor}
                    opacity={0.06}
                    fontSize={minDim * 0.18}
                    fontWeight={700}
                    fontFamily="monospace"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                    iil
                </text>

                {/* Transition arcs between adjacent states. */}
                {arcs.map((arc, i) => {
                    const fromHover = hoverWeights[arc.fromIdx];
                    const arcBrightness = 0.25 + fromHover * 0.6;
                    return (
                        <path
                            key={`arc-${i}`}
                            d={arc.d}
                            fill="none"
                            stroke={secondaryColor}
                            strokeWidth={1.2 + fromHover * 1.0}
                            opacity={arcBrightness}
                            strokeDasharray="6 4"
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                        />
                    );
                })}

                {/* State nodes. */}
                {nodes.map((node, i) => {
                    const hw = hoverWeights[i];
                    const scale = 1 + hw * (HOVER_SCALE - 1);
                    const r = nodeRadius * scale;
                    const nodeOpacity = 0.55 + hw * 0.45;

                    return (
                        <g key={`node-${i}`}>
                            {/* Outer glow when hovered. */}
                            {hw > 0 && (
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={r + 4}
                                    fill={contentColor}
                                    opacity={hw * 0.2}
                                    filter="url(#smo-node-glow)"
                                />
                            )}
                            {/* Node circle. */}
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={r}
                                fill="none"
                                stroke={contentColor}
                                strokeWidth={1.5}
                                opacity={nodeOpacity}
                            />
                            {/* Node label. */}
                            <text
                                x={node.x}
                                y={node.y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={secondaryColor}
                                fontSize={Math.max(8, nodeRadius * 1.1)}
                                fontFamily="monospace"
                                fontWeight={500}
                                opacity={0.5 + hw * 0.5}
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                            >
                                {node.label}
                            </text>
                        </g>
                    );
                })}

                {/* Orbiting cursor glow layer (behind). */}
                <circle
                    cx={cursorPos.x}
                    cy={cursorPos.y}
                    r={cursorRadius * 2.2}
                    fill={titleColor}
                    opacity={0.25}
                    filter="url(#smo-cursor-glow)"
                />

                {/* Orbiting cursor dot. */}
                <circle
                    cx={cursorPos.x}
                    cy={cursorPos.y}
                    r={cursorRadius}
                    fill={titleColor}
                    opacity={0.9}
                />
            </svg>
        </div>
    );
};
