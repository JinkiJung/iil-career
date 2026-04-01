import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useMousePosition } from './useMousePosition';
import type { HeroComponentProps } from './types';

const LABELS = ['INIT', 'LOAD', 'EXEC', 'EVAL', 'LOG', 'END'] as const;
const BLOCK_COUNT = LABELS.length;

/** Auto-advance interval in milliseconds. */
const AUTO_ADVANCE_MS = 1500;

/** Block dimensions as fractions of available space. */
const BLOCK_W_FRAC = 0.1;
const BLOCK_H_FRAC = 0.14;
const BLOCK_RX = 8;

/** Arrow triangle size. */
const ARROW_SIZE = 6;

export const ScriptFlowEngine: React.FC<HeroComponentProps> = ({
    contentColor,
    secondaryColor,
    titleColor,
    progress,
    width,
    height,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useMousePosition(containerRef);
    const [isHovering, setIsHovering] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const hasDimensions = width > 0 && height > 0;

    const blockW = hasDimensions ? Math.max(40, width * BLOCK_W_FRAC) : 0;
    const blockH = hasDimensions ? Math.max(28, height * BLOCK_H_FRAC) : 0;
    const gap = hasDimensions ? (width - blockW * BLOCK_COUNT) / (BLOCK_COUNT + 1) : 0;
    const cy = hasDimensions ? height / 2 : 0;
    const minDim = Math.min(width || 1, height || 1);
    const fontSize = Math.max(9, minDim * 0.032);

    const blocks = useMemo(() => {
        if (!hasDimensions) return [];
        return LABELS.map((label, i) => {
            const x = gap + i * (blockW + gap);
            const y = cy - blockH / 2;
            return { x, y, label, index: i };
        });
    }, [gap, blockW, blockH, cy, hasDimensions]);

    // Mouse interaction: determine active block from mouseX when hovering.
    const mouseActiveIndex = useMemo(() => {
        return Math.min(BLOCK_COUNT - 1, Math.max(0, Math.round(mouse.x * (BLOCK_COUNT - 1))));
    }, [mouse.x]);

    // Track hover state via container events.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onEnter = () => setIsHovering(true);
        const onLeave = () => setIsHovering(false);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            el.removeEventListener('mouseenter', onEnter);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    // Update active index from mouse when hovering.
    useEffect(() => {
        if (isHovering) {
            setActiveIndex(mouseActiveIndex);
        }
    }, [isHovering, mouseActiveIndex]);

    // Auto-advance when not hovering (and progress < 0.9).
    useEffect(() => {
        if (isHovering || progress > 0.9) {
            if (autoTimerRef.current) {
                clearInterval(autoTimerRef.current);
                autoTimerRef.current = null;
            }
            return;
        }

        autoTimerRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % BLOCK_COUNT);
        }, AUTO_ADVANCE_MS);

        return () => {
            if (autoTimerRef.current) {
                clearInterval(autoTimerRef.current);
                autoTimerRef.current = null;
            }
        };
    }, [isHovering, progress]);

    const rotateX = (mouse.y - 0.5) * 10;
    const opacity = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;

    if (!hasDimensions || blocks.length === 0) {
        return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
    }

    const barY = cy + blockH / 2 + blockH * 0.55;
    const barHeight = 3;
    const barStartX = blocks[0].x;
    const barEndX = blocks[BLOCK_COUNT - 1].x + blockW;
    const barTotalWidth = barEndX - barStartX;
    const barFillWidth = barTotalWidth * (activeIndex / (BLOCK_COUNT - 1));

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                opacity,
                willChange: 'opacity',
                perspective: `${width}px`,
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `rotateX(${rotateX}deg)`,
                    transition: 'transform 0.15s ease-out',
                    transformOrigin: 'center center',
                }}
            >
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    style={{ display: 'block' }}
                >
                    <defs>
                        {/* Glow filter for active block border. */}
                        <filter id="sfe-block-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                        </filter>
                        {/* Subtle glow for the playback indicator. */}
                        <filter id="sfe-bar-glow" x="-20%" y="-100%" width="140%" height="300%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                        </filter>
                    </defs>

                    {/* Connector arrows between blocks. */}
                    {blocks.map((block, i) => {
                        if (i === BLOCK_COUNT - 1) return null;
                        const next = blocks[i + 1];
                        const lineX1 = block.x + blockW;
                        const lineX2 = next.x;
                        const lineY = cy;
                        const midX = (lineX1 + lineX2) / 2;

                        // Arrows up to and including the active block connector are lit.
                        const isLit = i < activeIndex;
                        const arrowOpacity = isLit ? 0.85 : 0.25;
                        const strokeColor = isLit ? secondaryColor : contentColor;

                        return (
                            <g key={`arrow-${i}`}>
                                {/* Line segment. */}
                                <line
                                    x1={lineX1 + 2}
                                    y1={lineY}
                                    x2={lineX2 - ARROW_SIZE - 2}
                                    y2={lineY}
                                    stroke={strokeColor}
                                    strokeWidth={1.5}
                                    opacity={arrowOpacity}
                                    style={{
                                        transition: 'opacity 0.4s ease, stroke 0.4s ease',
                                    }}
                                />
                                {/* Triangle arrowhead pointing right. */}
                                <polygon
                                    points={`
                                        ${lineX2 - 2},${lineY}
                                        ${lineX2 - 2 - ARROW_SIZE},${lineY - ARROW_SIZE * 0.6}
                                        ${lineX2 - 2 - ARROW_SIZE},${lineY + ARROW_SIZE * 0.6}
                                    `}
                                    fill={strokeColor}
                                    opacity={arrowOpacity}
                                    style={{
                                        transition: 'opacity 0.4s ease, fill 0.4s ease',
                                    }}
                                />
                            </g>
                        );
                    })}

                    {/* Script blocks. */}
                    {blocks.map((block, i) => {
                        const isActive = i === activeIndex;

                        return (
                            <g key={`block-${i}`}>
                                {/* Glow layer behind active block. */}
                                {isActive && (
                                    <rect
                                        x={block.x - 2}
                                        y={block.y - 2}
                                        width={blockW + 4}
                                        height={blockH + 4}
                                        rx={BLOCK_RX + 2}
                                        fill={secondaryColor}
                                        opacity={0.3}
                                        filter="url(#sfe-block-glow)"
                                    />
                                )}

                                {/* Block rectangle. */}
                                <rect
                                    x={block.x}
                                    y={block.y}
                                    width={blockW}
                                    height={blockH}
                                    rx={BLOCK_RX}
                                    fill={isActive ? secondaryColor : 'transparent'}
                                    fillOpacity={isActive ? 0.4 : 0}
                                    stroke={isActive ? secondaryColor : contentColor}
                                    strokeWidth={isActive ? 1.8 : 1}
                                    opacity={isActive ? 1 : 0.4}
                                    style={{
                                        transition:
                                            'fill-opacity 0.4s ease, stroke 0.4s ease, opacity 0.4s ease, stroke-width 0.3s ease',
                                    }}
                                />

                                {/* Block label. */}
                                <text
                                    x={block.x + blockW / 2}
                                    y={block.y + blockH / 2}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={isActive ? titleColor : secondaryColor}
                                    fontSize={fontSize}
                                    fontFamily="monospace"
                                    fontWeight={isActive ? 600 : 400}
                                    opacity={isActive ? 1 : 0.55}
                                    style={{
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                        transition: 'fill 0.4s ease, opacity 0.4s ease',
                                    }}
                                >
                                    {block.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Playback indicator bar (background track). */}
                    <rect
                        x={barStartX}
                        y={barY}
                        width={barTotalWidth}
                        height={barHeight}
                        rx={barHeight / 2}
                        fill={contentColor}
                        opacity={0.15}
                    />

                    {/* Playback indicator bar (filled portion). */}
                    {barFillWidth > 0 && (
                        <>
                            <rect
                                x={barStartX}
                                y={barY}
                                width={barFillWidth}
                                height={barHeight}
                                rx={barHeight / 2}
                                fill={secondaryColor}
                                opacity={0.6}
                                filter="url(#sfe-bar-glow)"
                                style={{
                                    transition: 'width 0.4s ease',
                                }}
                            />
                            <rect
                                x={barStartX}
                                y={barY}
                                width={barFillWidth}
                                height={barHeight}
                                rx={barHeight / 2}
                                fill={secondaryColor}
                                opacity={0.8}
                                style={{
                                    transition: 'width 0.4s ease',
                                }}
                            />
                        </>
                    )}

                    {/* Playback head dot. */}
                    <circle
                        cx={barStartX + barFillWidth}
                        cy={barY + barHeight / 2}
                        r={barHeight + 1.5}
                        fill={secondaryColor}
                        opacity={0.9}
                        style={{
                            transition: 'cx 0.4s ease',
                        }}
                    />
                </svg>
            </div>
        </div>
    );
};
