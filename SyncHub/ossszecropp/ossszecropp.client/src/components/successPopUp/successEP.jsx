import React from 'react';
import { Button, Modal, Result } from 'antd';
import { useTheme } from '../../theme/themeContext';

const SuccessProfileEdit = ({ visible, onClose, onSave }) => {
    const { isDarkMode } = useTheme();
    const handleOk = () => {
        onSave();
        onClose();
    };

    return (
        <Modal open={visible} onCancel={onClose} footer={
            <Button type="primary" onClick={handleOk} style={{ boxShadow: "none"}}>
                Save Changes
            </Button>} width='60vh'
        >
            <Result style={{ backgroundColor: isDarkMode ? "#212121" : "white" }} status="success" title="Employee Profile Updated Successfully!" subTitle="The employee's information has been successfully modified in the system. You can now view their updated details or return to the employee list."/>
        </Modal>
    );
};

export default SuccessProfileEdit;