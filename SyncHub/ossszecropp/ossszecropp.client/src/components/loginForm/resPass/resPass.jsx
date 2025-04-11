import React, { useState } from 'react';
import { Button, ConfigProvider, Modal, Result, Typography, Input, Form, message } from 'antd';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/themeContext';
import axiosInstance from '../../../utils/axiosInstance';

const ResPass = ({ visible, onClose, email, code }) => {
    const { isDarkMode } = useTheme();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const response = await axiosInstance.post('/api/PasswordRecovery/reset', {
                email: email,
                code: code,
                newPassword: values.newPassword
            });

            message.success('Password reset successfully!');
            form.resetFields();
            onClose();
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Failed to reset password. Please try again.');
            }
            console.error('Error resetting password:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider theme={{ token: { colorBgContainer: isDarkMode ? "#292A2A" : "white", colorText: isDarkMode ? "white" : "black", colorBorder: isDarkMode ? "#515151" : "white" } }}>
            <Modal open={visible} footer={null} centered onCancel={onClose} width={500}>
                <Result
                    style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", padding: '24px 0' }}
                    status="info"
                    title="Reset Password"
                    subTitle={<Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>Please enter your new password below.</Typography.Text>}
                />
                <Form form={form} layout="vertical" style={{ padding: '0 24px 24px' }}>
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Please input your new password!' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();

                                    const hasUpperCase = /[A-Z]/.test(value);
                                    const hasLowerCase = /[a-z]/.test(value);
                                    const hasNumber = /\d/.test(value);
                                    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

                                    const errors = [];
                                    if (!hasUpperCase) errors.push('one uppercase letter');
                                    if (!hasLowerCase) errors.push('one lowercase letter');
                                    if (!hasNumber) errors.push('one number');
                                    if (!hasSpecialChar) errors.push('one special character');

                                    if (errors.length > 0) {
                                        return Promise.reject(`Password must contain at least ${errors.join(', ')}`);
                                    }

                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input.Password placeholder="Enter your new password" size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Repeat Password"
                        name="repeatPassword"
                        rules={[
                            { required: true, message: 'Please confirm your new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Repeat your new password" size="large" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                        <Button
                            type="primary"
                            onClick={handleResetPassword}
                            style={{ marginRight: "2vh", boxShadow: "none" }}
                            loading={loading}
                        >
                            Reset Password
                        </Button>
                        <Button onClick={onClose}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </ConfigProvider>
    );
};

ResPass.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    email: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired
};

export default ResPass;
