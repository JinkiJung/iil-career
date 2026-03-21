import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import './Overview.scss';

export interface OverviewProps {
    item: any;
}

export const Overview = ({ item }: OverviewProps) => {
    const resume = item.about.resume;
    const theme = item.about.resumeTheme;
    const contentColor = theme.contentFontColor;
    const secondaryColor = theme.secondaryFontColor;
    const titleColor = theme.titleFontColor;
    const shadowColor = theme.titleFontShadowColor;
    const titleRowRef = useRef<HTMLDivElement>(null);

    const allTags = [
        ...(resume?.category ?? []),
        ...(resume?.keywords ?? []),
    ];

    const titleWords = (item.act.name as string).split(' ');

    useEffect(() => {
        const row = titleRowRef.current;
        if (!row) return;
        const container = row.closest('.careerContainer') as HTMLElement;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    row.classList.add('overview-title-row--revealed');
                } else {
                    row.classList.remove('overview-title-row--revealed');
                }
            },
            { root: container, threshold: 0.1 }
        );

        observer.observe(row);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="overview-container">
            {/* Title area — starts centered (hero), transitions to top (compact) */}
            <div className="overview-title-row" ref={titleRowRef}>
                <h1 className="overview-title" aria-label={item.act.name}>
                    {titleWords.map((word, i) => (
                        <span key={i} className="overview-title-mask">
                            <span
                                className="overview-title-word"
                                style={{
                                    color: titleColor,
                                    textShadow: `2px 2px 0 ${shadowColor}`,
                                    transitionDelay: `${i * 0.08}s`,
                                }}
                            >
                                {word}
                            </span>
                        </span>
                    ))}
                </h1>
                <p className="overview-subtitle" style={{ color: secondaryColor }}>
                    {resume?.affiliation?.name} &middot; {resume?.startDate} — {resume?.endDate}
                </p>
                <div className="overview-hero-image">
                    <img
                        src={`/iil-career/images/${encodeURIComponent(resume?.shortName)}.png`}
                        alt={resume?.shortName}
                        className="overview-hero-img"
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="overview-divider" style={{ borderColor: `${contentColor}22` }} />

            {/* Bottom: 3-column meta row */}
            <div className="overview-meta-row">
                {/* Col 1: Period */}
                <div className="overview-meta-col overview-meta-col--period">
                    <span className="overview-meta-label" style={{ color: secondaryColor }}>
                        Period
                    </span>
                    <span className="overview-meta-period" style={{ color: contentColor }}>
                        {resume?.startDate}
                        <br />
                        — {resume?.endDate}
                    </span>
                </div>

                {/* Col 2: Team & Role */}
                <div className="overview-meta-col overview-meta-col--team">
                    <span className="overview-meta-label" style={{ color: secondaryColor }}>
                        Team / Role
                    </span>
                    <span className="overview-meta-team" style={{ color: contentColor }}>
                        {resume?.team}
                    </span>
                    <span className="overview-meta-role" style={{ color: secondaryColor }}>
                        {resume?.myRole}
                    </span>
                </div>

                {/* Col 3: Tags (category + keywords) */}
                <div className="overview-meta-col overview-meta-col--tags">
                    <span className="overview-meta-label" style={{ color: secondaryColor }}>
                        Keywords
                    </span>
                    <div className="overview-badges">
                        {allTags.map((tag: string) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="overview-badge"
                                style={{
                                    borderColor: contentColor,
                                    color: contentColor,
                                }}
                            >
                                {tag.toUpperCase()}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Col 3: Summary + Affiliation */}
                <div className="overview-meta-col overview-meta-col--summary">
                    <span className="overview-meta-label" style={{ color: secondaryColor }}>
                        Summary
                    </span>
                    <p className="overview-description" style={{ color: contentColor }}>
                        {resume?.description}
                    </p>
                    <a
                        href={resume?.affiliation?.link}
                        target="_blank"
                        rel="noreferrer"
                        className="overview-affiliation"
                        style={{ color: secondaryColor }}
                    >
                        @ {resume?.affiliation?.name}
                    </a>
                </div>
            </div>
        </div>
    );
};
