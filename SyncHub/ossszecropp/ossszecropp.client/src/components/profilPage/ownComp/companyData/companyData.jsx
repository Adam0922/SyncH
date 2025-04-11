import "../ownComp.css";
import React, { useEffect } from "react";
import { ReloadOutlined, RollbackOutlined } from '@ant-design/icons';
import { Form, Input, Typography, Row, Col, Button, Flex, Tooltip } from "antd";

const CompanyData = ({ onNext, onBack, updatePercent, totalFields }) => {
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
                    <Typography.Title level={3}>Company:</Typography.Title>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Form.Item label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Company Name
                            </Typography>
                        } name="Company Name" rules={[{ required: true, message: 'Please input your company name!' }]}>
                            <Input type="text" placeholder="Company Name" className="input-form" maxLength={50} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Company Tax Number</Typography>} name="Company Tax Number" rules={[{ required: true, message: 'Please input your company tax number!' }]}>
                            <Input type="text" placeholder="Company Tax Number" className="input-form" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Form.Item name="vatnum" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Vat Number
                            </Typography>
                        }>
                            <Input placeholder="Vat Number" className="input-form" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="regnum" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Registracion Number
                            </Typography>
                        }>
                            <Input placeholder="Registracion Number" className="input-form" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Form.Item name="email" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Email
                            </Typography>
                        } rules={[{ required: true, message: 'Please input email!' }]}>
                            <Input type="email" placeholder="Email" className="input-form" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="phone" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Phone Number
                            </Typography>
                        } rules={[{ required: true, message: 'Please fill Phone Number' }]}>
                            <Input type="text" placeholder="Phone Number" className="input-form" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Form.Item name="bankaddress" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Bank Address
                            </Typography>
                        } rules={[{ required: true, message: 'Please fill Bank Address' }]}>
                            <Input type="text" placeholder="Bank Address" className="input-form" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={24}>
                        <Flex justify="space-around">
                            <Button icon={<ReloadOutlined style={{ color: "red" }} />} style={{ border: 'none' }} />
                            <Button htmlType="submit" onClick={handleSubmit} style={{ border: "#14213d solid 1px", boxShadow: "none", backgroundColor: "transparent", width: "20vh" }}>
                                Sign Up
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
export default CompanyData;
