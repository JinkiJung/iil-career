import { useRef } from 'react';
import type { HeroComponentProps } from './types';
import { useMousePosition } from './useMousePosition';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert normalised 0..1 mouse coord to a pixel offset from center. */
function offset(normalized: number, maxPx: number): number {
    return (normalized - 0.5) * 2 * maxPx;
}

// ---------------------------------------------------------------------------
// Sub-components (all inline SVG / styled divs)
// ---------------------------------------------------------------------------

function CitySkyline({ color }: { color: string }) {
    // 10 rectangles of varying width / height, arranged along the bottom
    const buildings: { x: number; w: number; h: number }[] = [
        { x: 2, w: 6, h: 30 },
        { x: 10, w: 8, h: 50 },
        { x: 20, w: 5, h: 35 },
        { x: 27, w: 10, h: 60 },
        { x: 39, w: 7, h: 40 },
        { x: 48, w: 9, h: 55 },
        { x: 59, w: 6, h: 28 },
        { x: 67, w: 11, h: 65 },
        { x: 80, w: 7, h: 45 },
        { x: 89, w: 8, h: 38 },
    ];

    return (
        <svg
            viewBox="0 0 100 80"
            preserveAspectRatio="xMidYMax slice"
            style={{ width: '100%', height: '100%' }}
        >
            {buildings.map((b, i) => (
                <rect
                    key={i}
                    x={b.x}
                    y={80 - b.h}
                    width={b.w}
                    height={b.h}
                    fill={color}
                    opacity={0.2}
                    rx={0.5}
                />
            ))}
        </svg>
    );
}

function RoadSurface({ contentColor }: { contentColor: string }) {
    const lineStyle: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 2,
        background: `repeating-linear-gradient(
            90deg,
            ${contentColor} 0px,
            ${contentColor} 20px,
            transparent 20px,
            transparent 36px
        )`,
        opacity: 0.4,
    };

    const crosswalkStripe: React.CSSProperties = {
        width: 6,
        height: 28,
        backgroundColor: contentColor,
        opacity: 0.4,
        borderRadius: 1,
    };

    return (
        <>
            {/* Three dashed lane markings */}
            <div style={{ ...lineStyle, top: '30%' }} />
            <div style={{ ...lineStyle, top: '50%' }} />
            <div style={{ ...lineStyle, top: '70%' }} />

            {/* Crosswalk — cluster of short vertical stripes */}
            <div
                style={{
                    position: 'absolute',
                    left: '60%',
                    top: '25%',
                    display: 'flex',
                    gap: 8,
                    height: 28,
                }}
            >
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} style={crosswalkStripe} />
                ))}
            </div>
        </>
    );
}

function PedestrianSilhouette({ color }: { color: string }) {
    return (
        <svg
            viewBox="0 0 40 80"
            width={40}
            height={80}
            style={{ display: 'block' }}
        >
            {/* Head */}
            <circle cx={20} cy={10} r={6} fill={color} />
            {/* Body */}
            <line x1={20} y1={16} x2={20} y2={45} stroke={color} strokeWidth={3} strokeLinecap="round" />
            {/* Left arm */}
            <line x1={20} y1={24} x2={10} y2={36} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            {/* Right arm */}
            <line x1={20} y1={24} x2={30} y2={34} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            {/* Left leg */}
            <line x1={20} y1={45} x2={12} y2={70} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            {/* Right leg */}
            <line x1={20} y1={45} x2={28} y2={68} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </svg>
    );
}

interface HudBadgeProps {
    label: string;
    borderColor: string;
    style?: React.CSSProperties;
}

function HudBadge({ label, borderColor, style }: HudBadgeProps) {
    return (
        <div
            style={{
                position: 'absolute',
                padding: '4px 10px',
                borderRadius: 6,
                border: `1.5px solid ${borderColor}`,
                color: borderColor,
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: 600,
                letterSpacing: 1,
                whiteSpace: 'nowrap',
                boxShadow: `0 0 8px ${borderColor}44, inset 0 0 6px ${borderColor}22`,
                backdropFilter: 'blur(2px)',
                userSelect: 'none',
                pointerEvents: 'none',
                transition: 'transform 0.15s ease-out',
                ...style,
            }}
        >
            {label}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ParallaxDepthLayers = ({
    contentColor,
    secondaryColor,
    titleColor,
    width,
    height,
}: HeroComponentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useMousePosition(containerRef);

    if (width === 0 || height === 0) return null;

    // Pixel offsets per layer
    const bgX = offset(mouse.x, 8);
    const bgY = offset(mouse.y, 4);

    const mgX = offset(mouse.x, 20);
    const mgY = offset(mouse.y, 10);

    const fgX = offset(mouse.x, 40);
    const fgY = offset(mouse.y, 20);

    const layerBase: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        willChange: 'transform',
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {/* Background — city skyline */}
            <div
                style={{
                    ...layerBase,
                    transform: `translate3d(${bgX}px, ${bgY}px, 0)`,
                }}
            >
                <CitySkyline color={secondaryColor} />
            </div>

            {/* Midground — road surface */}
            <div
                style={{
                    ...layerBase,
                    transform: `translate3d(${mgX}px, ${mgY}px, 0)`,
                }}
            >
                <RoadSurface contentColor={contentColor} />
            </div>

            {/* Foreground — pedestrian + AR HUD */}
            <div
                style={{
                    ...layerBase,
                    transform: `translate3d(${fgX}px, ${fgY}px, 0)`,
                }}
            >
                {/* Pedestrian silhouette, roughly centred */}
                <div
                    style={{
                        position: 'absolute',
                        left: '35%',
                        top: '30%',
                    }}
                >
                    <PedestrianSilhouette color={titleColor} />
                </div>

                {/* AR HUD elements — each with its own easing transition */}
                <HudBadge
                    label="⚠"
                    borderColor={secondaryColor}
                    style={{ top: '22%', left: '48%' }}
                />
                <HudBadge
                    label="12m"
                    borderColor={secondaryColor}
                    style={{ top: '55%', left: '52%' }}
                />
                <HudBadge
                    label="ALERT"
                    borderColor={secondaryColor}
                    style={{ top: '38%', left: '62%' }}
                />
            </div>
        </div>
    );
};
