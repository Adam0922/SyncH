import React from "react";
import { Button, Modal, Result } from "antd";
import { useNavigate } from 'react-router-dom';

const SuccessLogin = ({ visible, onClose, onSave }) => {
    const navigate = useNavigate();

    const handleOk = () => {
        onSave?.();
        onClose();
        navigate('/home'); // Redirect to home page
    };

    return (
        <Modal open={visible} onCancel={onClose} footer={
            <Button type="primary" key="console" onClick={handleOk}>
                Go to Dashboard
            </Button>} width='60vh'
        >
            <Result style={{ backgroundColor: "#fff" }} status="success" title="Login Successful!" subTitle="Welcome back! You have successfully logged in to your account. Explore your dashboard and manage your settings."
            />
        </Modal>
    );
};

export default SuccessLogin;
