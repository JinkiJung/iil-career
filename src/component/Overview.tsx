import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import './Overview.scss';

export interface OverviewProps {
    item: any;
}

type MediaKind = 'image' | 'video';
type MediaInfo = { file: string; kind: MediaKind; src: string };

const BASE_URL = import.meta.env.BASE_URL ?? '/';
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogg']);

function resolveMedia(thumbnail: string | undefined): MediaInfo | null {
    if (!thumbnail) return null;
    const trimmed = thumbnail.trim();
    if (!trimmed) return null;
    const ext = trimmed.split('.').pop()?.toLowerCase() ?? '';
    const kind: MediaKind = VIDEO_EXTENSIONS.has(ext) ? 'video' : 'image';
    // If the thumbnail is already an absolute/site URL, use it directly;
    // otherwise resolve it against public/images/.
    const isAbsolute = /^(https?:)?\/\//.test(trimmed) || trimmed.startsWith(BASE_URL);
    const src = isAbsolute
        ? trimmed
        : `${BASE_URL}images/${encodeURIComponent(trimmed)}`;
    return { file: trimmed, kind, src };
}

export const Overview = ({ item }: OverviewProps) => {
    const resume = item.about.resume;
    const theme = item.about.resumeTheme;
    const contentColor = theme.contentFontColor;
    const secondaryColor = theme.secondaryFontColor;
    const titleColor = theme.titleFontColor;
    const shadowColor = theme.titleFontShadowColor;
    const titleRowRef = useRef<HTMLDivElement>(null);

    const media = resolveMedia(item.about?.thumbnail);

    const allTags = [...new Set([
        ...(resume?.category ?? []),
        ...(resume?.keywords ?? []),
    ])];
    const outputs: { name: string; link: string }[] = item.output ?? [];

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
            <div
                className={`overview-title-row ${media ? 'overview-title-row--has-media' : ''}`.trim()}
                ref={titleRowRef}
            >
                <div className="overview-title-text">
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
                </div>
                {media && (
                    <div className="overview-hero-media">
                        {media.kind === 'video' ? (
                            <video
                                className="overview-hero-video"
                                src={media.src}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                aria-label={resume?.shortName}
                            />
                        ) : (
                            <img
                                className="overview-hero-img"
                                src={media.src}
                                alt={resume?.shortName}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="overview-divider" style={{ borderColor: `${contentColor}22` }} />

            {/* Bottom: 3-column meta row */}
            <div className="overview-meta-row">
                {/* Col 1: Showcase (output links) ↔ Period crossfade */}
                <div className="overview-meta-col overview-meta-col--period">
                    {outputs.length > 0 && (
                        <div className="overview-period-outputs">
                            <span className="overview-meta-label" style={{ color: secondaryColor }}>
                                Showcase
                            </span>
                            <div className="overview-output-links">
                                {outputs.map((o) => (
                                    <a
                                        key={o.link}
                                        href={o.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="overview-output-link"
                                        style={{ color: contentColor }}
                                    >
                                        {o.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className={`overview-period-dates${outputs.length > 0 ? '' : ' overview-period-dates--only'}`}>
                        <span className="overview-meta-label" style={{ color: secondaryColor }}>
                            Period
                        </span>
                        <span className="overview-meta-period" style={{ color: contentColor }}>
                            {resume?.startDate}
                            <br />
                            — {resume?.endDate}
                        </span>
                    </div>
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
