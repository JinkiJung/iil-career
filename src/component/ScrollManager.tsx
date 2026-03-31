import { createContext, useCallback, useContext, useEffect, useRef } from 'react';

interface SectionEntry {
    outerEl: HTMLElement;
    stickyEl: HTMLElement;
    // Cached static measurements (don't change during scroll)
    outerHeight: number;
    overviewH: number;
}

interface ScrollManagerCtx {
    register: (outer: HTMLElement, sticky: HTMLElement) => () => void;
}

const ScrollManagerContext = createContext<ScrollManagerCtx | null>(null);

export const useScrollManager = () => {
    const ctx = useContext(ScrollManagerContext);
    if (!ctx) throw new Error('useScrollManager must be used inside ScrollManagerProvider');
    return ctx;
};

export const ScrollManagerProvider = ({ children }: { children: React.ReactNode }) => {
    const sectionsRef = useRef<SectionEntry[]>([]);

    // Stable register callback — pushes entry into sectionsRef synchronously.
    // Section effects (children) run before this provider's effect (parent),
    // so all sections are registered before the scroll listener fires.
    const register = useCallback((outerEl: HTMLElement, stickyEl: HTMLElement) => {
        const overviewEl = stickyEl.querySelector('.overview-container') as HTMLElement | null;
        const entry: SectionEntry = {
            outerEl,
            stickyEl,
            outerHeight: outerEl.offsetHeight,
            overviewH: overviewEl?.offsetHeight ?? 0,
        };
        sectionsRef.current.push(entry);
        return () => {
            sectionsRef.current = sectionsRef.current.filter(s => s !== entry);
        };
    }, []);

    // Single scroll handler — runs after all Section effects have registered.
    useEffect(() => {
        const container = document.querySelector('.careerContainer') as HTMLElement;
        if (!container) return;

        const onScroll = () => {
            const sections = sectionsRef.current;
            if (!sections.length) return;
            const vh = window.innerHeight;

            // ── PHASE 1: Read all layout values (batched, no writes) ──
            const rects = sections.map(s => s.outerEl.getBoundingClientRect());

            // ── PHASE 2: Compute + Write (no reads) ──
            sections.forEach((s, i) => {
                const rect = rects[i];
                const scrolled = Math.max(0, -rect.top);
                const totalScrollable = s.outerHeight - vh;
                const deadZone = vh * 0.5;
                const activeStart = deadZone;
                const activeEnd = totalScrollable - deadZone;
                const effective = Math.max(0, Math.min(scrolled - activeStart, activeEnd - activeStart));
                const gapMax = Math.max(vh * 0.1, (vh - s.overviewH) / 2);

                const g = Math.max(0, gapMax - effective);
                const activeZone = activeEnd - activeStart;
                let p = 0;
                if (effective > gapMax) {
                    const transitionZone = activeZone - gapMax;
                    p = transitionZone > 0
                        ? Math.min(1, (effective - gapMax) / transitionZone)
                        : 1;
                }

                s.stickyEl.style.setProperty('--g', `${g.toFixed(1)}px`);
                s.stickyEl.style.setProperty('--p', p.toFixed(3));
            });
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Initial call — all sections already registered at this point
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <ScrollManagerContext.Provider value={{ register }}>
            {children}
        </ScrollManagerContext.Provider>
    );
};
