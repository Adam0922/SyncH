import React, { useState, useEffect } from 'react';
import {
    EditOutlined,
    SaveOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    ToolOutlined,
    SettingOutlined,
    CodeOutlined,
    DatabaseOutlined,
    CloudOutlined,
    LaptopOutlined,
    MobileOutlined,
    GlobalOutlined,
    ShoppingOutlined,
    TeamOutlined,
    FileSearchOutlined,
    BarChartOutlined,
    MailOutlined,
    SecurityScanOutlined
} from '@ant-design/icons';
import { Button, Col, Collapse, Flex, Modal, Row, Typography, Input, Form, ConfigProvider, message, Popconfirm, Dropdown, Menu } from "antd";
import { useTheme } from '../../../theme/themeContext.jsx';
import axios from 'axios';
import IconSelector from "../NewFolder/iconSelector";

const { TextArea } = Input;

const ServiceDatas = ({ selectedService, visible, onClose, onServiceDeleted }) => {
    const { isDarkMode } = useTheme();
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFiatType, setSelectedFiatType] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('app'); // Default icon

    useEffect(() => {
        if (selectedService) {
            form.setFieldsValue({
                serviceName: selectedService.serviceName,
                servicePrice: selectedService.servicePrice,
                serviceDescription: selectedService.serviceDescription,
                serviceIcon: selectedService.serviceIcon || 'app', // Default to 'app' if not set
            });
            setSelectedFiatType(selectedService.serviceFiatType);
            setSelectedIcon(selectedService.serviceIcon || 'app');
        }
    }, [selectedService, form]);

    const fiatTypes = [
        { label: 'USD', value: 'USD' },
        { label: 'HUF', value: 'HUF' },
        { label: 'EUR', value: 'EUR' },
    ];

    const handleFiatTypeMenuClick = (fiatType) => {
        setSelectedFiatType(fiatType.label);
    };

    const handleModify = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        onClose();
    };

    // Function to get the icon component based on the icon name
    const getIconComponent = (iconName) => {
        switch (iconName) {
            case 'app': return <AppstoreOutlined />;
            case 'tool': return <ToolOutlined />;
            case 'setting': return <SettingOutlined />;
            case 'code': return <CodeOutlined />;
            case 'database': return <DatabaseOutlined />;
            case 'cloud': return <CloudOutlined />;
            case 'laptop': return <LaptopOutlined />;
            case 'mobile': return <MobileOutlined />;
            case 'global': return <GlobalOutlined />;
            case 'shopping': return <ShoppingOutlined />;
            case 'team': return <TeamOutlined />;
            case 'fileSearch': return <FileSearchOutlined />;
            case 'barChart': return <BarChartOutlined />;
            case 'mail': return <MailOutlined />;
            case 'security': return <SecurityScanOutlined />;
            default: return <AppstoreOutlined />;
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Create FormData for submission
            const formData = new FormData();
            formData.append('serviceName', values.serviceName);
            formData.append('servicePrice', values.servicePrice);
            formData.append('serviceFiatType', selectedFiatType);
            formData.append('serviceDescription', values.serviceDescription);
            formData.append('serviceIcon', selectedIcon); // Add the selected icon

            // Send the data to the server
            const response = await axios.put(`/api/Services/${selectedService.serviceID}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success('Service updated successfully!');
            setIsEditing(false);
            onClose();
            if (onServiceDeleted) {
                onServiceDeleted(); // Refresh the services list
            }
        } catch (error) {
            console.error("Error updating service:", error);
            message.error('Failed to update service. Please try again.');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/Services/${selectedService.serviceID}`);
            message.success('Service deleted successfully!');
            onClose();
            if (onServiceDeleted) {
                onServiceDeleted(); // Refresh the services list
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            message.error('Failed to delete service. Please try again.');
        }
    };

    // Create additional items for the Collapse component when in editing mode
    const getCollapseItems = () => {
        const baseItems = [
            {
                key: 1,
                label: (
                    <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>
                        Description
                    </Typography.Text>
                ),
                children: (
                    <Flex justify="space-around">
                        <Row gutter={16} justify="start" style={{ width: '100%' }}>
                            <Col span={24} style={{ textAlign: 'left' }}>
                                <Form.Item name="serviceDescription">
                                    {isEditing ? (
                                        <TextArea maxLength={1000} style={{ resize: 'none' }} />
                                    ) : (
                                        <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>
                                            {selectedService?.serviceDescription || "No description available"}
                                        </Typography.Text>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Flex>
                ),
                style: {
                    color: isDarkMode ? "white" : "black",
                }
            }
        ];

        // Add additional items when in editing mode
        if (isEditing) {
            baseItems.unshift({
                key: 0,
                label: (
                    <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>
                        Service Details
                    </Typography.Text>
                ),
                children: (
                    <Flex vertical gap="middle">
                        <Form.Item name="serviceName" label="Service Name">
                            <Input />
                        </Form.Item>
                        <Flex gap="small">
                            <Form.Item name="servicePrice" label="Price" style={{ flex: 1 }}>
                                <Input
                                    type="number"
                                    step="0.01"
                                    suffix={
                                        <Dropdown overlay={
                                            <Menu>
                                                {fiatTypes.map(fiatType => (
                                                    <Menu.Item key={fiatType.value} onClick={() => handleFiatTypeMenuClick(fiatType)}>
                                                        {fiatType.label}
                                                    </Menu.Item>
                                                ))}
                                            </Menu>
                                        }>
                                            <Input
                                                placeholder="Fiat Type"
                                                readOnly
                                                value={selectedFiatType}
                                                style={{ width: "5vh", justifyItems: "center", border: "none" }}
                                            />
                                        </Dropdown>
                                    }
                                />
                            </Form.Item>
                        </Flex>
                        <Form.Item name="serviceIcon" label="Service Icon">
                            <IconSelector
                                selectedIcon={selectedIcon}
                                onSelectIcon={(icon) => {
                                    setSelectedIcon(icon);
                                    form.setFieldsValue({ serviceIcon: icon });
                                }}
                            />
                        </Form.Item>
                    </Flex>
                ),
                style: {
                    color: isDarkMode ? "white" : "black",
                }
            });
        }

        return baseItems;
    };

    const modalFooter = [
        [
            <Flex justify='space-between' key={1} style={{ width: '100%' }}>
                <Popconfirm
                    title="Delete Service"
                    description="Are you sure you want to delete this service? This action cannot be undone."
                    onConfirm={handleDelete}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        icon={<DeleteOutlined style={{ color: 'white' }} />}
                        danger
                        style={{ boxShadow: "none" }}
                    />
                </Popconfirm>
                <Flex justify='space-between' gap='middle'>
                    <Button
                        icon={<SaveOutlined style={{ marginBottom: "-2.5vh" }} />}
                        type="primary"
                        style={{ display: !isEditing ? 'none' : 'block', boxShadow: "none" }}
                        onClick={handleSave}
                    />
                    <Button
                        icon={<EditOutlined style={{ color: isDarkMode ? "white" : "black", marginBottom: "-2.5vh" }} />}
                        onClick={handleModify}
                        style={{ display: isEditing ? 'none' : 'block', borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}
                    />
                </Flex>
            </Flex>
        ]
    ];

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? '#292A2A' : '#FFFFFF' } }}>
            <Modal open={visible} onCancel={handleCancel} footer={modalFooter}>
                {selectedService && (
                    <Form form={form} layout="vertical">
                        <Flex vertical gap='middle' style={{ margin: '2.5vh' }}>
                            {!isEditing && (
                                <Row justify="center" style={{ alignSelf: 'center', position: 'relative' }}>
                                    <Col span={24}>
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '200px',
                                            backgroundColor: isDarkMode ? '#1f1f1f' : '#f0f2f5',
                                            borderRadius: '1vh',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ fontSize: '64px', marginBottom: '16px', color: isDarkMode ? 'white' : 'black' }}>
                                                {getIconComponent(selectedService?.serviceIcon || 'app')}
                                            </div>
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                width: '100%',
                                                color: 'white',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                borderRadius: "1vh",
                                                padding: '5px',
                                                textAlign: 'center'
                                            }}>
                                                <Typography.Title level={2} style={{ margin: 0, color: "white" }}>
                                                    {selectedService.serviceName}
                                                </Typography.Title>
                                            </div>
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                color: 'white',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                padding: '0.7vh',
                                                borderRadius: '5px'
                                            }}>
                                                <Typography.Text style={{ fontSize: '15px', color: "white" }}>
                                                    {selectedService.servicePrice} {selectedService.serviceFiatType}
                                                </Typography.Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            <Row>
                                <Col style={{ width: "100%" }}>
                                    <Collapse
                                        defaultActiveKey={isEditing ? [0, 1] : [1]}
                                        items={getCollapseItems()}
                                        style={{
                                            color: isDarkMode ? "white" : "black",
                                            borderColor: isDarkMode ? "#515151" : "#EEEEEE"
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Flex>
                    </Form>
                )}
            </Modal>
        </ConfigProvider>
    );
};

export default ServiceDatas;
