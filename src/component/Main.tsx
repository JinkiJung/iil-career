import { Container } from "react-bootstrap";
import data from '../data/career.json';
import { Section } from "./Section";
import './Main.scss';

export const Main = () => {
    return <Container fluid className="careerContainer p-0">
    {
        data.career.map((e, index) => {
            return <Section key={e.act.name} item={e} index={index}></Section>;
            }
            )
    }
    </Container>;
}