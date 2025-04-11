import React from 'react';
import { Button, ConfigProvider, Modal, Result, Typography } from 'antd';
import { useTheme } from '../../theme/themeContext';

const SuccessNewService = ({ visible ,onClose }) => {
    const { isDarkMode } = useTheme();
    const modelExtra = [    
        <Button type="primary" key="console" onClick={onClose} style={{boxShadow: "none"}}>
            Go to Sevices
        </Button>
    ];

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? "#292A2A" : "white", colorText: isDarkMode ? "white" : "black", colorBorder: isDarkMode ? "#515151" : "white" }}}>
            <Modal visible={visible} footer={null} centered onClose={onClose}>
                <Result style={{ backgroundColor: isDarkMode ? "#292A2A" : "white" }} status="success" title="Product Added Successfully!" subTitle={<Typography.Text>The new product has been successfully added to your inventory. You can now manage its details or continue adding more products to your catalog.</Typography.Text>} extra={modelExtra}/>
            </Modal>
        </ConfigProvider>
    );
};

export default SuccessNewService;