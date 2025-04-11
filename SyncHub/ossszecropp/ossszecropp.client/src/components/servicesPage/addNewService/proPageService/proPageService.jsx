import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckOutlined, RollbackOutlined } from '@ant-design/icons';
import { Button, Card, Col, Collapse, Flex, Image, Row, Spin, Typography } from "antd";

const ProcessingPageService = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
          setLoading(false);
        }, 10000);
      
        return () => clearTimeout(timer);
      }, []
    );

    const handleBack = () => {
        navigate('/services/add-product');
    };

    const items = [
        {
            key: 1,
            label: "Data in Upload",
            children: (
                <Flex vertical style={{ width: '100%', opacity: '0.6'}} gap='middles'>
                    <Row justify="start" style={{ marginBottom: '0.5em', width: '100%' }}>
                        <Col span={24} style={{ textAlign: 'center' }}>
                            <Image src="https://picsum.photos/200" style={{ width: '100%', borderRadius: '2vh' }}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{ textAlign: 'center' }}>
                            <Typography.Title level={3}>
                            Service Name
                            </Typography.Title>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '-1vh'}}>
                        <Col span={24} style={{ textAlign: 'center' }}>
                            <Typography.Text >
                                Category
                            </Typography.Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{ textAlign: 'center' }}>
                            <Typography.Text >
                                Product/ Service ID
                            </Typography.Text>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '1.5vh'}}>
                        <Col span={24
                        } style={{ textAlign: 'center' }}>
                            <Typography.Text >
                                Price
                            </Typography.Text>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '1.5vh'}}>
                        <Col span={24} style={{ textAlign: 'center' }}>
                            <Typography.Text >
                                Description
                            </Typography.Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button icon={<RollbackOutlined />} style={{ border: 'none' }} onClick={handleBack}/>
                        </Col>
                    </Row>
                </Flex>
            )
        },
    ];

    const handleGoToSuccess = async () => {
        navigate('/success-new-product');
    };    

    return(
        <Card>
            <Flex align="center" justify="center" vertical gap='large' style={{ width: '100%' }}>
                <Typography.Title level={3}>
                    Data in Progress
                </Typography.Title>
                {loading ? ( <Spin /> ) : ( <CheckOutlined style={{ fontSize: 24, color: '#52c41a' }} /> )}
                <Flex justify="space-around">
                    <Button type="primary" onClick={handleGoToSuccess}>
                        Continue
                    </Button>
                </Flex>
                <Row style={{ width: '100%' }}>
                    <Col span={24}>
                        <Collapse items={items} fullWidth />
                    </Col>
                </Row>
            </Flex>
        </Card>
    );
};

export default ProcessingPageService;
