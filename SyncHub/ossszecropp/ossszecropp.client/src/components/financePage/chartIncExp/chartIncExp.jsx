import { Card, Flex, Segmented, Typography, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from "../../../theme/themeContext";
import axios from 'axios';

const ChartIncExp = () => {
    const { isDarkMode } = useTheme();
    const [isMonthly, setIsMonthly] = useState(true);
    const [viewModeIncExp, setViewModeIncExp] = useState("both");
    const [viewModeMonthYear, setViewMonthYear] = useState("monthly");
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    const getExpCardTitle = () => {
        return isMonthly ? "Monthly" : "Yearly";
    };

    const handleMonthYearChange = (value) => {
        setViewMonthYear(value);
        setIsMonthly(value === 'monthly');
    };

    const handleIncExpChange = (value) => {
        setViewModeIncExp(value);
    };

    // Function to process data for the chart
    const processChartData = (income, expenses) => {
        // Create a map to store data by month/year
        const dataMap = new Map();

        // Process income data
        income.forEach(income => {
            const date = new Date(income.invoiceDate);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const key = isMonthly ? `${year}-${month}` : `${year}`;

            if (!dataMap.has(key)) {
                dataMap.set(key, { name: key, income: 0, expense: 0 });
            }

            const entry = dataMap.get(key);
            entry.income += parseFloat(income.price);
        });

        // Process expense data
        expenses.forEach(expense => {
            const date = new Date(expense.expenseDate);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const key = isMonthly ? `${year}-${month}` : `${year}`;

            if (!dataMap.has(key)) {
                dataMap.set(key, { name: key, income: 0, expense: 0 });
            }

            const entry = dataMap.get(key);
            entry.expense += parseFloat(expense.amount);
        });

        // Convert map to array and sort by date
        return Array.from(dataMap.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    };

    // Fetch data for the chart
    const fetchChartData = async () => {
        setLoading(true);
        try {
            const [incomeResponse, expensesResponse] = await Promise.all([
                axios.get('/api/income'),
                axios.get('/api/Expenses')
            ]);

            const processedData = processChartData(incomeResponse.data, expensesResponse.data);
            setChartData(processedData);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, [isMonthly]); // Refetch when switching between monthly/yearly view

    return (
        <Card style={{ width: "100%", height: "100%", backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
            <Flex vertical>
                <Flex align="center" justify="space-between" wrap="wrap">
                    <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black", marginTop: "1vh" }}>{getExpCardTitle()} Expenses - Income</Typography.Title>
                    <Segmented
                        options={[
                            { label: 'Income', value: 'income' },
                            { label: 'Both', value: 'both' },
                            { label: 'Expenses', value: 'expenses' }
                        ]} value={viewModeIncExp} onChange={handleIncExpChange}
                    />
                </Flex>
                <Flex justify="right" style={{ marginBottom: "1.5vh" }}>
                    <Segmented
                        options={[
                            { label: 'Monthly', value: 'monthly' },
                            { label: 'Yearly', value: 'yearly' },
                        ]} value={viewModeMonthYear} onChange={handleMonthYearChange}
                    />
                </Flex>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(value)} />
                            {viewModeIncExp !== 'expenses' && (
                                <Area type="monotone" dataKey="income" name="Income" stroke="#8884d8" fillOpacity={1} fill="url(#colorIncome)" />
                            )}
                            {viewModeIncExp !== 'income' && (
                                <Area type="monotone" dataKey="expense" name="Expense" stroke="#82ca9d" fillOpacity={1} fill="url(#colorExpense)" />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Flex>
        </Card>
    );
};

export default ChartIncExp;

