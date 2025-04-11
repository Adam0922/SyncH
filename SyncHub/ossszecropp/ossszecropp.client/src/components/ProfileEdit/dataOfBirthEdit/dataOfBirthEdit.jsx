import { Card, Form, Input, Typography, Row, Col, Button, Tooltip, message } from "antd";
import { RollbackOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import axiosInstance from '../../../utils/axiosInstance';

const DataOfBirthEdit = ({ onNext, onBack, updatePercent, totalFields }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployeeBirthData();
    }, []);

    const fetchEmployeeBirthData = async () => {
        try {
            setLoading(true);

            // Use the /api/Employees/current endpoint which gets the current user from the JWT token
            const response = await axiosInstance.get('/api/Employees/current');

            if (response.data) {
                const employee = response.data;
                console.log("Fetched employee birth data:", employee);

                // Set form values based on the fetched data
                const formValues = {
                    firstName: employee.firstName,
                    middleName: employee.middleName,
                    lastName: employee.lastName,
                    birthplace: employee.placeOfBirth,
                    birthdate: employee.dateOfBirth ? employee.dateOfBirth.substring(0, 10) : null
                };

                console.log("Setting birth form values:", formValues);
                form.setFieldsValue(formValues);
                handleValuesChange();
            }
        } catch (error) {
            console.error("Error fetching employee birth data:", error);

            // More detailed error logging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }

            message.error("Failed to load birth data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                // Save the updated birth data
                saveBirthData(values);
            })
            .catch(info => {
                console.log('Validation Failed:', info);
            });
    };

    const saveBirthData = async (values) => {
        try {
            setLoading(true);

            // Prepare the birth data to be sent to the server
            const updatedData = {
                firstName: values.firstName,
                lastName: values.lastName,
                middleName: values.middleName,
                placeOfBirth: values.birthplace,
                dateOfBirth: values.birthdate
            };

            console.log("Sending updated birth data:", updatedData);

            // Send the update request to the server
            const response = await axiosInstance.put('/api/Employees/update-birth-data', updatedData);

            if (response.status === 200) {
                message.success("Birth data updated successfully");
                onNext(); // Proceed to the next step
            } else {
                throw new Error("Unexpected response status: " + response.status);
            }
        } catch (error) {
            console.error("Error updating birth data:", error);

            // More detailed error logging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }

            message.error("Failed to update birth data. Please try again later.");
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
                    <Col span={8}>
                        <Form.Item name="firstName" label={<Typography style={{ fontWeight: "bold" }}>First Name</Typography>} rules={[{ required: true, message: 'Please fill First Name' }]}>
                            <Input type="text" placeholder="First Name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="middleName" label={<Typography style={{ fontWeight: "bold" }}>Middle Name</Typography>}>
                            <Input type="text" placeholder="Middle Name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="lastName" label={<Typography style={{ fontWeight: "bold" }}>Last Name</Typography>} rules={[{ required: true, message: 'Please fill Last Name' }]}>
                            <Input type="text" placeholder="Last Name" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="birthplace" label={<Typography style={{ fontWeight: "bold" }}>Birthplace</Typography>} rules={[{ required: true, message: 'Please fill Birthplace' }]}>
                            <Input type="text" placeholder="Birthplace" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="birthdate" label={<Typography style={{ fontWeight: "bold" }}>Birthdate</Typography>} rules={[{ required: true, message: 'Please fill Birthdate' }]}>
                            <Input type="date" />
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

export default DataOfBirthEdit;
