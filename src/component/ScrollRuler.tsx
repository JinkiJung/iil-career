import { useEffect, useRef, useState } from 'react';
import './ScrollRuler.scss';

interface CareerEntry {
    act: { name: string };
    about: { resume: { shortName: string } };
}

interface ScrollRulerProps {
    entries: CareerEntry[];
}

export const ScrollRuler = ({ entries }: ScrollRulerProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const rulerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = document.querySelector('.careerContainer') as HTMLElement;
        if (!container) return;

        const onScroll = () => {
            const outers = container.querySelectorAll('.section-outer');
            const vh = window.innerHeight;
            let closest = 0;
            let minDist = Infinity;

            outers.forEach((el, i) => {
                const rect = el.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const dist = Math.abs(center - vh / 2);
                if (dist < minDist) {
                    minDist = dist;
                    closest = i;
                }
            });

            setActiveIndex(closest);
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (index: number) => {
        const container = document.querySelector('.careerContainer') as HTMLElement;
        const outers = container?.querySelectorAll('.section-outer');
        if (!outers?.[index]) return;

        // Get or create the fade overlay
        let overlay = document.querySelector('.scroll-fade-overlay') as HTMLElement;
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'scroll-fade-overlay';
            document.body.appendChild(overlay);
        }

        // Fade in to black
        overlay.classList.remove('scroll-fade-out');
        overlay.classList.add('scroll-fade-in');

        // After fade-in completes, scroll instantly then fade out
        setTimeout(() => {
            outers[index].scrollIntoView({ behavior: 'instant' });
            // Small delay to let the scroll settle
            requestAnimationFrame(() => {
                overlay.classList.remove('scroll-fade-in');
                overlay.classList.add('scroll-fade-out');
            });
        }, 250);
    };

    return (
        <div className="scroll-ruler" ref={rulerRef}>
            <div className="scroll-ruler-track">
                {entries.map((entry, i) => (
                    <div
                        key={entry.about.resume.shortName}
                        className={`scroll-ruler-tick ${i === activeIndex ? 'scroll-ruler-tick--active' : ''}`}
                        style={{ top: `${((i + 0.5) / entries.length) * 100}%` }}
                        onClick={() => scrollTo(i)}
                    >
                        <div className="scroll-ruler-dot" />
                        <span className="scroll-ruler-label">
                            {entry.about.resume.shortName}
                        </span>
                        <span className="scroll-ruler-tooltip">
                            {entry.act.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
