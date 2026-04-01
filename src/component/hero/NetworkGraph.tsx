import { useRef, useEffect, useState, useCallback } from 'react';
import type { HeroComponentProps } from './types';

/* ------------------------------------------------------------------ */
/*  Topology: exact match to MMS architecture diagram                  */
/* ------------------------------------------------------------------ */

type NodeKind = 'agent' | 'edge' | 'router';

interface NodeDef {
    label: string;
    kind: NodeKind;
    /** Base position as fraction of width/height */
    fx: number;
    fy: number;
}

const NODE_DEFS: NodeDef[] = [
    // Top row (index 0–5)
    { label: 'MMS Agent',    kind: 'agent',  fx: 0.07, fy: 0.25 },
    { label: 'Edge Router',  kind: 'edge',   fx: 0.24, fy: 0.25 },
    { label: 'MMS Router',   kind: 'router', fx: 0.41, fy: 0.25 },
    { label: 'MMS Router',   kind: 'router', fx: 0.59, fy: 0.25 },
    { label: 'Edge Router',  kind: 'edge',   fx: 0.76, fy: 0.25 },
    { label: 'MMS Agent',    kind: 'agent',  fx: 0.93, fy: 0.25 },
    // Bottom row (index 6–11)
    { label: 'MMS Agent',    kind: 'agent',  fx: 0.07, fy: 0.75 },
    { label: 'Edge Router',  kind: 'edge',   fx: 0.24, fy: 0.75 },
    { label: 'MMS Router',   kind: 'router', fx: 0.41, fy: 0.75 },
    { label: 'MMS Router',   kind: 'router', fx: 0.59, fy: 0.75 },
    { label: 'Edge Router',  kind: 'edge',   fx: 0.76, fy: 0.75 },
    { label: 'MMS Agent',    kind: 'agent',  fx: 0.93, fy: 0.75 },
];

