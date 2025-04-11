import React, { useState, useEffect } from "react";
import { Button, Col, Flex, Form, Input, Modal, Row, Typography, Upload, message, ConfigProvider } from "antd";
import { EditOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import TextArea from "antd/es/input/TextArea";
import axiosInstance from '../../../utils/axiosInstance';
import { useTheme } from "../../../theme/themeContext";

const DocsDetails = ({ visible, documents, onClose, onDocumentUpdated }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fileType, setFileType] = useState('');

    useEffect(() => {
        if (documents) {
            console.log('Documents object in DocsDetails:', documents);
            form.setFieldsValue({
                documentId: documents.documentId,
                name: documents.name,
                type: documents.type,
                remarks: documents.remarks,
            });
            setFileType(documents.type);
            setFileList([]);
        }
    }, [documents, form]);

    // Update the type field when fileType changes (if editing)
    useEffect(() => {
        if (isEditing && fileType) {
            form.setFieldsValue({ type: fileType });
        }
    }, [fileType, form, isEditing]);

    const handleModify = () => {
        setIsEditing(true);
    };

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

        // Don't upload automatically, we'll handle it in handleSave
        return false;
    };

    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList);

        // If fileList is empty, reset to original document type
        if (fileList.length === 0) {
            setFileType(documents?.type || '');
            form.setFieldsValue({ type: documents?.type || '' });
        } else if (fileList[0].originFileObj) {
            // Determine file type if there's a file
            const type = determineFileType(fileList[0].originFileObj);
            setFileType(type);
            form.setFieldsValue({ type: type });
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Create the update object
            const updateData = {
                docName: values.name,
                docType: values.type,
                remarks: values.remarks
            };

            console.log('Updating document metadata:', updateData);

            // Send the update request to the metadata endpoint
            const response = await axiosInstance.put(
                `/api/Documents/${documents.documentId}/metadata`,
                updateData
            );

            if (response.status === 200) {
                message.success('Document updated successfully');
                setIsEditing(false);
                // Call the onDocumentUpdated callback to refresh the document list
                onDocumentUpdated();
            }
        } catch (error) {
            console.error('Update failed:', error);
            console.error('Response data:', error.response?.data);
            message.error('Failed to update document: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form to original values
        if (documents) {
            form.setFieldsValue({
                documentId: documents.documentId,
                name: documents.name,
                type: documents.type,
                remarks: documents.remarks,
            });
        }
        setFileList([]);
        onClose();
    };

    const footerButtons = (
        isEditing ? (
            <Flex justify="space-between">
                <Button
                    key="save"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    style={{ boxShadow: "none" }}
                    loading={loading}
                >
                    Save
                </Button>
                <Button
                    key="cancel"
                    onClick={() => {
                        setIsEditing(false);
                        setFileList([]);
                        form.setFieldsValue({
                            documentId: documents?.documentId,
                            name: documents?.name,
                            type: documents?.type,
                            remarks: documents?.remarks,
                        });
                    }}
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
                style={{ boxShadow: "none" }}
            >
                Modify
            </Button>
        )
    );

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? '#292A2A' : '#FFFFFF', colorText: isDarkMode ? '#FFFFFF' : '#000000', colorIcon: isDarkMode ? "white" : "black", }, }}>
            <Modal
                title={
                    <Flex justify="space-between" align="center" style={{ width: '90%' }}>
                        <Typography.Title level={2} style={{ margin: 0 }}>
                            {documents?.name}
                        </Typography.Title>
                    </Flex>
                }
                open={visible}
                onCancel={handleCancel}
                footer={footerButtons}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Flex vertical align="start" style={{ marginTop: '4vh' }} gap='middle'>
                        <Row gutter={[24]} style={{ width: '100%' }}>
                            <Col span={24}>
                                <Typography.Text type="secondary">
                                    Created By: {documents?.createdBy || 'Unknown'}
                                </Typography.Text>
                            </Col>
                        </Row>
                        <Row gutter={[24, 24]} style={{ width: '100%' }}>
                            <Col span={12}>
                                <Form.Item
                                    label="Document ID:"
                                    name="documentId"
                                    rules={[{ required: true, message: 'Please input Document ID!' }]}
                                >
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Document Name:"
                                    name="name"
                                    rules={[{ required: true, message: 'Please input Document Name!' }]}
                                >
                                    <Input disabled={!isEditing} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24, 24]} style={{ width: '100%' }}>
                            <Col span={12}>
                                <Form.Item
                                    label="Type:"
                                    name="type"
                                    rules={[{ required: true, message: 'Please input Type!' }]}
                                >
                                    <Input disabled style={{ color: 'rgba(0, 0, 0, 0.85)' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Upload:"
                                    name="upload"
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                                >
                                    {isEditing ? (
                                        <Upload
                                            beforeUpload={beforeUpload}
                                            onChange={handleUploadChange}
                                            fileList={fileList}
                                            multiple={false}
                                            maxCount={1}
                                            listType="text"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        >
                                            <Button icon={<UploadOutlined />}>
                                                Replace File
                                            </Button>
                                        </Upload>
                                    ) : (
                                        <Typography.Text>
                                            {documents?.documentId ? 'File available for download' : 'No file uploaded'}
                                        </Typography.Text>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[24]} style={{ width: '100%' }}>
                            <Col span={24}>
                                <Form.Item
                                    label="Remarks:"
                                    name="remarks"
                                    rules={[{ required: true, message: 'Please input Remarks!' }]}
                                >
                                    {isEditing ? (
                                        <TextArea maxLength={100} style={{ resize: 'none' }} />
                                    ) : (
                                        <Typography.Text> {documents?.remarks}</Typography.Text>
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

export default DocsDetails;
