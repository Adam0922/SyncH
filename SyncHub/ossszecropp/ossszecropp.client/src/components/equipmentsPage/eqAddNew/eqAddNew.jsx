import { Button, Col, Flex, Form, Input, Modal, Row, Select, Typography, message, ConfigProvider } from "antd";
import { DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import TextArea from "antd/es/input/TextArea";
import axiosInstance from '../../../utils/axiosInstance';
import { useTheme } from "../../../theme/themeContext";

const EqAddNew = ({ visible, onClose, onAddEquipment }) => {
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const [status, setStatus] = useState('Issued');
    const [category, setCategory] = useState('Laptop');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch current user data when component mounts
        const fetchCurrentUser = async () => {
            try {
                const response = await axiosInstance.get('/api/Employees/current');
                setCurrentUser(response.data);

                // Set the employee field with the current user's email
                form.setFieldsValue({
                    employee: response.data.email || ''
                });
            } catch (error) {
                console.error('Error fetching current user:', error);
                message.error('Failed to load user data');
            }
        };

        if (visible) {
            fetchCurrentUser();
            form.resetFields();
            form.setFieldsValue({
                status: 'Issued',
                category: 'Laptop'
            });
        }
    }, [visible, form]);

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    const handleAdd = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            // Format dates for API
            const formattedValues = {
                SerialNumber: values.serialNumber,
                EquipmentName: values.name,
                Employee: currentUser ? currentUser.email : values.employee,
                Status: values.status || 'Issued',
                Category: values.category || 'Laptop',
                PurchaseDate: values.purchase_date ? values.purchase_date.format('YYYY-MM-DD') : null,
                WarrantyExpiration: values.warranty_expiration ? values.warranty_expiration.format('YYYY-MM-DD') : null,
                LastServiceDate: values.last_service_date ? values.last_service_date.format('YYYY-MM-DD') : null,
                Remarks: values.remarks || "",
            };

            console.log('Sending data to API:', formattedValues);

            // Send data to API
            const response = await axiosInstance.post('/api/Equipment', formattedValues);
            console.log('API response:', response.data);

            message.success('Equipment added successfully');

            if (onAddEquipment) {
                onAddEquipment(response.data);
            }

            form.resetFields();
            onClose();
        } catch (error) {
            console.error('Error adding equipment:', error);
            console.error('Error details:', error.response?.data);
            if (error.response?.data?.errors) {
                console.error('Validation errors:', error.response.data.errors);
            }

            message.error('Failed to add equipment: ' + (error.response?.data?.title || error.message));
        } finally {
            setLoading(false);
        }
    };

    const footerButtons = (
        <Flex gap='small' justify="right">
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd} loading={loading} style={{ boxShadow: "none" }}>
                Add
            </Button>
            <Button key="cancel" onClick={handleCancel}>
                Cancel
            </Button>
        </Flex>
    );

    const modalTitle = (
        <Typography.Title level={2}>Add New Equipment</Typography.Title>
    );

    const handleStatusChange = (value) => {
        setStatus(value);
        form.setFieldsValue({ status: value });
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        form.setFieldsValue({ category: value });
    };

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? '#292A2A' : '#FFFFFF', colorText: isDarkMode ? '#FFFFFF' : '#000000', colorIcon: isDarkMode ? "white" : "black", }, }}>
        <Modal title={modalTitle} open={visible} onCancel={handleCancel} footer={footerButtons}>
            <Form form={form} layout="vertical">
                <Flex vertical align="start" style={{ marginTop: '4vh' }} gap='0.1vh'>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={12}>
                            <Form.Item label="Serial-Number" name="serialNumber" rules={[{ required: true, message: 'Please input serial number!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Equipment Name" name="name" rules={[{ required: true, message: 'Please input equipment name!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={12}>
                            <Form.Item label="Employee" name="employee">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Status" name="status" initialValue="Issued">
                                <Select
                                    value={status}
                                    options={[
                                        { value: 'Under Maintenance', label: 'Under Maintenance' },
                                        { value: 'Worn Out', label: 'Worn Out' },
                                        { value: 'Issued', label: 'Issued' },
                                    ]}
                                    onChange={handleStatusChange}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={12}>
                            <Form.Item label="Category" name="category" initialValue="Laptop">
                                <Select
                                    value={category}
                                    options={[
                                        { value: 'Phone', label: 'Phone' },
                                        { value: 'Car', label: 'Car' },
                                        { value: 'Laptop', label: 'Laptop' },
                                    ]}
                                    onChange={handleCategoryChange}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Purchase Date" name="purchase_date" rules={[{ required: true, message: 'Please select purchase date!' }]}>
                                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={12}>
                            <Form.Item label="Warranty Expiration" name="warranty_expiration">
                                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Last service" name="last_service_date">
                                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={24}>
                            <Form.Item label="Remarks" name="remarks">
                                <TextArea maxLength={1000} style={{ resize: 'none' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Flex>
            </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default EqAddNew;
