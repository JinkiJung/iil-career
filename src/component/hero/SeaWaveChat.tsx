import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useMousePosition } from './useMousePosition';
import type { HeroComponentProps } from './types';

/* ------------------------------------------------------------------ */
/*  Wave configuration                                                 */
/* ------------------------------------------------------------------ */

interface WaveConfig {
    /** Vertical centre as fraction of height. */
    centerFrac: number;
    /** Base amplitude as fraction of height. */
    amplitudeFrac: number;
    /** Sine frequency (radians per pixel). */
    frequency: number;
    /** Animation speed multiplier. */
    speed: number;
    /** Static phase offset. */
    phaseOffset: number;
    /** Fill opacity. */
    opacity: number;
}

const WAVES: WaveConfig[] = [
    // Wave 1 (back): lower amplitude, slower, higher opacity
    {
        centerFrac: 0.52,
        amplitudeFrac: 0.06,
        frequency: 0.008,
        speed: 0.4,
        phaseOffset: 0,
        opacity: 0.35,
    },
    // Wave 2 (mid): medium amplitude and speed
    {
        centerFrac: 0.58,
        amplitudeFrac: 0.08,
        frequency: 0.012,
        speed: 0.7,
        phaseOffset: 2.0,
        opacity: 0.25,
    },
    // Wave 3 (front): larger amplitude, faster, lower opacity
    {
        centerFrac: 0.64,
        amplitudeFrac: 0.11,
        frequency: 0.016,
        speed: 1.1,
        phaseOffset: 4.0,
        opacity: 0.18,
    },
];

/* ------------------------------------------------------------------ */
/*  Bubble configuration                                               */
/* ------------------------------------------------------------------ */

interface BubbleConfig {
    /** Horizontal position as fraction of width. */
    xFrac: number;
    /** Which wave index the bubble sits on (0-2). */
    waveIndex: number;
    /** Bubble width. */
    w: number;
    /** Bubble height. */
    h: number;
    /** Whether to use the alternate colour tone. */
    alt: boolean;
}

const BUBBLES: BubbleConfig[] = [
    { xFrac: 0.10, waveIndex: 0, w: 44, h: 24, alt: false },
    { xFrac: 0.25, waveIndex: 1, w: 38, h: 22, alt: true },
    { xFrac: 0.40, waveIndex: 0, w: 48, h: 26, alt: false },
    { xFrac: 0.55, waveIndex: 2, w: 36, h: 20, alt: true },
    { xFrac: 0.68, waveIndex: 1, w: 42, h: 24, alt: false },
    { xFrac: 0.82, waveIndex: 0, w: 40, h: 22, alt: true },
    { xFrac: 0.93, waveIndex: 2, w: 46, h: 26, alt: false },
];

/** Sampling step for wave path generation. */
const WAVE_SAMPLE_STEP = 10;

/* ------------------------------------------------------------------ */
/*  Pure helpers                                                       */
/* ------------------------------------------------------------------ */

/** Evaluate the wave sine function at a given x. */
function waveY(
    x: number,
    centerY: number,
    amplitude: number,
    frequency: number,
    phase: number,
    time: number,
    speed: number,
    mousePhaseShift: number,
): number {
    return (
        centerY +
        amplitude * Math.sin(frequency * x + phase + time * speed + mousePhaseShift)
    );
}

