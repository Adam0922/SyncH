import { Card, Row, Col, Statistic, Typography, Spin } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, DollarOutlined } from '@ant-design/icons';
import { useTheme } from "../../../../theme/themeContext";
import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../../../../utils/axiosInstance";

const CashFlowBnr = () => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [financialData, setFinancialData] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        incomeChange: 0,
        expenseChange: 0,
        balance: 0
    });

    useEffect(() => {
        fetchFinancialSummary();
    }, []);

    const fetchFinancialSummary = async () => {
        setLoading(true);
        try {
            const [incomeResponse, expensesResponse] = await Promise.all([
                axiosInstance.get('/api/income'),
                axiosInstance.get('/api/Expenses')
            ]);

            // Calculate total income and expenses
            const totalIncome = incomeResponse.data.reduce((sum, item) => sum + parseFloat(item.price), 0);
            const totalExpenses = expensesResponse.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);

            // Calculate current month's income and expenses
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            const currentMonthIncome = incomeResponse.data
                .filter(item => {
                    const date = new Date(item.invoiceDate);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                })
                .reduce((sum, item) => sum + parseFloat(item.price), 0);

            const currentMonthExpenses = expensesResponse.data
                .filter(item => {
                    const date = new Date(item.expenseDate);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                })
                .reduce((sum, item) => sum + parseFloat(item.amount), 0);

            // Calculate previous month's income and expenses
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            const prevMonthIncome = incomeResponse.data
                .filter(item => {
                    const date = new Date(item.invoiceDate);
                    return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
                })
                .reduce((sum, item) => sum + parseFloat(item.price), 0);

            const prevMonthExpenses = expensesResponse.data
                .filter(item => {
                    const date = new Date(item.expenseDate);
                    return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
                })
                .reduce((sum, item) => sum + parseFloat(item.amount), 0);

            // Calculate percentage changes
            const incomeChange = prevMonthIncome === 0 ? 100 : ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100;
            const expenseChange = prevMonthExpenses === 0 ? 100 : ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100;

            setFinancialData({
                totalIncome,
                totalExpenses,
                incomeChange: parseFloat(incomeChange.toFixed(2)),
                expenseChange: parseFloat(expenseChange.toFixed(2)),
                balance: totalIncome - totalExpenses
            });
        } catch (error) {
            console.error("Error fetching financial data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{
            width: "100%",
            backgroundColor: isDarkMode ? "#292A2A" : "white",
            borderColor: isDarkMode ? "#515151" : "#EEEEEE"
        }}>
            <Row gutter={24}>
                <Col span={24}>
                    <Typography.Title level={2} style={{
                        color: isDarkMode ? "#f0f0f0" : "#000000",
                        marginBottom: "3vh",
                        marginTop: "1vh"
                    }}>
                        Financial Overview
                    </Typography.Title>
                </Col>

                {loading ? (
                    <Col span={24} style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                    </Col>
                ) : (
                    <>
                        <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                            <Card style={{
                                backgroundColor: isDarkMode ? "#292A2A" : "white",
                                borderColor: isDarkMode ? "#515151" : "#EEEEEE"
                            }}>
                                <Statistic
                                    title={<Typography.Title level={3} style={{
                                        color: isDarkMode ? "white" : "black",
                                        marginTop: "0.5vh",
                                        marginBottom: "2vh"
                                    }}>Income</Typography.Title>}
                                    value={financialData.incomeChange}
                                    precision={2}
                                    prefix={<ArrowUpOutlined style={{
                                        color: financialData.incomeChange >= 0 ? '#3f8600' : '#cf1322'
                                    }} />}
                                    suffix="%"
                                    valueStyle={{
                                        color: financialData.incomeChange >= 0 ? '#3f8600' : '#cf1322'
                                    }}
                                />
                                <Typography.Text style={{ color: isDarkMode ? "#d9d9d9" : "#595959" }}>
                                    Total: {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(financialData.totalIncome)}
                                </Typography.Text>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                            <Card style={{
                                backgroundColor: isDarkMode ? "#292A2A" : "white",
                                borderColor: isDarkMode ? "#515151" : "#EEEEEE"
                            }}>
                                <Statistic
                                    title={<Typography.Title level={3} style={{
                                        color: isDarkMode ? "white" : "black",
                                        marginTop: "0.5vh",
                                        marginBottom: "2vh"
                                    }}>Expenses</Typography.Title>}
                                    value={financialData.expenseChange}
                                    precision={2}
                                    prefix={<ArrowDownOutlined style={{
                                        color: financialData.expenseChange <= 0 ? '#3f8600' : '#cf1322'
                                    }} />}
                                    suffix="%"
                                    valueStyle={{
                                        color: financialData.expenseChange <= 0 ? '#3f8600' : '#cf1322'
                                    }}
                                />
                                <Typography.Text style={{ color: isDarkMode ? "#d9d9d9" : "#595959" }}>
                                    Total: {new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(financialData.totalExpenses)}
                                </Typography.Text>
                            </Card>
                        </Col>

                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                            <Card style={{
                                backgroundColor: isDarkMode ? "#292A2A" : "white",
                                borderColor: isDarkMode ? "#515151" : "#EEEEEE",
                                borderLeft: `4px solid ${financialData.balance >= 0 ? '#3f8600' : '#cf1322'}`
                            }}>
                                <Statistic
                                    title={<Typography.Title level={3} style={{
                                        color: isDarkMode ? "white" : "black",
                                        marginTop: "0.5vh",
                                        marginBottom: "2vh"
                                    }}>Balance</Typography.Title>}
                                    value={financialData.balance}
                                    precision={0}
                                    prefix={<DollarOutlined />}
                                    suffix="HUF"
                                    valueStyle={{
                                        color: financialData.balance >= 0 ? '#3f8600' : '#cf1322'
                                    }}
                                    formatter={(value) => new Intl.NumberFormat('hu-HU').format(value)}
                                />
                                <Typography.Text style={{
                                    color: financialData.balance >= 0 ? '#3f8600' : '#cf1322',
                                    fontWeight: 'bold'
                                }}>
                                    {financialData.balance >= 0 ? 'Positive Cash Flow' : 'Negative Cash Flow'}
                                </Typography.Text>
                            </Card>
                        </Col>
                    </>
                )}
            </Row>
        </Card>
    );
};

export default CashFlowBnr;
