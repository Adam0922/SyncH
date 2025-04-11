import React, { useState, useEffect, useRef } from "react";
import { Grid, Typography } from 'antd';
const { useBreakpoint } = Grid;
import { MoreOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Input, Popconfirm, Table, Tooltip, Space, message } from "antd";
import EqDetails from "../eqDetails/eqDetails";
import axiosInstance from '../../../utils/axiosInstance';
import { useTheme } from "../../../theme/themeContext";

const EqTable = () => {
    const screens = useBreakpoint();
    const { isDarkMode } = useTheme();
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    // In eqTable.jsx
    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/Equipment');
            console.log('Fetched equipment data:', response.data);

            // Transform data to match column structure
            const formattedData = Array.isArray(response.data) ? response.data.map(item => ({
                key: item.equipmentID, // Use the actual ID as the key
                equipmentID: item.equipmentID, // Store the ID explicitly
                serialNumber: item.serialNumber || '',
                name: item.equipmentName || '',
                employee: item.employee || '',
                status: item.status || 'Unknown',
                category: item.category || '',
                warrantyExpiration: item.warrantyExpiration,
                lastServiceDate: item.lastServiceDate,
                purchaseDate: item.purchaseDate,
                remarks: item.remarks || ''
            })) : [];

            console.log('Formatted data:', formattedData);
            setData(formattedData);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            message.error('Failed to load equipment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();

        const intervalId = setInterval(() => {
            fetchEquipment();
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    const renderContent = (text, record, dataIndex) => {
        console.log(`Rendering ${dataIndex}: ${text}, screen sizes:`, screens);

        if (screens.xs) {
            return dataIndex === 'serialNumber' || dataIndex === 'status' ? text : null;
        }
        return text;
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90, marginRight: 8 }}>
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
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Tooltip title={text || ''}>
                    {text ? (text.toString().length > 10 ? `${text.toString().substring(0, 10)}...` : text) : '-'}
                </Tooltip>
            ) : (
                text || '-'
            ),
    });

    const handleMore = (record) => {
        console.log('Opening details for record:', record);
        setSelectedEquipment(record);
        setDetailsVisible(true);
    };



    const handleCloseDetails = () => {
        setDetailsVisible(false);
        setSelectedEquipment(null);
        fetchEquipment();
    };

    const handleDelete = async (serialNumber) => {
        try {
            await axiosInstance.delete(`/api/Equipment/${serialNumber}`);
            message.success('Equipment deleted successfully');
            fetchEquipment();
        } catch (error) {
            console.error('Error deleting equipment:', error);
            message.error('Failed to delete equipment');
        }
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

    const columns = [
        {
            title: 'Serial-Number',
            dataIndex: 'serialNumber',
            sorter: (a, b) => (a.serialNumber || '').localeCompare(b.serialNumber || ''),
            ...getColumnSearchProps('serialNumber'),
            render: (text, record) => renderContent(text, record, 'serialNumber'),
        },
        {
            title: 'Equipment Name',
            dataIndex: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
            ...getColumnSearchProps('name'),
            render: (text, record) => renderContent(text, record, 'name'),
        },
        {
            title: 'Employee',
            dataIndex: 'employee',
            sorter: (a, b) => (a.employee || '').localeCompare(b.employee || ''),
            ...getColumnSearchProps('employee'),
            render: (text, record) => renderContent(text, record, 'employee'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
            ...getColumnSearchProps('status'),
            render: (status, record) => {
                const content = renderContent(status, record, 'status');
                if (!content) return '-';

                let color = getStatusColor(status);
                return (
                    <Space>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, marginRight: '8px' }}></span>
                        {status || 'Unknown'}
                    </Space>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Flex gap="small">
                    <Tooltip title="More">
                        <Button icon={<MoreOutlined />} size="small" onClick={() => handleMore(record)} style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", color: isDarkMode ? "white" : "black" }} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm title="Are you sure to delete this equipment?" onConfirm={() => handleDelete(record.serialNumber)} okText="Yes" cancelText="No">
                            <Button icon={<DeleteOutlined />} size="small" danger style={{ backgroundColor: isDarkMode ? "#292A2A" : "white" }} />
                        </Popconfirm>
                    </Tooltip>
                </Flex>
            ),
        },
    ];

    return (
        <Flex style={{ width: '100%' }}>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{ responsive: true }}
                style={{ width: '100%' }}
            />
            <EqDetails
                visible={detailsVisible}
                equipment={selectedEquipment}
                onClose={handleCloseDetails}
            />
        </Flex>
    );
};

export default EqTable;
