import { Button, Modal, Result } from "antd";
import React from "react";
import { useTheme } from "../../theme/themeContext";

const SuccessNewPassword = ({ visible, onClose, onSave }) => {
    const { isDarkMode } = useTheme();
    const handleOk = () => {
        onSave();
        onClose();
    };

    return (
        <Modal open={visible} onCancel={onClose} footer={
                <Button type="primary" onClick={handleOk} style={{ boxShadow: "none"}}>
                    OK
                </Button>} width='60vh'
        >
            <Result style={{backgroundColor: isDarkMode ? "#212121" : "white"}} status="success" title="Password Changed Successfully!" subTitle="Your password has been updated."/>
        </Modal>
    );
};

export default SuccessNewPassword;
