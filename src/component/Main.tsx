import { Container } from "react-bootstrap";
import data from '../data/career-en.json';
import { Section } from "./Section";
import { ScrollRuler } from "./ScrollRuler";
import './Main.scss';
import { Header } from "./Header";

export const Main = () => {
    return <>
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