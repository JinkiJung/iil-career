import { useEffect, useState, type RefObject } from 'react';

export function useMousePosition(ref: RefObject<HTMLElement | null>) {
    const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            setPos({
                x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
                y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
            });
        };

        const onLeave = () => setPos({ x: 0.5, y: 0.5 });

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return pos;
}