/** Edges as [fromIndex, toIndex] */
const EDGES: [number, number][] = [
    // Top row
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    // Bottom row
    [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
    // Vertical (router network)
    [2, 8], [3, 9],
];

/** Message routes: sequences of node indices from left agent → right agent */
const ROUTES: number[][] = [
    [0, 1, 2, 3, 4, 5],             // top straight
    [6, 7, 8, 9, 10, 11],           // bottom straight
    [0, 1, 2, 8, 9, 10, 11],        // top-left → cross → bottom-right
    [6, 7, 8, 2, 3, 4, 5],          // bottom-left → cross → top-right
    [5, 4, 3, 9, 10, 11],           // top-right → cross → bottom-right (reverse)
    [11, 10, 9, 3, 2, 1, 0],        // bottom-right → cross → top-left
];

/* ------------------------------------------------------------------ */
/*  Runtime node state                                                 */
/* ------------------------------------------------------------------ */

interface NodeState {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
}

interface MessagePacket {
    route: number[];
    /** Current segment index within route (traveling from route[seg] → route[seg+1]) */
    seg: number;
    /** Progress within current segment, 0..1 */
    t: number;
    speed: number;
    id: number;
}

function buildNodes(w: number, h: number): NodeState[] {
    return NODE_DEFS.map((d) => {
        const x = d.fx * w;
        const y = d.fy * h;
        return { x, y, baseX: x, baseY: y };
    });
}

/** Find the edge index connecting two node indices, or -1. */
function findEdge(a: number, b: number): number {
    return EDGES.findIndex(
        ([ea, eb]) => (ea === a && eb === b) || (ea === b && eb === a),
    );
}

/* ------------------------------------------------------------------ */
/*  Ellipse sizing                                                     */
/* ------------------------------------------------------------------ */

function ellipseSize(kind: NodeKind, minDim: number) {
    const scale = Math.max(0.45, Math.min(1, minDim / 180));
    switch (kind) {
        case 'agent':  return { rx: 48 * scale, ry: 22 * scale };
        case 'edge':   return { rx: 48 * scale, ry: 22 * scale };
        case 'router': return { rx: 48 * scale, ry: 22 * scale };
    }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const NetworkGraph = ({
    contentColor,
    secondaryColor,
    titleColor,
    progress,
    width,
    height,
}: HeroComponentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<NodeState[]>([]);
    const [, forceRender] = useState(0);
    const rafRef = useRef(0);
    const packetsRef = useRef<MessagePacket[]>([]);
    const packetIdRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const lastTimeRef = useRef(0);
    const dragRef = useRef<{ idx: number; offX: number; offY: number } | null>(null);
    const prevDimsRef = useRef({ w: 0, h: 0 });

    const hasDimensions = width > 0 && height > 0;
    const minDim = Math.min(width || 1, height || 1);

    // Rebuild base positions on resize
    if (hasDimensions && (prevDimsRef.current.w !== width || prevDimsRef.current.h !== height)) {
        const fresh = buildNodes(width, height);
        if (nodesRef.current.length === 0) {
            nodesRef.current = fresh;
        } else {
            // Preserve drag offsets relative to old base
            for (let i = 0; i < fresh.length && i < nodesRef.current.length; i++) {
                const old = nodesRef.current[i];
                const dx = old.x - old.baseX;
                const dy = old.y - old.baseY;
                old.baseX = fresh[i].baseX;
                old.baseY = fresh[i].baseY;
                old.x = old.baseX + dx;
                old.y = old.baseY + dy;
            }
        }
        prevDimsRef.current = { w: width, h: height };
    }

    // Spawn a new message packet
    const spawnPacket = useCallback(() => {
        const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
        packetsRef.current.push({
            route,
            seg: 0,
            t: 0,
            speed: 0.8 + Math.random() * 0.4,
            id: packetIdRef.current++,
        });
    }, []);

    // Animation loop
    useEffect(() => {
        if (!hasDimensions) return;

        const animate = (timestamp: number) => {
            if (progress > 0.9) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            const dt = lastTimeRef.current === 0
                ? 0.016
                : Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
            lastTimeRef.current = timestamp;

            // Auto-spawn packets
            spawnTimerRef.current += dt;
            if (spawnTimerRef.current > 2.0) {
                spawnTimerRef.current = 0;
                spawnPacket();
            }

            // Seed initial packets
            if (packetsRef.current.length === 0) {
                spawnPacket();
            }

            // Update packets
            const packets = packetsRef.current;
            for (let i = packets.length - 1; i >= 0; i--) {
                const p = packets[i];
                p.t += p.speed * dt;
                if (p.t >= 1) {
                    p.t = 0;
                    p.seg++;
                    if (p.seg >= p.route.length - 1) {
                        packets.splice(i, 1);
                    }
                }
            }

            // Spring: non-dragged nodes return to base
            const nodes = nodesRef.current;
            const dragIdx = dragRef.current?.idx ?? -1;
            for (let i = 0; i < nodes.length; i++) {
                if (i === dragIdx) continue;
                const n = nodes[i];
                n.x += (n.baseX - n.x) * 0.08;
                n.y += (n.baseY - n.y) * 0.08;
            }

            forceRender((c) => c + 1);
            rafRef.current = requestAnimationFrame(animate);
        };

        lastTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [hasDimensions, progress, spawnPacket]);

    // Drag handlers
    const onPointerDown = useCallback((e: React.PointerEvent<SVGElement>, idx: number) => {
        e.preventDefault();
        (e.target as SVGElement).setPointerCapture(e.pointerId);
        const svgRect = containerRef.current?.getBoundingClientRect();
        if (!svgRect) return;
        const n = nodesRef.current[idx];
        dragRef.current = {
            idx,
            offX: e.clientX - svgRect.left - n.x,
            offY: e.clientY - svgRect.top - n.y,
        };
    }, []);

    const onPointerMove = useCallback((e: React.PointerEvent<SVGElement>) => {
        if (!dragRef.current) return;
        const svgRect = containerRef.current?.getBoundingClientRect();
        if (!svgRect) return;
        const n = nodesRef.current[dragRef.current.idx];
        n.x = e.clientX - svgRect.left - dragRef.current.offX;
        n.y = e.clientY - svgRect.top - dragRef.current.offY;
    }, []);

    const onPointerUp = useCallback(() => {
        dragRef.current = null;
    }, []);

    if (!hasDimensions) {
        return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
    }

    const nodes = nodesRef.current;
    const packets = packetsRef.current;
    const opacity = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
    const fontSize = Math.max(7, minDim * 0.045);

    // Compute packet positions
    const packetPositions = packets.map((p) => {
        const fromIdx = p.route[p.seg];
        const toIdx = p.route[p.seg + 1];
        const from = nodes[fromIdx];
        const to = nodes[toIdx];
        if (!from || !to) return null;
        return {
            x: from.x + (to.x - from.x) * p.t,
            y: from.y + (to.y - from.y) * p.t,
            id: p.id,
        };
    }).filter(Boolean) as { x: number; y: number; id: number }[];

    // Determine which edges are "active" (have a packet traveling on them)
    const activeEdges = new Set<number>();
    for (const p of packets) {
        const fromIdx = p.route[p.seg];
        const toIdx = p.route[p.seg + 1];
        const eIdx = findEdge(fromIdx, toIdx);
        if (eIdx !== -1) activeEdges.add(eIdx);
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
                cursor: dragRef.current ? 'grabbing' : 'default',
            }}
        >
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{ display: 'block' }}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
            >
                <defs>
                    <filter id="ng-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                    </filter>
                </defs>

                {/* Edges */}
                {EDGES.map(([a, b], i) => {
                    const na = nodes[a];
                    const nb = nodes[b];
                    if (!na || !nb) return null;
                    const active = activeEdges.has(i);
                    return (
                        <line
                            key={`e-${i}`}
                            x1={na.x}
                            y1={na.y}
                            x2={nb.x}
                            y2={nb.y}
                            stroke={secondaryColor}
                            strokeWidth={active ? 2 : 1.2}
                            opacity={active ? 0.7 : 0.25}
                            style={{ transition: 'opacity 0.3s, stroke-width 0.3s' }}
                        />
                    );
                })}

                {/* Center label */}
                <text
                    x={width * 0.5}
                    y={height * 0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={secondaryColor}
                    fontSize={fontSize * 0.8}
                    fontFamily="monospace"
                    opacity={0.35}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                    MMS router network
                </text>

                {/* Nodes */}
                {NODE_DEFS.map((def, i) => {
                    const n = nodes[i];
                    if (!n) return null;
                    const { rx, ry } = ellipseSize(def.kind, minDim);
                    const isAgent = def.kind === 'agent';
                    const isRouter = def.kind === 'router';

                    return (
                        <g
                            key={`n-${i}`}
                            style={{ cursor: 'grab' }}
                            onPointerDown={(e) => onPointerDown(e, i)}
                        >
                            {/* Ellipse */}
                            <ellipse
                                cx={n.x}
                                cy={n.y}
                                rx={rx}
                                ry={ry}
                                fill={
                                    isAgent
                                        ? secondaryColor + '18'
                                        : isRouter
                                        ? secondaryColor + '28'
                                        : 'transparent'
                                }
                                stroke={secondaryColor}
                                strokeWidth={isRouter ? 1.8 : 1.2}
                                opacity={0.8}
                            />
                            {/* Label */}
                            <text
                                x={n.x}
                                y={n.y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={contentColor}
                                fontSize={fontSize * 0.7}
                                fontFamily="monospace"
                                fontWeight={isRouter ? 600 : 400}
                                opacity={0.85}
                                style={{ pointerEvents: 'none', userSelect: 'none' }}
                            >
                                {def.label}
                            </text>
                        </g>
                    );
                })}

                {/* Message packets */}
                {packetPositions.map((p) => (
                    <g key={`p-${p.id}`}>
                        {/* Glow */}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={8}
                            fill={titleColor}
                            opacity={0.3}
                            filter="url(#ng-glow)"
                            style={{ pointerEvents: 'none' }}
                        />
                        {/* Core dot */}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={4}
                            fill={titleColor}
                            opacity={0.95}
                            style={{ pointerEvents: 'none' }}
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
};
