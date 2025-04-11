/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./listedEmp.css"
import { Card, Flex, Typography, Table, Button, Tooltip, Input, Popconfirm, ConfigProvider, message } from "antd";
import { UserAddOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../../../theme/themeContext";
import EmpDetails from "../empDetails/empDetails";

const ListedEmployee = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        axios.get('https://localhost:7056/api/Employees')
            .then(response => {
                console.log("API Response:", response.data);
                if (Array.isArray(response.data)) {
                    setEmployees(response.data);
                } else {
                    console.error("API response is not an array:", response.data);
                }
            })
            .catch(error => console.error('Error fetching employees:', error));
    }, []);

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8, backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE", borderWidth: "1px", borderStyle: "solid" }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
                </Button>
                <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
                </Button>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Tooltip title={text}>
                    {text}
                </Tooltip>
            ) : (
                text
            ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };



    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const handleDelete = (idCardNum) => {
        axios.delete(`https://localhost:7056/api/Employees/${idCardNum}`)
            .then(() => {
                setEmployees(employees.filter(employee => employee.idCardNum !== idCardNum));
            })
            .catch(error => console.error('Error deleting employee:', error));
    };

    const handleProfile = (employee) => {
        navigate(`/employees/profile/${employee.idCardNum}`, { state: { employee } });
    };

    const handleMore = (employee) => {
        setSelectedEmployee(employee);
        setDetailsVisible(true);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'idCardNum',
            key: 'idCardNum',
            sorter: (a, b) => a.idCardNum.localeCompare(b.idCardNum),
            style: { backgroundColor: isDarkMode ? "#292A2A" : "white", color: isDarkMode ? "white" : "black" },
        },
        {
            title: 'First Name',
            dataIndex: 'firstName',
            key: 'firstName',
            sorter: (a, b) => a.firstName.localeCompare(b.firstName),
            ...getColumnSearchProps('firstName'),
        },
        {
            title: 'Last Name',
            dataIndex: 'lastName',
            key: 'lastName',
            sorter: (a, b) => a.lastName.localeCompare(b.lastName),
            ...getColumnSearchProps('lastName'),
        },
        {
            title: 'Job Title',
            dataIndex: 'jobTitle',
            key: 'jobTitle',
            sorter: (a, b) => a.jobTitle.localeCompare(b.jobTitle),
            responsive: ['md'],
            ...getColumnSearchProps('jobTitle'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
            responsive: ['lg'],
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Flex gap="small">
                    <Tooltip title="Profile">
                        <Button icon={<UserOutlined style={{ color: isDarkMode ? "white" : "black" }} />} size="small" onClick={() => handleMore(record)} style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure to delete this employee?"
                            onConfirm={() => handleDelete(record.idCardNum)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button icon={<DeleteOutlined />} size="small" danger style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE", boxShadow: "none" }} />
                        </Popconfirm>
                    </Tooltip>
                </Flex>
            ),
        },
    ];

    const handleAddEmployee = () => navigate('/employees/add-employee');

    return (
        <div className={isDarkMode ? "dark-mode" : "light-mode"}>
            <Card style={{ width: '100%', height: '100%', backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
                <Flex align="center" style={{ marginBottom: "1em" }} justify="space-between">
                    <Typography.Title level={2} style={{ marginBottom: "1vh", marginTop: "1vh", color: isDarkMode ? "white" : "black" }}>
                        Employees
                    </Typography.Title>
                    <Tooltip title="Add new employee">
                        <Button icon={<UserAddOutlined />} type="primary" onClick={handleAddEmployee}>
                            Add Employee
                        </Button>
                    </Tooltip>
                </Flex>
                <Table columns={columns} dataSource={employees} onChange={(pagination, filters, sorter) => console.log('params', pagination, filters, sorter)} showSorterTooltip={{ target: 'sorter-icon', }} scroll={{ x: 'max-content' }} responsive style={{ backgroundColor: isDarkMode ? "#292A2A" : "white" }} />
                <EmpDetails
                    visible={detailsVisible}
                    onClose={() => setDetailsVisible(false)}
                    onSave={(values) => {
                        axios.put(`https://localhost:7056/api/Employees/${values.idCardNum}`, values)
                            .then(() => {
                                // Show success message
                                message.success('Employee updated successfully');

                                // Refresh the employee list after successful update
                                axios.get('https://localhost:7056/api/Employees')
                                    .then(response => {
                                        if (Array.isArray(response.data)) {
                                            setEmployees(response.data);
                                        }
                                    })
                                    .catch(error => console.error('Error fetching employees:', error));

                                setDetailsVisible(false);
                            })
                            .catch(error => {
                                console.error('Error updating employee:', error);
                                message.error('Failed to update employee');
                            });
                    }}
                    employee={selectedEmployee}
                />
            </Card>
        </div>
    );
};
export default ListedEmployee;