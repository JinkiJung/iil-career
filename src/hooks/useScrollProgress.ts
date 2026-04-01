import { useEffect, useState, type RefObject } from 'react';

export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
    const [p, setP] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const sticky = el.closest('.section-sticky') as HTMLElement | null;
        if (!sticky) return;

        let raf: number;
        const read = () => {
            const val = parseFloat(sticky.style.getPropertyValue('--p')) || 0;
            setP(val);
            raf = requestAnimationFrame(read);
        };
        raf = requestAnimationFrame(read);
        return () => cancelAnimationFrame(raf);
    }, []);

    return p;
}
