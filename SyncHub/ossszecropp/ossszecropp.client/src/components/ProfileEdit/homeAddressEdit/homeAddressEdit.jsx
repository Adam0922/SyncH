import { Card, Form, Input, Typography, Row, Col, Button, Tooltip, message } from "antd";
import { RollbackOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import axiosInstance from '../../../utils/axiosInstance'; // Use the configured axiosInstance

const HomeAddressEdit = ({ onNext, onBack, updatePercent, totalFields }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployeeAddressData();
    }, []);

    const fetchEmployeeAddressData = async () => {
        try {
            setLoading(true);

            // Use the /api/Employees/current endpoint which gets the current user from the JWT token
            const response = await axiosInstance.get('/api/Employees/current');

            if (response.data) {
                const employee = response.data;
                console.log("Fetched employee address data:", employee);

                // Set form values based on the fetched data
                const formValues = {
                    zipcode: employee.postalCode,
                    city: employee.city,
                    address: employee.streetAddress,
                    country: employee.country
                };

                console.log("Setting address form values:", formValues);
                form.setFieldsValue(formValues);
                handleValuesChange();
            }
        } catch (error) {
            console.error("Error fetching employee address data:", error);

            // More detailed error logging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }

            message.error("Failed to load address data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                // Save the updated address data
                saveAddressData(values);
            })
            .catch(info => {
                console.log('Validation Failed:', info);
            });
    };

    const saveAddressData = async (values) => {
        try {
            setLoading(true);

            // Prepare the address data to be sent to the server
            const updatedData = {
                postalCode: values.zipcode,
                city: values.city,
                streetAddress: values.address,
                country: values.country
            };

            console.log("Sending updated address data:", updatedData);

            // Send the update request to the server
            const response = await axiosInstance.put('/api/Employees/update-address', updatedData);

            if (response.status === 200) {
                message.success("Address updated successfully");
                onNext(); // Proceed to the next step
            } else {
                throw new Error("Unexpected response status: " + response.status);
            }
        } catch (error) {
            console.error("Error updating address data:", error);

            // More detailed error logging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }

            message.error("Failed to update address data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleValuesChange = () => {
        const values = form.getFieldsValue();
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    };

    return (
        <Card loading={loading}>
            <Form form={form} layout="vertical" autoComplete="off" onValuesChange={handleValuesChange}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="zipcode" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Zipcode
                            </Typography>
                        } rules={[{ required: true, message: 'Please fill Zipcode' }]}>
                            <Input placeholder="Zipcode" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="city" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                City
                            </Typography>
                        } rules={[{ required: true, message: 'Please fill City' }]}>
                            <Input placeholder="City" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="address" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Address
                            </Typography>
                        } rules={[{ required: true, message: 'Please fill Address' }]}>
                            <Input placeholder="Address" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="country" label={
                            <Typography style={{ fontWeight: "bold" }}>
                                Country
                            </Typography>
                        } rules={[{ required: true, message: 'Please fill Country' }]}>
                            <Input placeholder="Country" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <div style={{ position: 'relative', height: '40px' }}>
                            <Button type="primary" onClick={handleSubmit} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                                Save and Continue
                            </Button>
                            <Tooltip title="Click to go back">
                                <Button icon={<RollbackOutlined />} style={{ position: 'absolute', right: 0, border: 'none', boxShadow: '0 0 0 rgba(255,255,255,255.0)' }} onClick={onBack} />
                            </Tooltip>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default HomeAddressEdit;
