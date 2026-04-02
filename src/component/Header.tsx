import { useEffect, useRef } from 'react';
import anime from 'animejs';
import './Header.scss';

interface HeaderLink {
    label: string;
    url: string;
}

interface HeaderProps {
    frontPage: {
        subtitle: string;
        name: string;
        links: HeaderLink[];
    };
}

export const Header = ({ frontPage }: HeaderProps) => {
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const subtitleEl = subtitleRef.current;
        const nameEl = nameRef.current;
        if (!subtitleEl || !nameEl) return;

        // Set text from props to handle locale changes
        subtitleEl.textContent = frontPage.subtitle;
        nameEl.textContent = frontPage.name;

        subtitleEl.innerHTML = subtitleEl.textContent!.replace(/\S/g, "<span class='header-subtitle-letter'>$&</span>");
        nameEl.innerHTML = nameEl.textContent!.replace(/\S/g, "<span class='header-name-letter'>$&</span>");

        anime.timeline({ loop: false })
            .add({
                targets: '.header-subtitle-letter',
                opacity: [0, 1],
                easing: 'easeInOutQuad',
                duration: 100,
                delay: (_el: HTMLElement, i: number) => 60 * (i + 1),
            })
            .add({
                targets: '.header-name-letter',
                opacity: [0, 1],
                easing: 'easeInOutQuad',
                duration: 2000,
                delay: (_el: HTMLElement, i: number) => 120 * (i + 1),
            }, 0);
    }, [frontPage.subtitle, frontPage.name]);

    return (
        <div className="header">
            <nav className="header-links">
                {frontPage.links.map((link) => (
                    <a
                        key={link.label}
                        href={link.url}
                        className="header-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {link.label}
                    </a>
                ))}
            </nav>

            <div className="header-hero">
                <p ref={subtitleRef} className="header-subtitle">{frontPage.subtitle}</p>
                <h1 ref={nameRef} className="header-name">{frontPage.name}</h1>
            </div>
        </div>
    );
};
