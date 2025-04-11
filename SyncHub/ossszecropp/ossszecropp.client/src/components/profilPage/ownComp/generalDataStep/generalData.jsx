import React, { useEffect } from "react";
import { ReloadOutlined, RollbackOutlined } from '@ant-design/icons';
import { Form, Input, Typography, Row, Col, Button, Flex, Tooltip } from "antd";
import "../ownComp.css";

const GeneralData = ({ onNext, onBack, updatePercent, totalFields }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        const values = form.getFieldsValue();
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    }, [form, updatePercent, totalFields]);

    const handleSubmit = () => {
        form.validateFields().then(() => {
            onNext();
        }).catch((errorInfo) => {
            console.log('Validation Failed:', errorInfo);
        });
    };

    const handleValuesChange = () => {
        const values = form.getFieldsValue();
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    };

    return (
        <Form form={form} layout="vertical" autoComplete="off" onValuesChange={handleValuesChange}>
            <Flex gap='0.1vh' justify='space-between' vertical>
                <Row style={{ marginTop: "1vh" }}>
                    <Typography.Title level={3}>Company Premises:</Typography.Title>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Zipcode</Typography>} name="zipcode" rules={[{ required: true, message: 'Please fill Zipcode' }]}>
                            <Input placeholder="Zipcode" className="input-form" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<Typography style={{ fontWeight: "bold" }}>City</Typography>} name="city" rules={[{ required: true, message: 'Please fill City' }]}>
                            <Input placeholder="City" className="input-form" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Address</Typography>} name="address" rules={[{ required: true, message: 'Please fill Address' }]}>
                            <Input placeholder="Address" className="input-form" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Country</Typography>} name="country" rules={[{ required: true, message: 'Please fill Country' }]}>
                            <Input placeholder="Country" className="input-form" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={24}>
                        <Flex justify="space-around">
                            <Button icon={<ReloadOutlined style={{ color: "red" }} />} style={{ border: 'none' }} />
                            <Button htmlType="submit" onClick={handleSubmit} style={{ border: "#14213d solid 1px", boxShadow: "none", backgroundColor: "transparent", width: "20vh" }}>
                                Next
                            </Button>
                            <Tooltip title="Click to go back">
                                <Button icon={<RollbackOutlined />} style={{ border: 'none', boxShadow: '0 0 0 rgba(255,255,255,255.0)' }} onClick={onBack} />
                            </Tooltip>
                        </Flex>
                    </Col>
                </Row>
            </Flex>
        </Form>
    )
}
export default GeneralData;
