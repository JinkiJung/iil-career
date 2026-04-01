import { useRef, useEffect, useState, useCallback } from 'react';
import { useMousePosition } from './useMousePosition';
import type { HeroComponentProps } from './types';

/* ------------------------------------------------------------------ */
/*  SVG icon paths (small, centered at 0,0)                            */
/* ------------------------------------------------------------------ */

/** Stick-figure user */
const UserIcon = ({ color, size }: { color: string; size: number }) => {
    const s = size;
    return (
        <g>
            <circle cx={0} cy={-s * 0.55} r={s * 0.25} fill="none" stroke={color} strokeWidth={1.5} />
            <line x1={0} y1={-s * 0.3} x2={0} y2={s * 0.2} stroke={color} strokeWidth={1.5} />
            <line x1={-s * 0.3} y1={-s * 0.05} x2={s * 0.3} y2={-s * 0.05} stroke={color} strokeWidth={1.5} />
            <line x1={0} y1={s * 0.2} x2={-s * 0.22} y2={s * 0.55} stroke={color} strokeWidth={1.5} />
            <line x1={0} y1={s * 0.2} x2={s * 0.22} y2={s * 0.55} stroke={color} strokeWidth={1.5} />
        </g>
    );
};

/** Gear/cog icon for Service */
const GearIcon = ({ color, size }: { color: string; size: number }) => {
    const s = size * 0.4;
    const teeth = 8;
    const innerR = s * 0.55;
    const outerR = s * 0.85;
    const d: string[] = [];
    for (let i = 0; i < teeth; i++) {
        const a1 = (i / teeth) * Math.PI * 2;
        const a2 = ((i + 0.35) / teeth) * Math.PI * 2;
        const a3 = ((i + 0.5) / teeth) * Math.PI * 2;
        const a4 = ((i + 0.85) / teeth) * Math.PI * 2;
        d.push(
            `${i === 0 ? 'M' : 'L'}${(Math.cos(a1) * outerR).toFixed(1)},${(Math.sin(a1) * outerR).toFixed(1)}`,
            `L${(Math.cos(a2) * outerR).toFixed(1)},${(Math.sin(a2) * outerR).toFixed(1)}`,
            `L${(Math.cos(a3) * innerR).toFixed(1)},${(Math.sin(a3) * innerR).toFixed(1)}`,
            `L${(Math.cos(a4) * innerR).toFixed(1)},${(Math.sin(a4) * innerR).toFixed(1)}`,
        );
    }
    d.push('Z');
    return (
        <g>
            <path d={d.join(' ')} fill={color} opacity={0.8} />
            <circle cx={0} cy={0} r={s * 0.25} fill="none" stroke={color} strokeWidth={1.5} opacity={0.9} />
        </g>
    );
};

/** Server/grid icon for MIR */
const MirIcon = ({ color, size }: { color: string; size: number }) => {
    const s = size * 0.35;
    return (
        <g>
            <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={2} fill="none" stroke={color} strokeWidth={1.5} />
            <line x1={-s} y1={0} x2={s} y2={0} stroke={color} strokeWidth={1} opacity={0.5} />
            <line x1={0} y1={-s} x2={0} y2={s} stroke={color} strokeWidth={1} opacity={0.5} />
            {/* dots */}
            {[-0.5, 0.5].map(r => [-0.5, 0.5].map(c => (
                <circle key={`${r}-${c}`} cx={c * s} cy={r * s} r={s * 0.15} fill={color} opacity={0.6} />
            )))}
        </g>
    );
};

/** Magnifying glass for MSR */
const MsrIcon = ({ color, size }: { color: string; size: number }) => {
    const s = size * 0.3;
    return (
        <g>
            <circle cx={-s * 0.15} cy={-s * 0.15} r={s * 0.6} fill="none" stroke={color} strokeWidth={1.8} />
            <line x1={s * 0.25} y1={s * 0.25} x2={s * 0.7} y2={s * 0.7} stroke={color} strokeWidth={2} strokeLinecap="round" />
        </g>
    );
};

