import { Card, Form, Input, Typography, Row, Col, Button } from "antd";
import { ReloadOutlined, RollbackOutlined } from '@ant-design/icons';
import React, { useEffect } from "react";

const PersonalData = ({ onNext, onBack, updatePercent, totalFields }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        // Load saved data when component mounts
        const savedData = localStorage.getItem('personalData');
        if (savedData) {
            form.setFieldsValue(JSON.parse(savedData));
        }

        const values = form.getFieldsValue();
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    }, [form, updatePercent, totalFields]);

    const savePersonalData = (data) => {
        localStorage.setItem('personalData', JSON.stringify(data));
    };

    const handleSubmit = () => {
        form.validateFields().then((personalData) => {
            // Ensure these fields are included in the data object
            const data = {
                ...personalData,
                TaxNum: personalData.TaxNum,
                socialSecNum: personalData.socialSecNum,
                bankAccountNumber: personalData.bankAccountNumber,
                // other fields...
            };

            savePersonalData(data);
            onNext();
        }).catch((errorInfo) => {
            console.log('Validation Failed:', errorInfo);
        });
    };

    const handleValuesChange = () => {
        const values = form.getFieldsValue();
        localStorage.setItem('personalData', JSON.stringify(values));
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    };

    const handleClear = () => {
        form.resetFields();
        localStorage.removeItem('personalData');
        updatePercent(0);
    };

    return (
        <Card>
            <Form form={form} layout="vertical" autoComplete="off" onValuesChange={handleValuesChange}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="email"
                            label={<Typography style={{ fontWeight: "bold" }}>Email</Typography>}
                            rules={[{ required: true, message: 'Please fill your Email', type: 'email' }]}>
                            <Input type="email" placeholder="Email" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="password"
                            label={<Typography style={{ fontWeight: "bold" }}>Password</Typography>}
                            rules={[
                                { required: true, message: 'Please fill your Password' },
                                { min: 8, message: 'Password must be at least 8 characters' },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();

                                        const hasUpperCase = /[A-Z]/.test(value);
                                        const hasLowerCase = /[a-z]/.test(value);
                                        const hasNumber = /\d/.test(value);
                                        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

                                        const errors = [];
                                        if (!hasUpperCase) errors.push('one uppercase letter');
                                        if (!hasLowerCase) errors.push('one lowercase letter');
                                        if (!hasNumber) errors.push('one number');
                                        if (!hasSpecialChar) errors.push('one special character');

                                        if (errors.length > 0) {
                                            return Promise.reject(`Password must contain at least ${errors.join(', ')}`);
                                        }

                                        return Promise.resolve();
                                    }
                                }
                            ]}>
                            <Input.Password placeholder="Password" />
                        </Form.Item>

                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="phoneNumber"
                            label={<Typography style={{ fontWeight: "bold" }}>Phone Number</Typography>}
                            rules={[
                                { required: true, message: 'Please fill your Phone Number' },
                                { pattern: /^(?:\+36|06)(?:20|30|31|50|70)\d{7}$/, message: 'Phone number must start with +36 or 06, followed by one of these: 20, 30, 31, 50, 70, and then 7 numbers.' }
                            ]}>
                            <Input type="tel" placeholder="Phone Number" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="idCardNumber"
                            label={<Typography style={{ fontWeight: "bold" }}>ID Card Number</Typography>}
                            rules={[
                                { required: true, message: 'Please fill your ID Card Number' },
                                { pattern: /^\d{9}[A-Z]{2}$/, message: 'ID card number must be a valid Hungarian ID card number (e.g., 123456789AB)' }
                            ]}>
                            <Input placeholder="ID Card Number" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="TaxNumber"
                            label={<Typography style={{ fontWeight: "bold" }}>Tax Number</Typography>}
                            rules={[{ required: true, message: 'Please fill your Tax Number' }]}>
                            <Input placeholder="Tax Number" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="bankAccountNumber"
                            label={<Typography style={{ fontWeight: "bold" }}>Bank Account Number</Typography>}
                            rules={[{ required: true, message: 'Please fill your Bank Account Number' }]}>
                            <Input placeholder="Bank Account Number" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <Form.Item
                            name="socialSecNum"
                            label={<Typography style={{ fontWeight: "bold" }}>Social Security Number</Typography>}
                            rules={[{ required: true, message: 'Please fill your Social Security Number' }]}>
                            <Input placeholder="Social Security Number" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
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

export default PersonalData;
