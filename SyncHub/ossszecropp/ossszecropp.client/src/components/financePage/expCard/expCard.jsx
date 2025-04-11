import { Card, List, Typography, Tag, Button, Flex, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { DiffOutlined } from '@ant-design/icons';
import AddNewExp from './addNewExp/addNewExp';
import { useTheme } from '../../../theme/themeContext';
import axios from 'axios';

const ExpCard = () => {
    const { isDarkMode } = useTheme();
    const [expenses, setExpenses] = useState([]);
    const [isAddNewExp, setIsExpModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/Expenses');
            setExpenses(response.data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            message.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const showAddNewExpModal = () => {
        setIsExpModalVisible(true);
    };

    const handleAddNewExpModal = (success = false) => {
        setIsExpModalVisible(false);
        if (success) {
            fetchExpenses(); // Refresh the list after adding
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    return (
        <Card style={{ width: "100%", height: "62vh", overflow: "hidden", backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
            <Flex vertical gap="large">
                <Flex align="center" wrap="wrap" justify='space-between'>
                    <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black", marginTop: "1vh", marginBottom: "1vh" }}>Expenses</Typography.Title>
                    <Button icon={<DiffOutlined />} type='primary' onClick={showAddNewExpModal}>Add New Expenses</Button>
                </Flex>
                <div style={{ height: "50vh", overflow: "auto" }}>
                    <List
                        loading={loading}
                        dataSource={expenses}
                        renderItem={(expense) => (
                            <List.Item key={expense.expenseID}>
                                <Flex justify="space-between" style={{ width: "100%" }}>
                                    <Typography.Text style={{ color: isDarkMode ? "white" : "black" }} >{expense.description}</Typography.Text>
                                    <Flex align="center" gap="small">
                                        <Typography.Text style={{ color: isDarkMode ? "white" : "black" }} >{expense.amount.toLocaleString()} Ft</Typography.Text>
                                        {expense.paymentStatus === 'Paid' ? (
                                            <Tag color="green">Paid</Tag>
                                        ) : expense.paymentStatus === 'Overdue' ? (
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
            <AddNewExp visible={isAddNewExp} onCancel={handleAddNewExpModal} />
        </Card>
    );
};

export default ExpCard;
