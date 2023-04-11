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
                    <Row style={{ flexGrow: 0, paddingBottom: '8px' }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col>
                            <Row>
                            <Col className="text-start p-0">
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>{item.about.resume?.keywords.join(', ')}</span>
                            </Col>
                            <Col className="text-end p-0">
                                <Row style={{justifyContent:'right'}}>
                                    <span style={{color: item.about.resumeTheme.contentFontColor}}>affiliation: <a target="_blank" rel="noreferrer" href={item.about.resume?.affiliation.link}>{item.about.resume?.affiliation.name}</a>, {item.about.resume?.period}</span>
                                </Row>
                            </Col>
                            </Row>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{ flexGrow: 1 }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col className={`p-0 fs-2 ${careerTextAlignment}`}>
                            <div className={`fs-5 fw-bold `}>
                                <span style={{color: item.about.resumeTheme.secondaryFontColor}}>
                                    {item.about.resume?.category.join(', ')}
                                </span>
                            </div>
                            <div>
                                <span style={
                                    {
                                        color: item.about.resumeTheme.titleFontColor,
                                        textShadow: `2px 2px 0 ${item.about.resumeTheme.titleFontShadowColor}, -1px -1px 0 ${item.about.resumeTheme.titleFontShadowColor}, 1px -1px 0 ${item.about.resumeTheme.titleFontShadowColor}, -1px 1px 0 ${item.about.resumeTheme.titleFontShadowColor}, 1px 1px 0 ${item.about.resumeTheme.titleFontShadowColor}`,
                                    }
                                    }>
                                    {item.act.name}
                                </span>
                            </div>
                            <div className={`p-0 fs-5 ${careerTextAlignment}`}>
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                    {item.about.resume?.description}
                                </span>
                            </div>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{ flexGrow: 1 }}>
                    </Row>
                    <Row style={{ flexGrow: 1 }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col>
                            <Row style={{justifyContent:`${careerAlignment}`}} className={`fs-5 ${careerTextAlignment}`}>
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                    <h4>Contribution</h4>
                                </span>
                            </Row>
                            <Row style={{justifyContent:`${careerAlignment}`}} className={` ${careerTextAlignment}`}>
                                    {item.about.resume?.contributions.map((e: string) => <i key={e}><span style={{color: item.about.resumeTheme.contentFontColor}}>
                                        {e}
                                    </span></i>)}
                            </Row>
                            <Row style={{justifyContent:`${careerAlignment}`}} className={`fs-5 ${careerTextAlignment} pt-2`}>
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                    {item.about.resume?.skills.map((iconName: string) => 
                                        <img key={iconName} src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName.toLowerCase()}/${iconName.toLowerCase()}-original.svg`} height={50} alt={iconName}/>
                                    )}
                                </span>
                            </Row>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{ flexGrow: 1 }}>
                        <Col xs={1} className="p-0"></Col>
                        <Col className={`p-0 fs-5 ${careerTextAlignment}`}>
                            
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>             
                    <Row style={{ flexGrow: 0 }} className="pb-5">
                        <Col xs={1}></Col>
                        <Col>
                            <Row style={{justifyContent:`${outputAlignment}`}} className={`fs-4 ${outputTextAlignment}`}>
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                    Reference
                                </span> 
                            </Row>
                            <Row style={{justifyContent:`${outputAlignment}`}} className={`fs-5 ${outputTextAlignment}`}>
                                <span style={{color: item.about.resumeTheme.contentFontColor}}>
                                    {item.output?.map((t: any) => <div key={t.name}><a href={t.link}>{t.name}</a></div>)}
                                </span>
                            </Row>
                        </Col>
                        <Col xs={1}></Col>
                    </Row>
                </Container>
        </Row>
    );
}