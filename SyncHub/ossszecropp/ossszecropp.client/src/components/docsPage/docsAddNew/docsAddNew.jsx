import { Button, Col, Flex, Form, Input, Modal, Row, Space, Typography, Upload, message, ConfigProvider } from "antd";
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import TextArea from "antd/es/input/TextArea";
import axiosInstance from '../../../utils/axiosInstance';
import { useTheme } from "../../../theme/themeContext";

const DocsAddNew = ({ visible, onClose, onAddDocuments }) => {
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [fileType, setFileType] = useState('');

    // Fetch current user when component mounts or becomes visible
    useEffect(() => {
        if (visible) {
            fetchCurrentUser();
            form.resetFields();
            setFileList([]);
            setFileType('');
        }
    }, [visible, form]);

    // Update the type field in the form whenever fileType changes
    useEffect(() => {
        if (fileType) {
            form.setFieldsValue({ type: fileType });
        }
    }, [fileType, form]);

    const fetchCurrentUser = async () => {
        try {
            const response = await axiosInstance.get('/api/Employees/current');
            setCurrentUser(response.data);

            // Set the employee field with the current user's email
            form.setFieldsValue({
                createdBy: response.data.email || ''
            });

            console.log('Current user fetched:', response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
            message.error('Failed to load user data');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setFileList([]);
        setFileType('');
        onClose();
    };

    const handleAdd = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            // Check if a file is selected
            if (fileList.length === 0 || !fileList[0].originFileObj) {
                message.error('Please select a file to upload');
                setLoading(false);
                return;
            }

            // Create form data for file upload
            const formData = new FormData();

            // Add all required fields to form data
            formData.append('DocName', values.name);
            formData.append('DocType', values.type); // Use the value from the form
            formData.append('DocDescription', values.remarks || '');
            formData.append('DocFile', fileList[0].originFileObj);

            // Log what we're sending for debugging
            console.log('Uploading document:', {
                name: values.name,
                type: values.type,
                remarks: values.remarks,
                file: fileList[0].name,
                createdBy: values.createdBy
            });

            // Send the request to create a new document
            const response = await axiosInstance.post('/api/Documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log('Upload response:', response.data);
            message.success('Document added successfully');

            // Notify parent component about the new document
            onAddDocuments({
                documentId: response.data.docID,
                name: values.name,
                type: values.type,
                createdBy: values.createdBy,
                remarks: values.remarks,
            });

            // Reset form and close modal
            form.resetFields();
            setFileList([]);
            setFileType('');
            onClose();
        } catch (error) {
            console.error('Upload failed:', error);

            if (error.response && error.response.data) {
                console.error('Response data:', error.response.data);

                // Handle validation errors
                if (error.response.data.errors) {
                    const errorMessages = [];
                    for (const [field, messages] of Object.entries(error.response.data.errors)) {
                        errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
                    }

                    if (errorMessages.length > 0) {
                        message.error(`Validation errors: ${errorMessages.join('; ')}`);
                    } else {
                        message.error('Failed to add document: Validation error');
                    }
                } else {
                    message.error('Failed to add document: ' + (error.response.data.message || error.message));
                }
            } else {
                message.error('Failed to add document: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const footerButtons = (
        <Flex gap="small" style={{ position: "" }}>
            <Button
                key="add"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ boxShadow: "none" }}
                loading={loading}
                disabled={!fileType}
            >
                Add
            </Button>
            <Button key="cancel" onClick={handleCancel}>
                Cancel
            </Button>
        </Flex>
    );

    const modalTitle = (
        <Typography.Title level={2}>Add New Document</Typography.Title>
    );

    const determineFileType = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();

        if (['pdf'].includes(extension)) {
            return 'PDF';
        } else if (['doc', 'docx'].includes(extension)) {
            return 'Word';
        } else if (['xls', 'xlsx'].includes(extension)) {
            return 'Excel';
        } else if (['ppt', 'pptx'].includes(extension)) {
            return 'PowerPoint';
        }

        return '';
    };

    const beforeUpload = (file) => {
        const isAllowedType = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-powerpoint'
        ].includes(file.type);

        if (!isAllowedType) {
            message.error('You can only upload PDF, Word, Excel or PowerPoint files!');
            return Upload.LIST_IGNORE;
        }

        // Determine file type and set it
        const type = determineFileType(file);
        setFileType(type);

        // Don't upload automatically, we'll handle it in handleAdd
        return false;
    };

    const handleUploadChange = ({ fileList }) => {
        // Update fileList state when files are selected
        setFileList(fileList);

        // If fileList is empty, reset the type
        if (fileList.length === 0) {
            setFileType('');
            form.setFieldsValue({ type: '' });
        } else if (fileList[0].originFileObj) {
            // Determine file type if there's a file
            const type = determineFileType(fileList[0].originFileObj);
            setFileType(type);
            form.setFieldsValue({ type: type });
        }
    };

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? '#292A2A' : '#FFFFFF', colorText: isDarkMode ? '#FFFFFF' : '#000000', colorIcon: isDarkMode ? "white" : "black", }, }}>
            <Modal
                title={modalTitle}
                open={visible}
                onCancel={handleCancel}
                footer={footerButtons}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Flex vertical align="start" style={{ marginTop: '4vh' }} gap='middle'>
                        <Row gutter={[24, 24]} style={{ width: '100%' }}>
                            <Col span={12}>
                                <Form.Item
                                    label="Document Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Please input document name!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Type"
                                    name="type"
                                    rules={[{ required: true, message: 'Please upload a file to determine type!' }]}
                                >
                                    <Input disabled style={{ color: 'rgba(0, 0, 0, 0.85)' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24, 24]} style={{ width: '100%' }}>
                            <Col span={12}>
                                <Form.Item
                                    label="Created By"
                                    name="createdBy"
                                    rules={[{ required: true, message: 'User information is required!' }]}
                                >
                                    <Input disabled style={{ color: 'rgba(0, 0, 0, 0.85)' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Upload"
                                    name="upload"
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                                    rules={[{ required: true, message: 'Please upload a file!' }]}
                                >
                                    <Upload
                                        beforeUpload={beforeUpload}
                                        onChange={handleUploadChange}
                                        fileList={fileList}
                                        multiple={false}
                                        maxCount={1}
                                        listType="text"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    >
                                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[12, 12]} style={{ width: '100%' }}>
                            <Col span={24}>
                                <Form.Item label="Remarks" name="remarks">
                                    <TextArea maxLength={100} style={{ resize: 'none' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Flex>
                </Form>
            </Modal>
        </ConfigProvider>
    );
};

export default DocsAddNew;
