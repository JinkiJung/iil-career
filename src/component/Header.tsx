import { Card, Col, Container, Row } from "react-bootstrap";
import './Header.scss';

const boxStyle = {
    backgroundColor: '#2F4858',
    borderRadius: '25px',
    minWidth: '600px',
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)'
  };
  
  const titleStyle = {
    color: '#F6AE2D',
    fontWeight: 'bold',
    fontSize: '36px',
    marginBottom: '30px',
  };
  
  const descriptionStyle = {
    textAlign: 'center' as const,
    paddingTop: '15px',
    fontSize: '24px',
    color: '#DDDDDD',
  };
  
export const Header = () => {
    return <Row className="w-100 d-flex careerItem p-0 m-0">
    <Container style={{ backgroundColor: '#33658A', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Row style={{ flexGrow: 1 }}>
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div style={boxStyle}>
                    <div style={titleStyle}>Jinki Jung</div>
                    <img src={window.location.origin + process.env.PUBLIC_URL + "/jinki_profile.png"} alt="profile pic" height="180px"></img>
                    <div style={descriptionStyle}>developer career page</div>
                </div>
            </Container>
        </Row>
        <Row style={{ flexGrow: 0 }}>
                <div className="arrow-container">
                    <p className="text">Scroll down for more</p>
                    <div className="arrow-down"></div>
                </div>
        </Row>
        </Container>
    </Row>;
}