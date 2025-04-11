import React, { useState, useEffect } from 'react';
import { useTheme } from "../../../theme/themeContext";
import { Avatar, Button, Col, ConfigProvider, Flex, Form, Input, Modal, Row, Typography, message } from 'antd';
import { EditOutlined, UserOutlined, SaveOutlined } from '@ant-design/icons';
import moment from 'moment';

const EmpDetails = ({ visible, onClose, onSave, employee }) => {
    const { isDarkMode } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // Set form values when employee data changes
    useEffect(() => {
        if (employee && form) {
            form.setFieldsValue({
                firstName: employee.firstName,
                lastName: employee.lastName,
                middleName: employee.middleName,
                email: employee.email,
                phoneNumber: employee.phoneNumber,
                taxNum: employee.taxNum,
                socialSecNum: employee.socialSecNum,
                dateOfBirth: employee.dateOfBirth ? moment(employee.dateOfBirth).format('YYYY-MM-DD') : '',
                placeOfBirth: employee.placeOfBirth,
                bankAccountNumber: employee.bankAccountNumber,
                country: employee.country,
                postalCode: employee.postalCode,
                city: employee.city,
                streetAddress: employee.streetAddress,
                idCardNum: employee.idCardNum
            });
        }
    }, [employee, form]);

    // Reset editing state when modal is opened/closed
    useEffect(() => {
        if (visible) {
            setIsEditing(false);
        }
    }, [visible]);

    // Replace the handleSave function:
    const handleSave = () => {
        form.validateFields().then(values => {
            // Ensure postal code and city values remain unchanged
            values.postalCode = employee.postalCode;
            values.city = employee.city;

            onSave(values);
            setIsEditing(false);
            // Remove the onClose() call here - let the parent component close it after the save is successful
        });
    };

    const handleRestrictedFieldClick = () => {
        message.error("Contact an administrator to change this value");
    };

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        // Reset form to original values
        if (employee) {
            form.setFieldsValue({
                firstName: employee.firstName,
                lastName: employee.lastName,
                middleName: employee.middleName,
                email: employee.email,
                phoneNumber: employee.phoneNumber,
                taxNum: employee.taxNum,
                socialSecNum: employee.socialSecNum,
                dateOfBirth: employee.dateOfBirth ? moment(employee.dateOfBirth).format('YYYY-MM-DD') : '',
                placeOfBirth: employee.placeOfBirth,
                bankAccountNumber: employee.bankAccountNumber,
                country: employee.country,
                postalCode: employee.postalCode,
                city: employee.city,
                streetAddress: employee.streetAddress,
                idCardNum: employee.idCardNum
            });
        }
        setIsEditing(false);
    };

    const modalFooter = (
        <>
            {isEditing ? (
                <>
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} type='primary' icon={<SaveOutlined />} style={{ boxShadow: "none" }}>
                        Save
                    </Button>
                </>
            ) : (
                <Button onClick={handleEdit} icon={<EditOutlined />} type="primary" style={{ boxShadow: "none" }}>
                    Edit
                </Button>
            )}
        </>
    );

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? '#292A2A' : '#FFFFFF', colorText: isDarkMode ? '#FFFFFF' : '#000000', colorIcon: isDarkMode ? "white" : "black", }, }}>
            <Modal open={visible} onCancel={onClose} footer={modalFooter} width='70vh'>
                {employee && (
                    <Form form={form} layout='vertical' style={{ marginTop: "3vh", marginBottom: "3vh" }} >
                        <Row>
                            <Col span={24}>
                                <Flex justify="center" align="center">
                                    <Avatar icon={<UserOutlined style={{ fontSize: '3vh' }} />} style={{ width: '10vh', height: '10vh' }} />
                                </Flex>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={24}>
                                <Flex justify="center" align="center" style={{ marginBottom: '3vh' }} vertical>
                                    <Typography.Title level={2}>
                                        {employee.lastName} {employee.firstName}
                                    </Typography.Title>
                                    <Typography.Text>{employee.jobTitle}</Typography.Text>
                                </Flex>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col span={8}>
                                <Form.Item label="First Name" name="firstName" required>
                                    <Input placeholder="First Name" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Middle Name" name="middleName">
                                    <Input placeholder="Middle Name" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Last Name" name="lastName" required>
                                    <Input placeholder="Last Name" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item label="Email" name="email" required>
                                    <Input type="email" placeholder="Email" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Phone Number" name="phoneNumber">
                                    <Input placeholder="Phone Number" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item label="Birth Place" name="placeOfBirth">
                                    <Input placeholder="Birth Place" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Birth Date" name="dateOfBirth">
                                    <Input type="date" placeholder="Birth Date" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item label="Country" name="country" required>
                                    <Input placeholder="Country" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Postal Code" name="postalCode" required>
                                    <Input
                                        placeholder="Postal Code"
                                        disabled={true}
                                        onClick={handleRestrictedFieldClick}
                                        style={{ cursor: 'not-allowed', backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f5f5' }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item label="City" name="city" required>
                                    <Input
                                        placeholder="City"
                                        disabled={true}
                                        onClick={handleRestrictedFieldClick}
                                        style={{ cursor: 'not-allowed', backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f5f5' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Street Address" name="streetAddress" required>
                                    <Input placeholder="Street Address" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item label="Tax Number" name="taxNum">
                                    <Input placeholder="Tax Number" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Social Security Number" name="socialSecNum">
                                    <Input placeholder="Social Security Number" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item label="ID Card Number" name="idCardNum" required>
                                    <Input placeholder="ID Card Number" disabled={true} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Bank Account Number" name="bankAccountNumber">
                                    <Input placeholder="Bank Account Number" disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Modal>
        </ConfigProvider>
    );
};

export default EmpDetails;
