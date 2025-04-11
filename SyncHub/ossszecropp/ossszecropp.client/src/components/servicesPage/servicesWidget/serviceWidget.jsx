import React from 'react';
import { Card, Flex, Typography } from 'antd';
import { useTheme } from '../../../theme/themeContext';
import {
    AppstoreOutlined,
    ToolOutlined,
    SettingOutlined,
    CodeOutlined,
    DatabaseOutlined,
    CloudOutlined,
    LaptopOutlined,
    MobileOutlined,
    GlobalOutlined,
    ShoppingOutlined,
    TeamOutlined,
    FileSearchOutlined,
    BarChartOutlined,
    MailOutlined,
    SecurityScanOutlined
} from '@ant-design/icons';

const ServiceWidget = ({ service, onClick }) => {
    const { isDarkMode } = useTheme();

    // Function to get the icon component based on the icon name
    const getIconComponent = (iconName) => {
        switch (iconName) {
            case 'app': return <AppstoreOutlined />;
            case 'tool': return <ToolOutlined />;
            case 'setting': return <SettingOutlined />;
            case 'code': return <CodeOutlined />;
            case 'database': return <DatabaseOutlined />;
            case 'cloud': return <CloudOutlined />;
            case 'laptop': return <LaptopOutlined />;
            case 'mobile': return <MobileOutlined />;
            case 'global': return <GlobalOutlined />;
            case 'shopping': return <ShoppingOutlined />;
            case 'team': return <TeamOutlined />;
            case 'fileSearch': return <FileSearchOutlined />;
            case 'barChart': return <BarChartOutlined />;
            case 'mail': return <MailOutlined />;
            case 'security': return <SecurityScanOutlined />;
            default: return <AppstoreOutlined />;
        }
    };

    return (
        <Card
            hoverable
            style={{
                border: '0.5px dotted rgba(225, 225, 225, 1)',
                backgroundColor: isDarkMode ? "#292A2A" : "#FFFFFF",
                borderColor: isDarkMode ? "#515151" : "#EEEEEE",
                height: '100%'
            }}
            onClick={onClick}
        >
            <Flex vertical align="center" gap="1.3em">
                <div style={{
                    width: '100%',
                    height: '150px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#f0f2f5',
                    borderRadius: '1vh'
                }}>
                    <div style={{ fontSize: '64px', color: isDarkMode ? 'white' : 'black' }}>
                        {getIconComponent(service.serviceIcon || 'app')}
                    </div>
                </div>
                <Typography.Title level={4} style={{ fontWeight: "bold", fontSize: '2vh', textAlign: "center", color: isDarkMode ? "white" : "black" }}>
                    {service.serviceName}
                </Typography.Title>
                <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>
                    {service.servicePrice} {service.serviceFiatType}
                </Typography.Text>
            </Flex>
        </Card>
    );
};

export default ServiceWidget;