/** Build the SVG `d` attribute for a filled wave shape. */
function buildWavePath(
    width: number,
    height: number,
    centerY: number,
    amplitude: number,
    frequency: number,
    phase: number,
    time: number,
    speed: number,
    mousePhaseShift: number,
): string {
    const parts: string[] = [];
    // Start at bottom-left corner.
    parts.push(`M0,${height}`);

    // Draw the wave curve from left to right.
    for (let x = 0; x <= width; x += WAVE_SAMPLE_STEP) {
        const y = waveY(x, centerY, amplitude, frequency, phase, time, speed, mousePhaseShift);
        parts.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
    }
    // Ensure we hit the exact right edge.
    const yEnd = waveY(width, centerY, amplitude, frequency, phase, time, speed, mousePhaseShift);
    parts.push(`L${width},${yEnd.toFixed(1)}`);

    // Close along the bottom.
    parts.push(`L${width},${height}`);
    parts.push('Z');

    return parts.join(' ');
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const SeaWaveChat: React.FC<HeroComponentProps> = ({
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
    const timeRef = useRef<number>(0);
    const lastFrameRef = useRef<number | null>(null);

    /* Smooth mouse values with elastic delay for bubbles. */
    const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });

    const hasDimensions = width > 0 && height > 0;

    /* ---- Derived mouse values ---- */
    const mousePhaseShift = (mouse.x - 0.5) * 2.0;
    const amplitudeMultiplier = 0.5 + mouse.y * 1.0;

    /* ---- Animation ---- */
    const animate = useCallback(
        (timestamp: number) => {
            if (lastFrameRef.current === null) {
                lastFrameRef.current = timestamp;
            }
            const dt = (timestamp - lastFrameRef.current) / 1000;
            lastFrameRef.current = timestamp;

            timeRef.current += dt;

            const sm = smoothMouseRef.current;
            const ease = 1 - Math.pow(0.05, dt);
            sm.x += (mouse.x - sm.x) * ease;
            sm.y += (mouse.y - sm.y) * ease;

            rafRef.current = requestAnimationFrame(animate);
        },
        [mouse.x, mouse.y],
    );

    useEffect(() => {
        if (progress > 0.9 || !hasDimensions) {
            cancelAnimationFrame(rafRef.current);
            lastFrameRef.current = null;
            return;
        }

        lastFrameRef.current = null;
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [animate, progress, hasDimensions]);

    /* ---- Render values ---- */
    const time = timeRef.current;
    const smoothPhaseShift = (smoothMouseRef.current.x - 0.5) * 2.0;
    const smoothAmplMult = 0.5 + smoothMouseRef.current.y * 1.0;

    const opacity = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;

    /* ---- Wave paths ---- */
    const wavePaths = useMemo(() => {
        if (!hasDimensions) return [];
        return WAVES.map((w) => {
            const centerY = height * w.centerFrac;
            const amplitude = height * w.amplitudeFrac * amplitudeMultiplier;
            return buildWavePath(
                width,
                height,
                centerY,
                amplitude,
                w.frequency,
                w.phaseOffset,
                time,
                w.speed,
                mousePhaseShift,
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, time, mousePhaseShift, amplitudeMultiplier, hasDimensions]);

    /* ---- Bubble positions ---- */
    const bubblePositions = useMemo(() => {
        if (!hasDimensions) return [];
        return BUBBLES.map((b) => {
            const w = WAVES[b.waveIndex];
            const x = b.xFrac * width;
            const centerY = height * w.centerFrac;
            const amplitude = height * w.amplitudeFrac * smoothAmplMult;
            const y = waveY(
                x,
                centerY,
                amplitude,
                w.frequency,
                w.phaseOffset,
                time,
                w.speed,
                smoothPhaseShift,
            );
            return { x, y, w: b.w, h: b.h, alt: b.alt };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, time, smoothPhaseShift, smoothAmplMult, hasDimensions]);

    const gradId = 'swc-wave-grad';

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
                    {/* Gradient fills for each wave layer. */}
                    {WAVES.map((w, i) => (
                        <linearGradient
                            key={`${gradId}-${i}`}
                            id={`${gradId}-${i}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="0%" stopColor={secondaryColor} stopOpacity={w.opacity} />
                            <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>

                {/* Wave layers (back to front). */}
                {wavePaths.map((d, i) => (
                    <path
                        key={`wave-${i}`}
                        d={d}
                        fill={`url(#${gradId}-${i})`}
                        style={{ pointerEvents: 'none' }}
                    />
                ))}

                {/* Chat bubbles. */}
                {bubblePositions.map((bp, i) => {
                    const bx = bp.x - bp.w / 2;
                    const by = bp.y - bp.h - 8; // float above the wave
                    const bubbleOpacity = bp.alt ? 0.55 : 0.75;
                    const triCenterX = bp.x;
                    const triTopY = by + bp.h;
                    const triSize = 5;

                    return (
                        <g
                            key={`bubble-${i}`}
                            style={{ pointerEvents: 'none' }}
                        >
                            {/* Bubble body. */}
                            <rect
                                x={bx}
                                y={by}
                                width={bp.w}
                                height={bp.h}
                                rx={6}
                                ry={6}
                                fill={contentColor}
                                opacity={bubbleOpacity}
                            />
                            {/* Triangle pointer. */}
                            <polygon
                                points={`${triCenterX - triSize},${triTopY} ${triCenterX + triSize},${triTopY} ${triCenterX},${triTopY + triSize}`}
                                fill={contentColor}
                                opacity={bubbleOpacity}
                            />
                            {/* Ellipsis dots (...). */}
                            {[0, 1, 2].map((d) => (
                                <circle
                                    key={d}
                                    cx={bx + bp.w / 2 + (d - 1) * 7}
                                    cy={by + bp.h / 2}
                                    r={2}
                                    fill={secondaryColor}
                                    opacity={0.6}
                                />
                            ))}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
