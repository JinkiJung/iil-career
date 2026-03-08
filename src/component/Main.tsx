import { Container } from "react-bootstrap";
import dataEn from '../data/career-en.json';
import dataKo from '../data/career-ko.json';
import { Section } from "./Section";
import { ScrollRuler } from "./ScrollRuler";
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

    return <>
        <LangSwitch current={locale} />
        <ScrollRuler entries={data.career as any[]} />
        <Container fluid className="careerContainer p-0">
            <Header></Header>
            {
                data.career.map((e, index) => {
                    return <Section key={e.act.name} item={e} index={index}></Section>;
                })
            }
        </Container>
    </>;
}
