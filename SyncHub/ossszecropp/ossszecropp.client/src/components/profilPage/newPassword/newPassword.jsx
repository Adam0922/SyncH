import { Flex, Input, Modal, Typography, Button, Form, message } from "antd";
import React, { useState } from "react";
import SuccessNewPass from "../../successPopUp/successNP.jsx";
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axiosInstance from '../../../utils/axiosInstance';

const NewPassword = ({ visible, onCancel }) => {
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [form] = Form.useForm();

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const response = await axiosInstance.put('/api/Employees/change-password', {
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            });
            message.success(response.data.message);
            onCancel();
            setIsSuccessModalVisible(true);
        } catch (error) {
            console.error('Error changing password:', error);
            message.error(error.response?.data?.message || 'An error occurred while changing the password.');
        }
    };

    const PasswordInput = ({ name, label, placeholder, rules }) => {
        const [show, setShow] = useState(false);
        return (
            <Form.Item
                name={name}
                label={<Typography style={{ fontWeight: "bold" }}>{label}</Typography>}
                rules={rules}
            >
                <Input
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    suffix={
                        <Button
                            type="text"
                            icon={show ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            onClick={() => setShow(!show)}
                        />
                    }
                />
            </Form.Item>
        );
    };

    return (
        <>
            <Modal open={visible} onCancel={onCancel} width='50vh' footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSave}>
                    Save
                </Button>]}
            >
                <Form form={form} layout="vertical">
                    <Typography.Title level={3} style={{ marginBottom: '3vh' }}>
                        New Password
                    </Typography.Title>
                    <PasswordInput name="oldPassword" label="Old password" placeholder="Enter old password" rules={[{ required: true, message: 'Please enter your old password' }]} />
                    <PasswordInput name="newPassword" label="New password" placeholder="Enter new password" rules={[{ required: true, message: 'Please enter your new password' }]} />
                    <PasswordInput name="repeatPassword" label="Repeat new password" placeholder="Repeat new password" rules={[{
                        required: true, message: 'Please repeat your new password'
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match'));
                        },
                    }),
                    ]}
                    />
                </Form>
            </Modal>
            <SuccessNewPass visible={isSuccessModalVisible} onClose={() => setIsSuccessModalVisible(false)} />
        </>
    )
}

export default NewPassword;
