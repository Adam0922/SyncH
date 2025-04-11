import React, { useState } from 'react';
import { Button, ConfigProvider, Modal, Result, Typography, Input, Form, message } from 'antd';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/themeContext';
import { SendOutlined } from '@ant-design/icons';
import RecCodeInp from "../recCodeInp/recCodeInp.jsx";
import axiosInstance from '../../../utils/axiosInstance';

const FogPassLog = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();
    const [form] = Form.useForm();
    const [isRecCodeVisible, setRecCodeVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const handleSendRecoveryLinkClick = async () => {
        try {
            await form.validateFields();
            const email = form.getFieldValue('email');
            setUserEmail(email);
            setLoading(true);

            const response = await axiosInstance.post('/api/PasswordRecovery/request', {
                email: email
            });

            message.success('Recovery code sent to your email!');
            setRecCodeVisible(true);
            onClose();
        } catch (error) {
            if (error.response?.status === 404) {
                message.error('Email not found in our records.');
            } else if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Failed to send recovery code. Please try again.');
            }
            console.error('Error sending recovery code:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecCodeClose = () => {
        setRecCodeVisible(false);
    };

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? "#292A2A" : "#FFFFFF", colorBorder: isDarkMode ? "#515151" : "#FFFFFF", colorText: isDarkMode ? "white" : "black" } }}>
            <Modal open={visible} footer={null} centered onCancel={onClose} width={500}>
                <Result style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", padding: '24px 0' }} status="info" title="Can't log in?" subTitle={<Typography.Text style={{ color: isDarkMode ? "white" : "black" }}> Enter your email to receive a recovery code</Typography.Text>} />
                <Form form={form} layout="vertical" style={{ padding: '0 24px 24px' }}>
                    <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
                        <Input placeholder="Enter your email" size="large" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                        <Button
                            type="primary"
                            onClick={handleSendRecoveryLinkClick}
                            icon={<SendOutlined />}
                            style={{ marginRight: "2vh", boxShadow: "none" }}
                            loading={loading}
                        >
                            Send Recovery Code
                        </Button>
                        <Button onClick={onClose}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <RecCodeInp visible={isRecCodeVisible} onClose={handleRecCodeClose} email={userEmail} />
        </ConfigProvider>
    );
};

FogPassLog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default FogPassLog;
