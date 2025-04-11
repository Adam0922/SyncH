import { Card, Form, Input, Typography, Row, Col, Button, Tooltip, message } from "antd";
import SuccessProfileEdit from "../../successPopUp/successEP.jsx";
import { RollbackOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import axiosInstance from '../../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const PersonalDataEdit = ({ onBack, updatePercent, totalFields, onClose }) => {
    const navigate = useNavigate();
    const [isSEPModalVisible, setIsSEPModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    const fetchEmployeeData = async () => {
        try {
            setLoading(true);
            // Fetch employee data from the API using the configured axiosInstance
            const response = await axiosInstance.get('/api/Employees/current');

            if (response.data) {
                const employee = response.data;
                console.log("Fetched employee data:", employee);

                // Set form values based on the fetched data
                const formValues = {
                    email: employee.email,
                    bankAddress: employee.bankAccountNumber,
                    job: employee.jobTitle,
                    phoneNumber: employee.phoneNumber,
                    idCardNumber: employee.idCardNum,
                    taxNumber: employee.taxNum,
                    societyInsuranceCardNumber: employee.socialSecNum
                };

                console.log("Setting form values:", formValues);
                form.setFieldsValue(formValues);
                handleValuesChange();
            }
        } catch (error) {
            console.error("Error fetching employee data:", error);

            // More detailed error logging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }

            message.error("Failed to load employee data");
        } finally {
            setLoading(false);
        }
    };

    const handleValuesChange = () => {
        const values = form.getFieldsValue();
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    };

    const showSEPModal = () => {
        form.validateFields()
            .then(values => {
                // Save the updated data
                saveEmployeeData(values);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const saveEmployeeData = async (values) => {
        try {
            setLoading(true);

            // Prepare the data to be sent to the server
            const updatedData = {
                email: values.email,
                phoneNumber: values.phoneNumber,
                bankAccountNumber: values.bankAddress,
                taxNum: values.taxNumber,
                socialSecNum: values.societyInsuranceCardNumber
            };

            console.log("Sending updated data:", updatedData);

            // Send the update request to the server
            const response = await axiosInstance.put('/api/Employees/update-personal-data', updatedData);

            if (response.status === 200) {
                console.log("Update successful:", response.data);
                setIsSEPModalVisible(true);
            } else {
                throw new Error("Unexpected response status: " + response.status);
            }
        } catch (error) {
            console.error("Error updating employee data:", error);

            // More detailed error logging
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }

            message.error("Failed to update employee data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        setIsSEPModalVisible(false);
        if (typeof onClose === 'function') {
            onClose();
        } else {
            // Fallback navigation if onClose is not provided
            navigate('/profile');
        }
    };

    return (
        <Card loading={loading}>
            <Form form={form} layout="vertical" autoComplete="off" onValuesChange={handleValuesChange}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="email" label={<Typography style={{ fontWeight: "bold" }}>Email</Typography>} rules={[{ required: true, message: 'Please fill your Email', type: 'email' }]}>
                            <Input type="email" placeholder="Email" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="bankAddress" label={<Typography style={{ fontWeight: "bold" }}>Bank Account Number</Typography>}>
                            <Input placeholder="Bank Account Number" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="job" label={<Typography style={{ fontWeight: "bold" }}>Job</Typography>}>
                            <Input placeholder="Job" disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="phoneNumber" label={<Typography style={{ fontWeight: "bold" }}>Phone Number</Typography>} rules={[{ required: true, message: 'Please fill your Phone Number' }]}>
                            <Input type="tel" placeholder="Phone Number" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="idCardNumber" label={<Typography style={{ fontWeight: "bold" }}>ID Card Number</Typography>}>
                            <Input placeholder="ID Card Number" disabled />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="taxNumber" label={<Typography style={{ fontWeight: "bold" }}>Tax Number</Typography>}>
                            <Input placeholder="Tax Number" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="societyInsuranceCardNumber" label={<Typography style={{ fontWeight: "bold" }}>Society Insurance Card Number</Typography>}>
                            <Input placeholder="Society Insurance Card Number" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <div style={{ position: 'relative', height: '40px' }}>
                            <Button type="primary" onClick={showSEPModal}>
                                Save Modified Data
                            </Button>
                            <Tooltip title="Click to go back">
                                <Button icon={<RollbackOutlined />} style={{ position: 'absolute', right: 0, border: 'none', boxShadow: '0 0 0 rgba(255,255,255,255.0)' }} onClick={onBack} />
                            </Tooltip>
                        </div>
                    </Col>
                </Row>
            </Form>
            <SuccessProfileEdit visible={isSEPModalVisible} onClose={() => setIsSEPModalVisible(false)} onSave={handleSave} />
        </Card>
    );
};

export default PersonalDataEdit;
