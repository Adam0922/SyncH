import { Button, Col, Flex, Form, Input, Modal, Row, Select, Space, Typography, message, ConfigProvider } from "antd";
import { DatePicker } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import moment from 'moment';
import axiosInstance from '../../../utils/axiosInstance';
import { useTheme } from "../../../theme/themeContext";
const { TextArea } = Input;

const EqDetails = ({ visible, equipment, onClose, onUpdateEquipment }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { isDarkMode } = useTheme();
    const [form] = Form.useForm();
    const [status, setStatus] = useState(equipment?.status);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (equipment) {
            console.log("Setting form values with equipment:", equipment);
            form.setFieldsValue({
                serialNumber: equipment.serialNumber,
                name: equipment.name,
                employee: equipment.employee,
                status: equipment.status,
                category: equipment.category,
                warranty_expiration: equipment.warrantyExpiration ? moment(equipment.warrantyExpiration) : null,
                last_service_date: equipment.lastServiceDate ? moment(equipment.lastServiceDate) : null,
                purchase_date: equipment.purchaseDate ? moment(equipment.purchaseDate) : null,
                remarks: equipment.remarks,
            });
            setStatus(equipment.status);
        }
    }, [equipment, form]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'under maintenance':
                return '#faad14';
            case 'worn out':
                return '#f5222d';
            case 'issued':
                return '#52c41a';
            default:
                return '#faad14';
        }
    };

    // Modified modal title to hide status dropdown when in editing mode
    const modalTitle = (
        <Flex justify="space-between" align="center" style={{ width: '90%' }}>
            <Typography.Title level={2} style={{ margin: 0 }}>{equipment?.name}</Typography.Title>
            {!isEditing && (
                <Space>
                    <Select
                        value={status}
                        options={[
                            { value: 'Under Maintenance', label: 'Under Maintenance' },
                            { value: 'Worn Out', label: 'Worn Out' },
                            { value: 'Issued', label: 'Issued' },
                        ]}
                        onChange={(value) => {
                            setStatus(value);
                            handleStatusUpdate(value);
                        }}
                        style={{ width: 150 }}
                    />
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(status), marginRight: '8px' }}></span>
                </Space>
            )}
        </Flex>
    );

    const handleStatusUpdate = async (newStatus) => {
        if (!equipment) return;

        try {
            setLoading(true);

            const updatedEquipment = {
                SerialNumber: equipment.serialNumber,
                EquipmentName: equipment.name,
                Employee: equipment.employee,
                Status: newStatus,
                Category: equipment.category,
                PurchaseDate: equipment.purchaseDate,
                WarrantyExpiration: equipment.warrantyExpiration,
                LastServiceDate: equipment.lastServiceDate,
                Remarks: equipment.remarks
            };

            await axiosInstance.put(`/api/Equipment/serial/${equipment.serialNumber}`, updatedEquipment);

            message.success('Status updated successfully');

            if (onUpdateEquipment) {
                onUpdateEquipment({ ...equipment, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Failed to update status');
            setStatus(equipment.status);
        } finally {
            setLoading(false);
        }
    };

    const handleModify = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            console.log("Form values:", values);

            if (!equipment || !equipment.serialNumber) {
                message.error('Cannot update: Missing serial number');
                return;
            }

            const updatedEquipment = {
                SerialNumber: equipment.serialNumber,
                EquipmentName: values.name,
                Employee: values.employee,
                Status: values.status || status,
                Category: values.category || equipment.category,
                PurchaseDate: values.purchase_date ? values.purchase_date.format('YYYY-MM-DD') : null,
                WarrantyExpiration: values.warranty_expiration ? values.warranty_expiration.format('YYYY-MM-DD') : null,
                LastServiceDate: values.last_service_date ? values.last_service_date.format('YYYY-MM-DD') : null,
                Remarks: values.remarks
            };

            console.log("Sending update with data:", updatedEquipment);

            await axiosInstance.put(`/api/Equipment/serial/${equipment.serialNumber}`, updatedEquipment);

            message.success('Equipment updated successfully');

            const updatedEquipmentForState = {
                ...equipment,
                name: values.name,
                employee: values.employee,
                status: values.status || status,
                category: values.category,
                purchaseDate: values.purchase_date ? values.purchase_date.format('YYYY-MM-DD') : null,
                warrantyExpiration: values.warranty_expiration ? values.warranty_expiration.format('YYYY-MM-DD') : null,
                lastServiceDate: values.last_service_date ? values.last_service_date.format('YYYY-MM-DD') : null,
                remarks: values.remarks
            };

            if (onUpdateEquipment) {
                onUpdateEquipment(updatedEquipmentForState);
            }

            // Update the status state to match the new value
            setStatus(values.status || status);

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating equipment:', error);
            console.error('Error details:', error.response?.data);
            message.error('Failed to update equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        onClose();
    };

    const footerButtons = (
        isEditing ? (
            <Flex justify="right" gap="middle">
                <Button
                    key="save"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={loading}
                    style={{ boxShadow: "none" }}
                >
                    Save
                </Button>
                <Button
                    style={{ boxShadow: "none" }}
                    key="cancel"
                    onClick={() => {
                        setIsEditing(false);
                        form.setFieldsValue(equipment);
                    }}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </Flex>
        ) : (
            <Button
                key="modify"
                type="primary"
                icon={<EditOutlined />}
                onClick={handleModify}
                    disabled={loading}
                    style={{ boxShadow: "none" }}
            >
                Modify
            </Button>
        )
    );

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? '#292A2A' : '#FFFFFF', colorText: isDarkMode ? '#FFFFFF' : '#000000', colorIcon: isDarkMode ? "white" : "black", }, }}>
        <Modal title={modalTitle} open={visible} onCancel={handleCancel} footer={footerButtons}>
            <Form form={form} layout="vertical">
                <Flex vertical align="start" style={{ marginTop: '4vh' }} gap='middle'>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={12}>
                            <Form.Item label="Serial-Number" name="serialNumber">
                                <Input disabled={true} /> {/* Always disabled as it's the identifier */}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Employee" name="employee">
                                <Input disabled={!isEditing} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={12}>
                            <Form.Item label="Name" name="name">
                                <Input disabled={!isEditing} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={12}>
                            <Form.Item label="Category" name="category">
                                {isEditing ? (
                                    <Select
                                        options={[
                                            { value: 'Phone', label: 'Phone' },
                                            { value: 'Car', label: 'Car' },
                                            { value: 'Laptop', label: 'Laptop' },
                                        ]}
                                        style={{ width: "100%" }}
                                    />
                                ) : (
                                    <Input disabled />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Purchase Date" name="purchase_date">
                                {isEditing ? (
                                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                                ) : (
                                    <Typography.Text>{equipment?.purchaseDate}</Typography.Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={12}>
                            <Form.Item label="Warranty Expiration" name="warranty_expiration">
                                {isEditing ? (
                                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                                ) : (
                                    <Typography.Text>{equipment?.warrantyExpiration}</Typography.Text>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Last service" name="last_service_date">
                                {isEditing ? (
                                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                                ) : (
                                    <Typography.Text>{equipment?.lastServiceDate}</Typography.Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24, 24]} style={{ width: '100%' }}>
                        <Col span={24}>
                            <Form.Item label="Remarks" name="remarks">
                                {isEditing ? (
                                    <TextArea maxLength={100} style={{ resize: 'none' }} />
                                ) : (
                                    <Typography.Text>{equipment?.remarks}</Typography.Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Flex>
            </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default EqDetails;
