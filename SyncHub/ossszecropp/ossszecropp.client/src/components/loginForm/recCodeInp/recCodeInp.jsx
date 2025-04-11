import React, { useState } from 'react';
import { Button, ConfigProvider, Modal, Typography, Input, Form, Flex, message } from 'antd';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/themeContext';
import ResPass from '../resPass/resPass';
import axiosInstance from '../../../utils/axiosInstance';

const RecCodeInp = ({ visible, onClose, email }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isResPassVisible, setResPassVisible] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const onChange = (value) => {
        setVerificationCode(value);
    };

    const onInput = value => {
        console.log('onInput:', value);
    };

    const sharedProps = {
        onChange,
        onInput,
    };

    const handleVerifyCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            message.error('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/PasswordRecovery/verify', {
                email: email,
                code: verificationCode
            });

            message.success('Code verified successfully');
            setResPassVisible(true);
            onClose();
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Invalid or expired verification code');
            }
            console.error('Error verifying code:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResPassClose = () => {
        setResPassVisible(false);
    };

    return (
        <ConfigProvider theme={{ token: { colorBgContainer: isDarkMode ? "#292A2A" : "white", colorBorder: isDarkMode ? "#515151" : "white", colorText: isDarkMode ? "white" : "black" } }}>
            <Modal open={visible} footer={null} centered onCancel={onClose} width={500}>
                <Typography.Title level={2} style={{ textAlign: 'center', color: isDarkMode ? "white" : "black", marginBottom: "3vh" }}>
                    Enter the recovery code
                </Typography.Title>
                <Form form={form} layout="vertical">
                    <Form.Item name="code" rules={[{ required: true, message: 'Please enter the recovery code' }]}>
                        <Flex justify='center' align='center' style={{ marginBottom: '1vh' }}>
                            <Input.OTP
                                length={6}
                                variant="filled"
                                {...sharedProps}
                                size="large"
                            />
                        </Flex>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                        <Button
                            type="primary"
                            loading={loading}
                            style={{ marginRight: "2vh", boxShadow: "none" }}
                            onClick={handleVerifyCode}
                        >
                            Verify Code
                        </Button>
                        <Button onClick={onClose} style={{ boxShadow: "none" }}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <ResPass visible={isResPassVisible} onClose={handleResPassClose} email={email} code={verificationCode} />
        </ConfigProvider>
    );
};

RecCodeInp.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    email: PropTypes.string.isRequired
};

export default RecCodeInp;
