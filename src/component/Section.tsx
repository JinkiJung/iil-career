import { useEffect, useRef } from "react";
import { Overview } from "./Overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import './Section.scss';

export interface SectionProp {
    item: any;
    index: number;
}

export const Section = ({ item }: SectionProp) => {
    const resume = item.about.resume;
    const theme = item.about.resumeTheme;
    const contentColor = theme.contentFontColor;
    const secondaryColor = theme.secondaryFontColor;

    const outerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const outer = outerRef.current;
        const sticky = stickyRef.current;
        if (!outer || !sticky) return;
        const container = outer.closest('.careerContainer') as HTMLElement;
        if (!container) return;

        const onScroll = () => {
            const rect = outer.getBoundingClientRect();
            const vh = window.innerHeight;
            const scrolled = Math.max(0, -rect.top);

            // Dead zones: 80vh at top and bottom where nothing changes
            const deadTop = vh * 0.8;
            const deadBottom = vh * 0.8;
            const totalScrollable = outer.offsetHeight - vh;

            // Active zone = total minus both dead zones
            const activeStart = deadTop;
            const activeEnd = totalScrollable - deadBottom;
            const effective = Math.max(0, Math.min(scrolled - activeStart, activeEnd - activeStart));

            // gapMax = remaining space above overview to center it vertically
            const overviewEl = sticky.querySelector('.overview-container') as HTMLElement;
            const overviewH = overviewEl ? overviewEl.offsetHeight : 0;
            const gapMax = Math.max(vh * 0.1, (vh - overviewH) / 2);

            // Phase 1: gap shrinks (effective 0 → gapMax)
            const g = Math.max(0, gapMax - effective);
            sticky.style.setProperty('--g', `${g.toFixed(1)}px`);

            // Phase 2: p increases (effective gapMax → activeZone)
            const activeZone = activeEnd - activeStart;
            let p = 0;
            if (effective > gapMax) {
                const transitionZone = activeZone - gapMax;
                p = transitionZone > 0
                    ? Math.min(1, (effective - gapMax) / transitionZone)
                    : 1;
            }
            sticky.style.setProperty('--p', p.toFixed(3));

            const phase = scrolled < deadTop ? 'DEAD_TOP'
                : effective < gapMax ? 'GAP_SHRINK'
                : p < 1 ? 'TRANSITION'
                : scrolled < activeEnd + deadTop ? 'P_DONE'
                : 'DEAD_BOTTOM';
            console.log({ phase, scrolled: +scrolled.toFixed(0), effective: +effective.toFixed(0), g: +g.toFixed(1), p: +p.toFixed(3) });
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    const cardStyle = {
        background: 'rgba(0,0,0,0.12)',
        backdropFilter: 'blur(4px)',
        border: `1px solid rgba(128,128,128,0.2)`,
        borderRadius: '12px',
    };

    return (
        <div
            ref={outerRef}
            className="section-outer"
            style={{ backgroundColor: theme.background }}
        >
            <div ref={stickyRef} className="section-sticky">
                <div className="section-top-gap" />
                <Overview item={item} />

                <div className="section-body">
                    {/* My Contributions */}
                    <div className="section-zone">
                        <Card style={cardStyle} className="section-card">
                            <CardHeader className="section-card-header">
                                <CardTitle style={{ color: contentColor }} className="section-card-title">
                                    My Contributions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="section-list">
                                    {resume?.contributions?.map((c: string) => (
                                        <li key={c} style={{ color: contentColor }}>
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Competencies Demonstrated */}
                    <div className="section-zone section-zone--right">
                        <Card style={cardStyle} className="section-card">
                            <CardHeader className="section-card-header">
                                <CardTitle style={{ color: contentColor }} className="section-card-title">
                                    Competencies Demonstrated
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="section-list">
                                    {resume?.competencies?.map((c: string) => (
                                        <li key={c} style={{ color: contentColor }}>
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                                {resume?.skills && resume.skills.length > 0 && (
                                    <div className="section-skills">
                                        <p className="section-skills-label" style={{ color: secondaryColor }}>
                                            Tech Stack
                                        </p>
                                        <div className="section-skills-icons">
                                            {resume.skills.map((iconName: string) => (
                                                <div key={iconName} className="section-skill-item">
                                                    <img
                                                        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName.toLowerCase()}/${iconName.toLowerCase()}-original.svg`}
                                                        height={32}
                                                        alt={iconName}
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                    <span style={{ color: secondaryColor }}>{iconName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
