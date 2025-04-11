import React from 'react';
import { Row, Col, Card } from 'antd';
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
import { useTheme } from '../../../theme/themeContext';

const IconSelector = ({ selectedIcon, onSelectIcon }) => {
    const { isDarkMode } = useTheme();

    const icons = [
        { name: 'app', component: <AppstoreOutlined /> },
        { name: 'tool', component: <ToolOutlined /> },
        { name: 'setting', component: <SettingOutlined /> },
        { name: 'code', component: <CodeOutlined /> },
        { name: 'database', component: <DatabaseOutlined /> },
        { name: 'cloud', component: <CloudOutlined /> },
        { name: 'laptop', component: <LaptopOutlined /> },
        { name: 'mobile', component: <MobileOutlined /> },
        { name: 'global', component: <GlobalOutlined /> },
        { name: 'shopping', component: <ShoppingOutlined /> },
        { name: 'team', component: <TeamOutlined /> },
        { name: 'fileSearch', component: <FileSearchOutlined /> },
        { name: 'barChart', component: <BarChartOutlined /> },
        { name: 'mail', component: <MailOutlined /> },
        { name: 'security', component: <SecurityScanOutlined /> },
    ];

    return (
        <Row gutter={[16, 16]}>
            {icons.map((icon) => (
                <Col span={4} key={icon.name}>
                    <Card
                        hoverable
                        style={{
                            textAlign: 'center',
                            backgroundColor: selectedIcon === icon.name ? (isDarkMode ? '#1890ff' : '#e6f7ff') : (isDarkMode ? '#292A2A' : 'white'),
                            borderColor: selectedIcon === icon.name ? '#1890ff' : (isDarkMode ? '#515151' : '#EEEEEE'),
                            cursor: 'pointer'
                        }}
                        onClick={() => onSelectIcon(icon.name)}
                    >
                        <div style={{ fontSize: '24px', color: isDarkMode ? "white" : "black" }}>
                            {icon.component}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default IconSelector;
