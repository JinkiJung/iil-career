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

    const allTags = [
        ...(resume?.category ?? []),
        ...(resume?.keywords ?? []),
    ];

    return (
        <div className="overview-container">
            {/* Title area — starts centered (hero), transitions to top (compact) */}
            <div className="overview-title-row">
                <h1
                    className="overview-title"
                    style={{
                        color: titleColor,
                        textShadow: `2px 2px 0 ${shadowColor}`,
                    }}
                >
                    {item.act.name}
                </h1>
                <p className="overview-subtitle" style={{ color: secondaryColor }}>
                    {resume?.affiliation?.name} &middot; {resume?.startDate} — {resume?.endDate}
                </p>
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

                {/* Col 2: Tags (category + keywords) */}
                <div className="overview-meta-col overview-meta-col--tags">
                    <span className="overview-meta-label" style={{ color: secondaryColor }}>
                        Category &amp; Keywords
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
