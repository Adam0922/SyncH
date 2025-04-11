import { Button, Card, Flex, List, Typography, Space, message } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../theme/themeContext";
import axiosInstance from '../../../../utils/axiosInstance';

const EquipmentListCard = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/Equipment');

            // Transform data to match our needs
            const formattedData = Array.isArray(response.data) ? response.data.map(item => ({
                serialNumber: item.serialNumber || '',
                equipmentName: item.equipmentName || '',
                employee: item.employee || '',
                status: item.status || 'Unknown',
                category: item.category || ''
            })) : [];

            setEquipment(formattedData);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            message.error('Failed to load equipment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const handleViewAllClick = () => {
        navigate('/equipments');
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'under maintenance':
                return '#faad14';
            case 'worn out':
                return '#f5222d';
            case 'issued':
                return '#52c41a';
            default:
                return '#faad14';
        }
    };

    return (
        <Card style={{ width: '100%', height: '100%', backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
            <Flex align="center" justify="space-between" gap="middle" style={{ marginBottom: '1.5vh' }}>
                <Typography.Title level={2} style={{ margin: 0, color: isDarkMode ? "#FFFFFF" : "#000000" }}>
                    Equipment
                </Typography.Title>
                <Button onClick={handleViewAllClick} style={{ border: 'none', boxShadow: 'none' }}>View All</Button>
            </Flex>
            <Flex style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                <List
                    loading={loading}
                    dataSource={equipment}
                    renderItem={(item) => (
                        <List.Item key={item.serialNumber}>
                            <Flex justify="space-between" style={{ width: "100%" }}>
                                <Flex vertical>
                                    <Typography.Text strong style={{ color: isDarkMode ? "white" : "black" }}>{item.equipmentName}</Typography.Text>
                                    <Typography.Text type="secondary" style={{ color: isDarkMode ? "#AAAAAA" : "#666666" }}>SN: {item.serialNumber}</Typography.Text>
                                </Flex>
                                <Flex align="center" gap="small">
                                    <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>{item.category}</Typography.Text>
                                    <Space>
                                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(item.status), marginRight: '4px' }}></span>
                                        <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>{item.status}</Typography.Text>
                                    </Space>
                                </Flex>
                            </Flex>
                        </List.Item>
                    )}
                    style={{ width: "100%" }}
                />
            </Flex>
        </Card>
    );
};

export default EquipmentListCard;
