import { Container } from "react-bootstrap";
import data from '../data/career.json';
import { Section } from "./Section";
import './Main.scss';
import { Header } from "./Header";

export const Main = () => {
    return <Container fluid className="careerContainer p-0">
        <Header></Header>
    {
        data.career.map((e, index) => {
            return <Section key={e.act.name} item={e} index={index}></Section>;
            }
            )
    }
    </Container>;
}