/** Lock/messaging icon for MMS */
const MmsIcon = ({ color, size }: { color: string; size: number }) => {
    const s = size * 0.3;
    return (
        <g>
            {/* lock body */}
            <rect x={-s * 0.55} y={-s * 0.1} width={s * 1.1} height={s * 0.8} rx={2} fill="none" stroke={color} strokeWidth={1.5} />
            {/* shackle */}
            <path d={`M${-s * 0.3},${-s * 0.1} L${-s * 0.3},${-s * 0.4} A${s * 0.3},${s * 0.3} 0 0,1 ${s * 0.3},${-s * 0.4} L${s * 0.3},${-s * 0.1}`} fill="none" stroke={color} strokeWidth={1.5} />
            {/* arrows */}
            <line x1={-s * 0.25} y1={s * 0.2} x2={s * 0.25} y2={s * 0.2} stroke={color} strokeWidth={1.2} />
            <polyline points={`${s * 0.1},${s * 0.1} ${s * 0.25},${s * 0.2} ${s * 0.1},${s * 0.3}`} fill="none" stroke={color} strokeWidth={1.2} />
            <polyline points={`${-s * 0.1},${s * 0.1} ${-s * 0.25},${s * 0.2} ${-s * 0.1},${s * 0.3}`} fill="none" stroke={color} strokeWidth={1.2} />
        </g>
    );
};

/** Cloud with MCP anchor */
const McpCloud = ({ color, size }: { color: string; size: number }) => {
    const s = size * 0.4;
    return (
        <g>
            {/* Cloud shape */}
            <ellipse cx={0} cy={0} rx={s * 1.3} ry={s * 0.75} fill={color} opacity={0.15} />
            <ellipse cx={0} cy={0} rx={s * 1.3} ry={s * 0.75} fill="none" stroke={color} strokeWidth={1.2} opacity={0.6} />
            {/* Anchor icon */}
            <circle cx={0} cy={-s * 0.2} r={s * 0.12} fill="none" stroke={color} strokeWidth={1} />
            <line x1={0} y1={-s * 0.08} x2={0} y2={s * 0.3} stroke={color} strokeWidth={1.2} />
            <line x1={-s * 0.2} y1={s * 0.15} x2={s * 0.2} y2={s * 0.15} stroke={color} strokeWidth={1} />
            {/* MCP label */}
            <text y={s * 0.55} textAnchor="middle" fill={color} fontSize={s * 0.35} fontFamily="monospace" fontWeight={700} opacity={0.7}>MCP</text>
        </g>
    );
};

/* Small icons for message animation */
const CircleMsg = ({ color, size }: { color: string; size: number }) => (
    <circle cx={0} cy={0} r={size * 0.12} fill={color} opacity={0.9} />
);

const CertMsg = ({ color, size }: { color: string; size: number }) => {
    const s = size * 0.12;
    return (
        <g>
            <rect x={-s} y={-s * 1.2} width={s * 2} height={s * 2.4} rx={1} fill="none" stroke={color} strokeWidth={1.2} />
            <circle cx={0} cy={-s * 0.3} r={s * 0.4} fill="none" stroke={color} strokeWidth={0.8} />
            <line x1={-s * 0.5} y1={s * 0.5} x2={s * 0.5} y2={s * 0.5} stroke={color} strokeWidth={0.8} />
        </g>
    );
};

const ServiceMsg = ({ color, size }: { color: string; size: number }) => (
    <GearIcon color={color} size={size * 0.35} />
);

