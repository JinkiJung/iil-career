import { useEffect, useRef } from "react";
import { Overview } from "./Overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScrollManager } from "./ScrollManager";
import './Section.scss';

export interface SectionProp {
    item: any;
    index: number;
}

function buildBackground(theme: any): string {
    if (!theme.gradientType || !theme.gradientStops?.length) {
        return theme.background;
    }
    const stops = theme.gradientStops
        .map(([color, pos]: [string, string]) => `${color} ${pos}`)
        .join(', ');

    let primary: string;
    switch (theme.gradientType) {
        case 'radial':
            primary = `radial-gradient(${theme.gradientAngle || 'ellipse at 50% 50%'}, ${stops})`;
            break;
        case 'conic':
            primary = `conic-gradient(${theme.gradientAngle || 'from 0deg at 50% 50%'}, ${stops})`;
            break;
        default:
            primary = `linear-gradient(${theme.gradientAngle || '180deg'}, ${stops})`;
    }

    return theme.gradientOverlay
        ? `${theme.gradientOverlay}, ${primary}`
        : primary;
}

export const Section = ({ item }: SectionProp) => {
    const resume = item.about.resume;
    const theme = item.about.resumeTheme;
    const contentColor = theme.contentFontColor;
    const secondaryColor = theme.secondaryFontColor;

    const outerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const { register } = useScrollManager();

    useEffect(() => {
        const outer = outerRef.current;
        const sticky = stickyRef.current;
        if (!outer || !sticky) return;
        return register(outer, sticky);
    }, [register]);

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
            style={{ background: buildBackground(theme) }}
        >
            <div ref={stickyRef} className="section-sticky">
                <div className="section-top-gap" />
                <Overview item={item} />

                <div className="section-body">
                    {/* Left: Why + Competencies Demonstrated */}
                    <div className="section-zone section-zone--left">
                        <div className="section-left-content">
                            {resume?.why && (
                                <Card style={cardStyle} className="section-card">
                                    <CardHeader className="section-card-header">
                                        <CardTitle style={{ color: contentColor }} className="section-card-title">
                                            Why?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="section-prose" style={{ color: contentColor }}>{resume.why}</p>
                                    </CardContent>
                                </Card>
                            )}
                            <Card style={cardStyle} className="section-card">
                                <CardHeader className="section-card-header">
                                    <CardTitle style={{ color: contentColor }} className="section-card-title">
                                        Competencies Demonstrated
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="section-list">
                                        {resume?.myCompetencies?.map((c: string) => (
                                            <li key={c} style={{ color: contentColor }}>{c}</li>
                                        ))}
                                    </ul>
                                    {resume?.techStack && resume.techStack.length > 0 && (
                                        <div className="section-skills">
                                            <p className="section-skills-label" style={{ color: secondaryColor }}>Tech Stack</p>
                                            <div className="section-skills-icons">
                                                {resume.techStack.map((iconName: string) => (
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

                    {/* Right: Contribution Overview + My Contributions */}
                    <div className="section-zone section-zone--right">
                        <div className="section-right-content">
                            {resume?.contributionOverview && (
                                <Card style={cardStyle} className="section-card">
                                    <CardHeader className="section-card-header">
                                        <CardTitle style={{ color: contentColor }} className="section-card-title">
                                            Contribution Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="section-prose" style={{ color: contentColor }}>{resume.contributionOverview}</p>
                                    </CardContent>
                                </Card>
                            )}
                            <Card style={cardStyle} className="section-card">
                                <CardHeader className="section-card-header">
                                    <CardTitle style={{ color: contentColor }} className="section-card-title">
                                        My Contributions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="section-list">
                                        {resume?.myContributions?.map((c: string) => (
                                            <li key={c} style={{ color: contentColor }}>{c}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
