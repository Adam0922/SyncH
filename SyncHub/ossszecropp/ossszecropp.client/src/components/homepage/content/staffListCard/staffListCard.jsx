import { Card, Flex, List, Typography, Button, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../theme/themeContext";
import axiosInstance from "../../../../utils/axiosInstance";

const StaffListCard = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        // First get the current user, then fetch employees
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        try {
            const response = await axiosInstance.get('/api/Employees/current');
            if (response.data && response.data.email) {
                setCurrentUserEmail(response.data.email);
                // After getting current user, fetch employees
                fetchEmployees(response.data.email);
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            // If we can't get current user, still try to fetch employees
            fetchEmployees('');
        }
    };

    const fetchEmployees = async (currentEmail) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/Employees/under-supervision');

            // Filter out the current user
            const filteredEmployees = response.data.filter(emp =>
                emp.email !== currentEmail
            );

            // Take only the first 3 employees
            setEmployees(filteredEmployees.slice(0, 3));
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAllClick = () => {
        navigate('/employees');
    };

    return (
        <Card style={{ width: '100%', height: '100%', backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
            <Flex align="center" justify="space-between" gap="middle">
                <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black", marginTop: "1vh", marginBottom: "1.5vh" }}>
                    Staff
                </Typography.Title>
                <Button onClick={handleViewAllClick} style={{ border: 'none', boxShadow: 'none' }}>View All</Button>
            </Flex>
            {loading ? (
                <Flex justify="center" align="center" style={{ height: '100px' }}>
                    <Spin />
                </Flex>
            ) : (
                <Flex style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                    <List
                        dataSource={employees}
                        renderItem={(employee) => (
                            <List.Item key={employee.idCardNum}>
                                <Flex justify="space-between" style={{ width: "100%" }}>
                                    <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>
                                        {employee.firstName} {employee.lastName}
                                    </Typography.Text>
                                    <Flex align="center" gap="small">
                                        <Typography.Text style={{ color: isDarkMode ? "white" : "black" }}>
                                            {employee.jobTitle}
                                        </Typography.Text>
                                    </Flex>
                                </Flex>
                            </List.Item>
                        )}
                        style={{ width: "100%" }}
                        locale={{ emptyText: 'No staff members found' }}
                    />
                </Flex>
            )}
        </Card>
    );
};

export default StaffListCard;