const EnvelopeMsg = ({ color, size }: { color: string; size: number }) => {
    const s = size * 0.14;
    return (
        <g>
            <rect x={-s} y={-s * 0.7} width={s * 2} height={s * 1.4} rx={1} fill="none" stroke={color} strokeWidth={1.2} />
            <polyline points={`${-s},${-s * 0.7} 0,${s * 0.1} ${s},${-s * 0.7}`} fill="none" stroke={color} strokeWidth={1} />
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Animation phases                                                   */
/* ------------------------------------------------------------------ */

type Phase =
    | { type: 'wait'; duration: number }
    | { type: 'move'; from: string; to: string; icon: string; duration: number }
    | { type: 'bounce'; target: string; duration: number }
    | { type: 'show'; target: string };

/** Double-bounce Y offset: two diminishing jumps within t ∈ [0,1]. */
function doubleBounceY(t: number): number {
    if (t < 0.5) {
        return -Math.sin((t / 0.5) * Math.PI) * 10;
    }
    return -Math.sin(((t - 0.5) / 0.5) * Math.PI) * 5;
}

const INTRO_PHASES: Phase[] = [
    { type: 'wait', duration: 0.8 },
    // 1) User → MIR circle
    { type: 'move', from: 'user', to: 'mir', icon: 'circle', duration: 2.0 },
    { type: 'bounce', target: 'mir', duration: 0.5 },
    { type: 'wait', duration: 0.3 },
    // 2) MIR → User cert
    { type: 'move', from: 'mir', to: 'user', icon: 'cert', duration: 2.0 },
    { type: 'bounce', target: 'user', duration: 0.5 },
    { type: 'wait', duration: 0.5 },
    // 3) User → MSR circle
    { type: 'move', from: 'user', to: 'msr', icon: 'circle', duration: 2.0 },
    { type: 'bounce', target: 'msr', duration: 0.5 },
    { type: 'wait', duration: 0.3 },
    // 4) MSR → User service icon + show Service
    { type: 'move', from: 'msr', to: 'user', icon: 'service', duration: 2.0 },
    { type: 'bounce', target: 'user', duration: 0.5 },
    { type: 'show', target: 'service' },
    { type: 'wait', duration: 0.5 },
];

const LOOP_PHASES: Phase[] = [
    // User → MMS envelope
    { type: 'move', from: 'user', to: 'mms', icon: 'envelope', duration: 1.6 },
    { type: 'bounce', target: 'mms', duration: 0.5 },
    { type: 'wait', duration: 0.15 },
    // MMS → Service envelope
    { type: 'move', from: 'mms', to: 'service', icon: 'envelope', duration: 1.6 },
    { type: 'bounce', target: 'service', duration: 0.5 },
    { type: 'wait', duration: 0.3 },
    // Service → MMS envelope
    { type: 'move', from: 'service', to: 'mms', icon: 'envelope', duration: 1.6 },
    { type: 'bounce', target: 'mms', duration: 0.5 },
    { type: 'wait', duration: 0.15 },
    // MMS → User envelope
    { type: 'move', from: 'mms', to: 'user', icon: 'envelope', duration: 1.6 },
    { type: 'bounce', target: 'user', duration: 0.5 },
    { type: 'wait', duration: 0.7 },
];

/* ------------------------------------------------------------------ */
/*  Node positions                                                     */
/* ------------------------------------------------------------------ */

interface NodePos {
    fx: number;
    fy: number;
    depth: number; // 0 = shallowest (MIR/MSR/MMS), 1 = mid (MCP/box), 2 = deepest (user/service)
}

const NODES: Record<string, NodePos> = {
    user:    { fx: 0.10, fy: 0.58, depth: 2 },
    service: { fx: 0.90, fy: 0.55, depth: 2 },
    mcp:     { fx: 0.48, fy: 0.10, depth: 1 },
    mir:     { fx: 0.30, fy: 0.38, depth: 0 },
    msr:     { fx: 0.48, fy: 0.45, depth: 0 },
    mms:     { fx: 0.66, fy: 0.55, depth: 0 },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const IdentityConstellation = ({
    contentColor,
    secondaryColor,
    titleColor,
    progress,
    width,
    height,
}: HeroComponentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useMousePosition(containerRef);
    const [, forceRender] = useState(0);
    const rafRef = useRef(0);
    const timeRef = useRef(0);
    const lastTsRef = useRef(0);

    // Animation state
    const phaseIdxRef = useRef(0);
    const phaseTimeRef = useRef(0);
    const inLoopRef = useRef(false);
    const serviceVisibleRef = useRef(false);
    const hasEnteredViewRef = useRef(false);

    // Bounce animation state
    const bounceRef = useRef<{ target: string; t: number } | null>(null);

    // Message animation state: current moving icon
    const msgRef = useRef<{
        fromKey: string;
        toKey: string;
        icon: string;
        t: number;
        duration: number;
    } | null>(null);

    const hasDimensions = width > 0 && height > 0;
    const minDim = Math.min(width || 1, height || 1);
    const iconSize = Math.max(20, minDim * 0.22);

    // Parallax: deeper nodes move more in opposite direction of mouse from center
    const parallax = useCallback(
        (fx: number, fy: number, depth: number) => {
            if (!hasDimensions) return { x: 0, y: 0 };
            const mx = (mouse.x - 0.5) * 2; // -1..1
            const my = (mouse.y - 0.5) * 2;
            const factor = (depth + 1) * 6; // depth 0→6, 1→12, 2→18
            return {
                x: fx * width - mx * factor,
                y: fy * height - my * factor * 0.5,
            };
        },
        [mouse.x, mouse.y, width, height, hasDimensions],
    );

    // Detect when the component enters the viewport to start animation
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasEnteredViewRef.current) {
                    hasEnteredViewRef.current = true;
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Animation loop
    useEffect(() => {
        if (!hasDimensions) return;

        const tick = (timestamp: number) => {
            if (progress > 0.9 || !hasEnteredViewRef.current) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            const dt = lastTsRef.current === 0
                ? 0.016
                : Math.min((timestamp - lastTsRef.current) / 1000, 0.05);
            lastTsRef.current = timestamp;
            timeRef.current += dt;

            // Determine current phase list
            const phases = inLoopRef.current ? LOOP_PHASES : INTRO_PHASES;
            const idx = phaseIdxRef.current;

            if (idx < phases.length) {
                const phase = phases[idx];
                phaseTimeRef.current += dt;

                if (phase.type === 'wait') {
                    if (phaseTimeRef.current >= phase.duration) {
                        phaseTimeRef.current = 0;
                        phaseIdxRef.current++;
                    }
                } else if (phase.type === 'move') {
                    if (!msgRef.current) {
                        msgRef.current = {
                            fromKey: phase.from,
                            toKey: phase.to,
                            icon: phase.icon,
                            t: 0,
                            duration: phase.duration,
                        };
                    }
                    msgRef.current.t += dt / phase.duration;
                    if (msgRef.current.t >= 1) {
                        msgRef.current = null;
                        phaseTimeRef.current = 0;
                        phaseIdxRef.current++;
                    }
                } else if (phase.type === 'bounce') {
                    if (!bounceRef.current) {
                        bounceRef.current = { target: phase.target, t: 0 };
                    }
                    bounceRef.current.t += dt / phase.duration;
                    if (bounceRef.current.t >= 1) {
                        bounceRef.current = null;
                        phaseTimeRef.current = 0;
                        phaseIdxRef.current++;
                    }
                } else if (phase.type === 'show') {
                    if (phase.target === 'service') {
                        serviceVisibleRef.current = true;
                    }
                    phaseIdxRef.current++;
                }
            } else {
                // End of phases
                if (!inLoopRef.current) {
                    // Switch to loop
                    inLoopRef.current = true;
                    phaseIdxRef.current = 0;
                    phaseTimeRef.current = 0;
                } else {
                    // Restart loop
                    phaseIdxRef.current = 0;
                    phaseTimeRef.current = 0;
                }
            }

            forceRender((c) => c + 1);
            rafRef.current = requestAnimationFrame(tick);
        };

        lastTsRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [hasDimensions, progress]);

    const opacity = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;

    if (!hasDimensions) {
        return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
    }

    // Compute positions with parallax
    const pos: Record<string, { x: number; y: number }> = {};
    for (const [key, def] of Object.entries(NODES)) {
        pos[key] = parallax(def.fx, def.fy, def.depth);
    }

    // Dashed box around MIR, MSR, MMS (depth 1)
    const boxPad = iconSize * 0.7;
    const boxNodes = [pos.mir, pos.msr, pos.mms];
    const boxMinX = Math.min(...boxNodes.map(n => n.x)) - boxPad;
    const boxMaxX = Math.max(...boxNodes.map(n => n.x)) + boxPad;
    const boxMinY = Math.min(...boxNodes.map(n => n.y), pos.mcp.y) - boxPad * 0.5;
    const boxMaxY = Math.max(...boxNodes.map(n => n.y)) + boxPad;
    const boxDepthOffset = {
        x: -(mouse.x - 0.5) * 2 * 12,
        y: -(mouse.y - 0.5) * 2 * 6,
    };

    // Connection lines (thin)
    const connections: [string, string][] = [
        ['user', 'mir'], ['user', 'msr'], ['user', 'mms'],
        ['mms', 'service'],
    ];

    // Message icon position
    let msgPos: { x: number; y: number; icon: string } | null = null;
    if (msgRef.current) {
        const m = msgRef.current;
        const from = pos[m.fromKey];
        const to = pos[m.toKey];
        if (from && to) {
            const t = Math.min(1, Math.max(0, m.t));
            // Ease in-out
            const et = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            msgPos = {
                x: from.x + (to.x - from.x) * et,
                y: from.y + (to.y - from.y) * et,
                icon: m.icon,
            };
        }
    }

    const fontSize = Math.max(8, minDim * 0.05);
    const serviceOpacity = serviceVisibleRef.current ? 0.85 : 0;

    // Bounce Y offset per node
    const bounceY = (key: string) => {
        const b = bounceRef.current;
        if (!b || b.target !== key) return 0;
        return doubleBounceY(Math.min(1, b.t));
    };

    const renderMsgIcon = (icon: string, x: number, y: number) => {
        const props = { color: titleColor, size: iconSize };
        return (
            <g transform={`translate(${x}, ${y})`}>
                {icon === 'circle' && <CircleMsg {...props} />}
                {icon === 'cert' && <CertMsg {...props} />}
                {icon === 'service' && <ServiceMsg {...props} />}
                {icon === 'envelope' && <EnvelopeMsg {...props} />}
            </g>
        );
    };

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
                    <filter id="ic-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                    </filter>
                </defs>

                {/* Dashed box (depth 1) */}
                <rect
                    x={boxMinX + boxDepthOffset.x}
                    y={boxMinY + boxDepthOffset.y}
                    width={boxMaxX - boxMinX}
                    height={boxMaxY - boxMinY}
                    rx={6}
                    fill="none"
                    stroke={secondaryColor}
                    strokeWidth={1.5}
                    strokeDasharray="8 5"
                    opacity={0.3}
                />

                {/* Connection lines */}
                {connections.map(([a, b], i) => {
                    const pa = pos[a];
                    const pb = pos[b];
                    if (!pa || !pb) return null;
                    if (b === 'service' && !serviceVisibleRef.current) return null;
                    return (
                        <line
                            key={`c-${i}`}
                            x1={pa.x} y1={pa.y}
                            x2={pb.x} y2={pb.y}
                            stroke={secondaryColor}
                            strokeWidth={1}
                            opacity={0.2}
                        />
                    );
                })}

                {/* MCP Cloud (depth 1) */}
                <g transform={`translate(${pos.mcp.x}, ${pos.mcp.y})`}>
                    <McpCloud color={secondaryColor} size={iconSize} />
                </g>

                {/* MIR (depth 0) */}
                <g transform={`translate(${pos.mir.x}, ${pos.mir.y + bounceY('mir')})`}>
                    <MirIcon color={secondaryColor} size={iconSize} />
                    <text y={iconSize * 0.38} textAnchor="middle" fill={contentColor} fontSize={fontSize} fontFamily="monospace" fontWeight={600} opacity={0.8}>MIR</text>
                </g>

                {/* MSR (depth 0) */}
                <g transform={`translate(${pos.msr.x}, ${pos.msr.y + bounceY('msr')})`}>
                    <MsrIcon color={secondaryColor} size={iconSize} />
                    <text y={iconSize * 0.38} textAnchor="middle" fill={contentColor} fontSize={fontSize} fontFamily="monospace" fontWeight={600} opacity={0.8}>MSR</text>
                </g>

                {/* MMS (depth 0) */}
                <g transform={`translate(${pos.mms.x}, ${pos.mms.y + bounceY('mms')})`}>
                    <MmsIcon color={secondaryColor} size={iconSize} />
                    <text y={iconSize * 0.38} textAnchor="middle" fill={contentColor} fontSize={fontSize} fontFamily="monospace" fontWeight={600} opacity={0.8}>MMS</text>
                </g>

                {/* User (depth 2) */}
                <g transform={`translate(${pos.user.x}, ${pos.user.y + bounceY('user')})`}>
                    <UserIcon color={contentColor} size={iconSize * 0.5} />
                    <text y={iconSize * 0.42} textAnchor="middle" fill={contentColor} fontSize={fontSize * 0.75} fontFamily="monospace" opacity={0.6}>user</text>
                </g>

                {/* Service (depth 2, conditionally visible) */}
                <g
                    transform={`translate(${pos.service.x}, ${pos.service.y + bounceY('service')})`}
                    opacity={serviceOpacity}
                    style={{ transition: 'opacity 0.8s ease-in' }}
                >
                    <GearIcon color={secondaryColor} size={iconSize} />
                    <text y={iconSize * 0.35} textAnchor="middle" fill={contentColor} fontSize={fontSize * 0.75} fontFamily="monospace" opacity={0.6}>Service</text>
                </g>

                {/* Moving message icon */}
                {msgPos && (
                    <g>
                        <circle cx={msgPos.x} cy={msgPos.y} r={10} fill={titleColor} opacity={0.2} filter="url(#ic-glow)" />
                        {renderMsgIcon(msgPos.icon, msgPos.x, msgPos.y)}
                    </g>
                )}
            </svg>
        </div>
    );
};
