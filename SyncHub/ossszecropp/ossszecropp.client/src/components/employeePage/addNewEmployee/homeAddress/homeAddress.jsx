/* eslint-disable react/prop-types */
import { Card, Form, Input, Typography, Row, Col, Button, message } from "antd";
import { ReloadOutlined, RollbackOutlined } from '@ant-design/icons';
import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomeAddress = ({ onNext, onBack, updatePercent, totalFields }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const savedData = localStorage.getItem('homeAddress');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            form.setFieldsValue({
                zipcode: parsedData.postalCode,
                address: parsedData.streetAddress,
                city: parsedData.city,
                country: parsedData.country
            });
        }
        const values = form.getFieldsValue();
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    }, [form, updatePercent, totalFields]);

    const validatePostalCode = (postalCode) => {
        const postalCodePattern = /^\d{4}$/; // Adjust the pattern according to your requirements
        return postalCodePattern.test(postalCode);
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (!validatePostalCode(values.zipcode)) {
                message.error('Invalid postal code format. Please enter a valid postal code.');
                return;
            }
            const updatedValues = {
                postalCode: values.zipcode,
                streetAddress: values.address,
                city: values.city,
                country: values.country
            };
            verifyZipAndCity(values.zipcode, values.city)
                .then(isValid => {
                    if (isValid) {
                        localStorage.setItem('homeAddress', JSON.stringify(updatedValues));
                        console.log("Current homeAddress:", updatedValues);
                        onNext();
                    } else {
                        message.error(`The ZIP code ${values.zipcode} does not match the city ${values.city}.`);
                    }
                })
                .catch(() => {
                    message.error('Failed to verify ZIP code and city.');
                });
        }).catch((errorInfo) => {
            console.log('Validation Failed:', errorInfo);
        });
    };

    const handleValuesChange = () => {
        const values = form.getFieldsValue();
        const updatedValues = {
            postalCode: values.zipcode,
            streetAddress: values.address,
            city: values.city,
            country: values.country
        };
        localStorage.setItem('homeAddress', JSON.stringify(updatedValues));
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    };

    const verifyZipAndCity = (zipcode, city) => {
        return axios.get(`https://api.zippopotam.us/hu/${zipcode}`)
            .then(response => {
                if (response.data.places && response.data.places.length > 0) {
                    const apiCity = response.data.places[0]['place name'];
                    return apiCity.toLowerCase() === city.toLowerCase();
                } else {
                    return false;
                }
            })
            .catch(error => {
                console.error('Error verifying ZIP code and city:', error);
                return false;
            });
    };

    const handleClear = () => {
        form.resetFields();
        localStorage.removeItem('homeAddress');
        updatePercent(0);
    };

    return (
        <Card>
            <Form form={form} layout="vertical" autoComplete="off" onValuesChange={handleValuesChange}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="zipcode"
                            label={<Typography style={{ fontWeight: "bold" }}>Zipcode</Typography>}
                            rules={[{ required: true, message: 'Please fill Zipcode' }]}>
                            <Input placeholder="Zipcode" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="city"
                            label={<Typography style={{ fontWeight: "bold" }}>City</Typography>}
                            rules={[{ required: true, message: 'Please fill City' }]}>
                            <Input placeholder="City" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="address"
                            label={<Typography style={{ fontWeight: "bold" }}>Address</Typography>} rules={[{ required: true, message: 'Please fill Address' }]}>
                            <Input placeholder="Address" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="country"
                            label={<Typography style={{ fontWeight: "bold" }}>Country</Typography>} rules={[{ required: true, message: 'Please fill Country' }]}>
                            <Input placeholder="Country" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
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

export default HomeAddress;

