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
                <Container fluid style={{backgroundImage: item.describe.resumeTheme.background, height: "100%"}}>
                    <Row style={{height: "10%"}}>
                        <Col xs lg="2" className="text-start">
                            <span style={{color: item.describe.resumeTheme.contentFontColor}}>{item.describe.resume?.keywords.join(', ')}</span>
                        </Col>
                        <Col></Col>
                        <Col xs lg="2" >
                            <Row className="text-end" style={{justifyContent:'right'}}>
                                <span style={{color: item.describe.resumeTheme.contentFontColor}}>{item.describe.resume?.period}</span>
                            </Row>
                            <Row className="text-end" style={{justifyContent:'right'}}>
                                <a target="_blank" rel="noreferrer" href={item.describe.resume?.affiliation.link}>{item.describe.resume?.affiliation.name}</a>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{height: "5%"}}>
                    </Row>
                    <Row style={{height: "10%"}}>
                        <Col xs={1} className="p-0"></Col>
                        <Col className={`p-0 fs-2 fw-bold ${careerTextAlignment}`}>
                            <div className={`fs-5`}>
                                <span style={{color: item.describe.resumeTheme.secondaryFontColor}}>
                                    {item.describe.resume?.category.join(', ')}
                                </span>
                            </div>
                            <div className={''}>
                                <span style={
                                    {
                                        color: item.describe.resumeTheme.titleFontColor,
                                        textShadow: `2px 2px 0 ${item.describe.resumeTheme.titleFontShadowColor}, -1px -1px 0 ${item.describe.resumeTheme.titleFontShadowColor}, 1px -1px 0 ${item.describe.resumeTheme.titleFontShadowColor}, -1px 1px 0 ${item.describe.resumeTheme.titleFontShadowColor}, 1px 1px 0 ${item.describe.resumeTheme.titleFontShadowColor}`,
                                    }
                                    }>
                                    {item.act}
                                </span>
                            </div>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{height: "10%"}}>
                        <Col xs={1} className="p-0"></Col>
                        <Col className={`p-0 fs-5 ${careerTextAlignment}`}>
                            <span style={{color: item.describe.resumeTheme.contentFontColor}}>
                                {item.describe.resume?.description}
                            </span>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{height: "20%"}}>
                        <Col xs={1} className="p-0"></Col>
                        <Col>
                            <Row style={{justifyContent:`${careerAlignment}`}} className={`fs-5 ${careerTextAlignment}`}>
                                <span style={{color: item.describe.resumeTheme.contentFontColor}}>
                                    <h4>Contribution</h4>
                                </span>
                            </Row>
                            <Row style={{justifyContent:`${careerAlignment}`}} className={`fs-5 ${careerTextAlignment}`}>
                                
                                    {item.describe.resume?.contributions.map((e: string) => <i><span style={{color: item.describe.resumeTheme.contentFontColor}}>
                                        {e}
                                    </span></i>)}
                                
                            </Row>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>
                    <Row style={{height: "10%"}}>
                        <Col xs={1} className="p-0"></Col>
                        <Col className={`p-0 fs-5 ${careerTextAlignment}`}>
                            <span style={{color: item.describe.resumeTheme.contentFontColor}}>
                                {item.describe.resume?.skills.join(', ')}
                            </span>
                        </Col>
                        <Col xs={1} className="p-0"></Col>
                    </Row>             
                    <Row style={{height: "35%"}}>
                        <Col xs={1}></Col>
                        <Col>
                            <Row style={{justifyContent:`${outputAlignment}`}} className={`fs-4 ${outputTextAlignment}`}>
                                <span style={{color: item.describe.resumeTheme.contentFontColor}}>
                                    Output
                                </span> 
                            </Row>
                            <Row style={{justifyContent:`${outputAlignment}`}} className={`fs-5 ${outputTextAlignment}`}>
                                <span style={{color: item.describe.resumeTheme.contentFontColor}}>
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