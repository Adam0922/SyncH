/* eslint-disable react/prop-types */
import { Card, Form, Input, Typography, Row, Col, Button, Grid } from "antd";
import { ReloadOutlined, RollbackOutlined } from '@ant-design/icons';
import React, { useEffect } from "react";

const { useBreakpoint } = Grid;

const DataOfBirth = ({ onNext, onBack, updatePercent, totalFields }) => {
    const [form] = Form.useForm();
    const screens = useBreakpoint();

    useEffect(() => {
        const savedData = localStorage.getItem('dataOfBirth');
        if (savedData) {
            form.setFieldsValue(JSON.parse(savedData));
        }
        const values = form.getFieldsValue();
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    }, [form, updatePercent, totalFields]);

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            console.log('Data of Birth:', values); // Log the data to the console
            localStorage.setItem('dataOfBirth', JSON.stringify(values));
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

    const handleClear = () => {
        form.resetFields();
        localStorage.removeItem('dataOfBirth');
        updatePercent(0);
    };

    const validateAge = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Please fill Birthdate'));
        }
        const birthdate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDiff = today.getMonth() - birthdate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }
        if (age < 18) {
            return Promise.reject(new Error('Employee must be at least 18 years old'));
        }
        return Promise.resolve();
    };

    return (
        <Card>
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                onValuesChange={handleValuesChange}
            >
                <Row gutter={16}>
                    <Col span={screens.xs ? 24 : 8}>
                        <Form.Item
                            name="firstName"
                            label={<Typography style={{ fontWeight: "bold" }}>First Name</Typography>}
                            rules={[{ required: true, message: 'Please fill First Name' }]}>
                            <Input type="text" placeholder="First Name" />
                        </Form.Item>
                    </Col>
                    <Col span={screens.xs ? 24 : 8}>
                        <Form.Item
                            name="middleName"
                            label={<Typography style={{ fontWeight: "bold" }}>Middle Name</Typography>}>
                            <Input type="text" placeholder="Middle Name" />
                        </Form.Item>
                    </Col>
                    <Col span={screens.xs ? 24 : 8}>
                        <Form.Item
                            name="lastName"
                            label={<Typography style={{ fontWeight: "bold" }}>Last Name</Typography>}
                            rules={[{ required: true, message: 'Please fill Last Name' }]}>
                            <Input type="text" placeholder="Last Name" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={screens.xs ? 24 : 12}>
                        <Form.Item
                            name="birthplace"
                            label={<Typography style={{ fontWeight: "bold" }}>Birthplace</Typography>}
                            rules={[{ required: true, message: 'Please fill Birthplace' }]}>
                            <Input type="text" placeholder="Birthplace" />
                        </Form.Item>
                    </Col>
                    <Col span={screens.xs ? 24 : 12}>
                        <Form.Item
                            name="birthdate"
                            label={<Typography style={{ fontWeight: "bold" }}>Birthdate</Typography>}
                            rules={[{ required: true, validator: validateAge }]}>
                            <Input type="date" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <div style={{ position: 'relative', height: '40px' }}>
                            <Button type="primary" onClick={handleSubmit} style={{ boxShadow: "none", position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                                Continue
                            </Button>
                            <Button icon={<ReloadOutlined style={{ color: "red" }} />} style={{ border: 'none' }} onClick={handleClear} />
                            <Button icon={<RollbackOutlined />} style={{ position: 'absolute', right: 0, border: 'none' }} onClick={onBack} />
                        </div>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default DataOfBirth;
