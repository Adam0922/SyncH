import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Flex, Row, Typography, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '../../theme/themeContext';
import ServiceWidget from './servicesWidget/serviceWidget';
import ServiceDatas from './serviceDatas/serviceDatas';
import AddNewService from './addNewService/addNewService';
import axios from '../../utils/axiosInstance';

const ServicesPageContent = () => {
    const { isDarkMode } = useTheme();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
    const [isAddServiceModalVisible, setIsAddServiceModalVisible] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/Services');
            setServices(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching services:', error);
            message.error('Failed to load services');
            setLoading(false);
        }
    };

    const handleServiceClick = (service) => {
        setSelectedService(service);
        setIsServiceModalVisible(true);
    };

    const handleCloseServiceModal = () => {
        setIsServiceModalVisible(false);
        setSelectedService(null);
    };

    const handleAddNewService = () => {
        setIsAddServiceModalVisible(true);
    };

    const handleCloseAddServiceModal = () => {
        setIsAddServiceModalVisible(false);
    };

    const handleServiceAdded = () => {
        message.success('Service added successfully!');
        fetchServices(); // Refresh the services list
    };

    return (
        <Card style={{ backgroundColor: isDarkMode ? "#292A2A" : "#FFFFFF", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
            <Flex vertical gap="large">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black" }}>
                            Services
                        </Typography.Title>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddNewService}
                            style={{ boxShadow: "none" }}
                        >
                            Add New Service
                        </Button>
                    </Col>
                </Row>

                {loading ? (
                    <Flex justify="center" align="center" style={{ height: '200px' }}>
                        <Spin size="large" />
                    </Flex>
                ) : (
                    <Row gutter={[16, 16]}>
                        {services.length > 0 ? (
                            services.map((service) => (
                                <Col key={service.serviceID} xs={24} sm={12} md={8} lg={8} xl={8}>
                                    <ServiceWidget
                                        service={service}
                                        onClick={() => handleServiceClick(service)}
                                    />
                                </Col>
                            ))
                        ) : (
                            <Col span={24}>
                                <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>
                                    No services found. Add a new service to get started.
                                </Typography.Text>
                            </Col>
                        )}
                    </Row>
                )}
            </Flex>

            <ServiceDatas
                selectedService={selectedService}
                visible={isServiceModalVisible}
                onClose={handleCloseServiceModal}
                onServiceDeleted={fetchServices} // Add this line to refresh services after saving

            />

            <AddNewService
                visible={isAddServiceModalVisible}
                onClose={handleCloseAddServiceModal}
                onSuccess={handleServiceAdded}
            />
        </Card>
    );
};

export default ServicesPageContent;
