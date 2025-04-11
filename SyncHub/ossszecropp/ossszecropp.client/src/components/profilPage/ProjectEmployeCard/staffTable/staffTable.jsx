import { Button, Flex, Input, Table, Tooltip, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../utils/axiosInstance';
import './staffTable.css'; // Import the CSS file

const StaffTable = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
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

            setEmployees(filteredEmployees);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
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
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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

    const columns = [
        {
            title: 'First Name',
            dataIndex: 'firstName',
            sorter: (a, b) => a.firstName.localeCompare(b.firstName),
            ...getColumnSearchProps('firstName'),
        },
        {
            title: 'Last Name',
            dataIndex: 'lastName',
            sorter: (a, b) => a.lastName.localeCompare(b.lastName),
            ...getColumnSearchProps('lastName'),
        },
        {
            title: 'Job',
            dataIndex: 'jobTitle',
            sorter: (a, b) => a.jobTitle.localeCompare(b.jobTitle),
            responsive: ['md'],
            ...getColumnSearchProps('jobTitle'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
            responsive: ['lg'],
            ...getColumnSearchProps('email'),
        }
    ];

    return (
        <div className="staff-table-container">
            {loading ? (
                <Flex justify="center" align="center" style={{ height: '300px' }}>
                    <Spin size="large" />
                </Flex>
            ) : (
                <Table
                    columns={columns}
                    dataSource={employees}
                    rowKey="idCardNum"
                    scroll={{ y: 300 }}
                    locale={{ emptyText: 'No staff members found' }}
                />
            )}
        </div>
    );
};

export default StaffTable;
