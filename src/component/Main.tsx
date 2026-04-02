import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import dataEn from '../data/career-en.json';
import dataKo from '../data/career-ko.json';
import { Section } from "./Section";
import { ScrollRuler } from "./ScrollRuler";
import { ScrollManagerProvider } from "./ScrollManager";
import './Main.scss';
import { Header } from "./Header";
import { LangSwitch } from "./LangSwitch";

const dataMap: Record<string, typeof dataEn> = {
    en: dataEn,
    ko: dataKo,
};

interface MainProps {
    locale?: string;
}

export const Main = ({ locale = 'en' }: MainProps) => {
    const data = dataMap[locale] ?? dataEn;
    const [pastHeader, setPastHeader] = useState(false);

    useEffect(() => {
        const container = document.querySelector('.careerContainer') as HTMLElement;
        if (!container) return;
        const onScroll = () => {
            setPastHeader(container.scrollTop > window.innerHeight * 0.5);
        };
        container.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <ScrollManagerProvider>
            <LangSwitch current={locale} onDarkBg={pastHeader} />
            <ScrollRuler entries={data.career as any[]} />
            <Container fluid className="careerContainer p-0">
                <Header frontPage={data.frontPage} />
                {data.career.map((e, index) => (
                    <Section key={e.act.name} item={e} index={index} />
                ))}
            </Container>
        </ScrollManagerProvider>
    );
}
