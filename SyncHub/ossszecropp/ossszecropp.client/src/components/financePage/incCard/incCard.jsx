import { DiffOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Button, Flex, message } from 'antd';
import AddNewInc from './addNewInc/addNewInc';
import { useTheme } from '../../../theme/themeContext';
import axios from 'axios';

const IncCard = () => {
    const { isDarkMode } = useTheme();
    const [income, setIncome] = useState([]);
    const [isAddNewInc, setIsAddNewIncModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchIncome = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/income');
            setIncome(response.data);
        } catch (error) {
            console.error("Error fetching income:", error);
            message.error('Failed to load income data');
        } finally {
            setLoading(false);
        }
    };

    const showAddNewIncModal = () => {
        setIsAddNewIncModalVisible(true);
    };

    const handleAddNewIncModal = (success = false) => {
        setIsAddNewIncModalVisible(false);
        if (success) {
            fetchIncome(); // Refresh the list after adding
        }
    };

    useEffect(() => {
        fetchIncome();
    }, []);

    return (
        <Card style={{ width: "100%", height: "62vh", overflow: "hidden", backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
            <Flex vertical gap="large">
                <Flex align="center" wrap="wrap" justify='space-between'>
                    <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black", marginTop: "1vh", marginBottom: "1vh" }}>income</Typography.Title>
                    <Button icon={<DiffOutlined />} type='primary' onClick={showAddNewIncModal}>Add New Income</Button>
                </Flex>
                <div style={{ height: "50vh", overflow: "auto", borderColor: isDarkMode ? "white" : "black" }}>
                    <List
                        loading={loading}
                        dataSource={income}
                        renderItem={(income) => (
                            <List.Item key={income.incomeID}>
                                <Flex justify="space-between" style={{ width: "100%" }}>
                                    <Typography.Text style={{ color: isDarkMode ? "white" : "black" }} >{income.description}</Typography.Text>
                                    <Flex align="center" gap="small">
                                        <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>{income.price.toLocaleString()} Ft</Typography.Text>
                                        {income.paymentStatus === 'Paid' ? (
                                            <Tag color="green">Paid</Tag>
                                        ) : income.paymentStatus === 'Overdue' ? (
                                            <Tag color="red">Overdue</Tag>
                                        ) : (
                                            <Tag color="orange">Pending</Tag>
                                        )}
                                    </Flex>
                                </Flex>
                            </List.Item>
                        )}
                    />
                </div>
            </Flex>
            <AddNewInc visible={isAddNewInc} onCancel={handleAddNewIncModal} />
        </Card>
    );
};

export default IncCard;
