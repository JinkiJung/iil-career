import { Col, Container, Row } from "react-bootstrap";

export interface SectionProp {
    item: any;
    index: number;
}

export const Section = ({item, index}: SectionProp) => {
    let careerTextAlignment, outputTextAlignment, careerAlignment, outputAlignment;
    if (index % 2) {
        careerTextAlignment = 'text-start';
        outputTextAlignment = 'text-end';
        careerAlignment = 'left';
        outputAlignment = 'right';
    } else {
        careerTextAlignment = 'text-end';
        outputTextAlignment = 'text-start';
        careerAlignment = 'right';
        outputAlignment = 'left';
    }
    return (
        <Row className="w-100 d-flex careerItem p-0 m-0">
            <Container style={{ backgroundImage: item.about.resumeTheme.background, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                    <Row style={{ flexGrow: 0 }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col>
                            <Row>
                            <Col className="text-start">
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>{item.about.resume?.keywords.join(', ')}</span>
                            </Col>
                            <Col >
                                <Row className="text-end" style={{justifyContent:'right'}}>
                                    <span style={{color: item.about.resumeTheme.contentFontColor}}>{item.about.resume?.period}</span>
                                    <span style={{color: item.about.resumeTheme.contentFontColor}}> affiliation: </span>
                                    <a target="_blank" rel="noreferrer" href={item.about.resume?.affiliation.link}>{item.about.resume?.affiliation.name}</a>
                                </Row>
                            </Col>
                            </Row>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{ flexGrow: 1 }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col className={`p-0 fs-2 fw-bold ${careerTextAlignment}`}>
                            <div className={`fs-5`}>
                                <span style={{color: item.about.resumeTheme.secondaryFontColor}}>
                                    {item.about.resume?.category.join(', ')}
                                </span>
                            </div>
                            <div className={''}>
                                <span style={
                                    {
                                        color: item.about.resumeTheme.titleFontColor,
                                        textShadow: `2px 2px 0 ${item.about.resumeTheme.titleFontShadowColor}, -1px -1px 0 ${item.about.resumeTheme.titleFontShadowColor}, 1px -1px 0 ${item.about.resumeTheme.titleFontShadowColor}, -1px 1px 0 ${item.about.resumeTheme.titleFontShadowColor}, 1px 1px 0 ${item.about.resumeTheme.titleFontShadowColor}`,
                                    }
                                    }>
                                    {item.act.name}
                                </span>
                            </div>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{ flexGrow: 1 }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col className={`p-0 fs-5 ${careerTextAlignment}`}>
                            <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                {item.about.resume?.description}
                            </span>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{ flexGrow: 1 }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col>
                            <Row style={{justifyContent:`${careerAlignment}`}} className={`fs-5 ${careerTextAlignment}`}>
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                    <h4>Contribution</h4>
                                </span>
                            </Row>
                            <Row style={{justifyContent:`${careerAlignment}`}} className={`fs-5 ${careerTextAlignment}`}>
                                
                                    {item.about.resume?.contributions.map((e: string) => <i><span style={{color: item.about.resumeTheme.contentFontColor}}>
                                        {e}
                                    </span></i>)}
                                
                            </Row>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{ flexGrow: 1 }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col className={`p-0 fs-5 ${careerTextAlignment}`}>
                            <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                {item.about.resume?.skills.map((iconName: string) => 
                                    <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName.toLowerCase()}/${iconName.toLowerCase()}-original.svg`} height={60}/>
                                )}
                            </span>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>             
                    <Row style={{ flexGrow: 0 }}>
                        <Col xs={1}></Col>
                        <Col>
                            <Row style={{justifyContent:`${outputAlignment}`}} className={`fs-4 ${outputTextAlignment}`}>
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                    Reference
                                </span> 
                            </Row>
                            <Row style={{justifyContent:`${outputAlignment}`}} className={`fs-5 ${outputTextAlignment}`}>
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                    {item.output?.map((t: any) => <div><a href={t.link}>{t.name}</a></div>)}
                                </span>
                            </Row>
                        </Col>
                        <Col xs={1}></Col>
                    </Row>
                </Container>
        </Row>
    );
}