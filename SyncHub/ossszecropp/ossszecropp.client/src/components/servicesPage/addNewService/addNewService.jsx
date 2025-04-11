import React, { useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { useTheme } from "../../../theme/themeContext.jsx";
import { Card, Col, Input, Progress, Row, Typography, Form, Flex, Button, message, Dropdown, Menu, Modal, ConfigProvider } from "antd";
import axios from 'axios';
import IconSelector from "../NewFolder/iconSelector";

const AddNewService = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const [progress, setProgress] = useState(0);
    const [selectedFiatType, setSelectedFiatType] = useState('USD');
    const [selectedIcon, setSelectedIcon] = useState('app'); // Default icon
    const totalFields = 4;

    const handleFieldChange = () => {
        const formValues = form.getFieldsValue();
        const filledFields = Object.values(formValues).filter(value => value).length;
        const newProgress = Math.round((filledFields / totalFields) * 100);
        setProgress(newProgress);
    };

    const fiatTypes = [
        {
            label: 'USD',
            value: 'USD'
        },
        {
            label: 'HUF',
            value: 'HUF'
        },
        {
            label: 'EUR',
            value: 'EUR'
        },
    ];

    const handleFiatTypeMenuClick = (fiatType) => {
        form.setFieldsValue({ fiatType: fiatType.label });
        setSelectedFiatType(fiatType.label);
    };

    const validateServicePriceLength = (_, value) => {
        if (value && value.length > 10) {
            return Promise.reject(new Error('Service Price cannot exceed 10 characters'));
        }
        return Promise.resolve();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Create FormData for submission
            const formData = new FormData();
            formData.append('serviceName', values.serviceName);
            formData.append('servicePrice', values.servicePrice);
            formData.append('serviceFiatType', selectedFiatType);
            formData.append('serviceDescription', values.Description);
            formData.append('serviceIcon', selectedIcon); // Add the selected icon

            // Send the data to the server
            const response = await axios.post('/api/Services', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Service created:", response.data);
            message.success('Service created successfully!');
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error creating service:", error);
            message.error('Failed to create service. Please try again.');
        }
    };

    const modalFooter = (
        <Flex justify="center" style={{ marginTop: '2vh', marginBottom: '1vh' }}>
            <Button type="primary" onClick={handleSave} style={{ padding: '2vh 4vh', boxShadow: "none" }}>
                Create New Service
            </Button>
        </Flex>
    );

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? "#292A2A" : "white", colorText: isDarkMode ? "white" : "black", colorBorder: isDarkMode ? "#515151" : "white" } }}>
            <Modal open={visible} footer={modalFooter} onCancel={onClose} centered>
                <Typography.Title level={2}>
                    Add New Service
                </Typography.Title>
                <Row justify="center" gutter={16} style={{ marginTop: '4vh' }}>
                    <Col span={12}>
                        <Progress percent={progress} percentPosition={{ align: 'center', type: 'inner' }} size={['100%', 20]} style={{}} />
                    </Col>
                </Row>
                <Flex vertical>
                    <Card style={{ marginTop: '3vh' }}>
                        <Form form={form} layout="vertical" autoComplete="off" onValuesChange={handleFieldChange}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="serviceName" label={<Typography style={{ fontWeight: 'bold' }}>Service Name</Typography>} rules={[{ required: true, message: 'Please fill Service Name' }]}>
                                        <Input placeholder="Service Name" type="text" style={{ height: '4vh' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name='servicePrice' label={<Typography style={{ fontWeight: 'bold' }}>Service Price</Typography>} required rules={[{ required: true, message: 'Please fill Service Price' }, { validator: validateServicePriceLength }]}>
                                        <Input placeholder="Service Price" type="number" step={0.01} maxLength={10} suffix={
                                            <Dropdown overlay={
                                                <Menu>
                                                    {fiatTypes.map(fiatType => (
                                                        <Menu.Item key={fiatType.value} onClick={() => handleFiatTypeMenuClick(fiatType)}>
                                                            {fiatType.label}
                                                        </Menu.Item>
                                                    ))}
                                                </Menu>
                                            }>
                                                <Input placeholder="Fiat Type" readOnly value={selectedFiatType || form.getFieldValue('fiatType')} style={{ width: "5vh", justifyItems: "center", border: "none" }} />
                                            </Dropdown>
                                        } />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item name='Description' label={<Typography style={{ fontWeight: 'bold', color: isDarkMode ? "white" : "black" }}>Description</Typography>} required rules={[{ required: true, message: 'Please fill Description' }]}>
                                        <TextArea placeholder="Description" style={{ height: 120, resize: 'none' }} maxLength={100} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24} style={{ marginBottom: '-1.8vh' }}>
                                    <Form.Item name="serviceIcon" required rules={[{ required: true, message: 'Please select an icon' }]}>
                                        <IconSelector
                                            selectedIcon={selectedIcon}
                                            onSelectIcon={(icon) => {
                                                setSelectedIcon(icon);
                                                form.setFieldsValue({ serviceIcon: icon });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Flex>
            </Modal>
        </ConfigProvider>
    );
};
export default AddNewService;
