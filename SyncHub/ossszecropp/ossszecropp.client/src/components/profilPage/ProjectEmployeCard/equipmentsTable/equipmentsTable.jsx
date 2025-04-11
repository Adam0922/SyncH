import { Badge, Button, Flex, Input, Popconfirm, Space, Table, Tooltip, message } from "antd";
import { DeleteOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from '../../../../utils/axiosInstance';
import EqDetails from '../../../equipmentsPage/eqDetails/eqDetails';
import { useTheme } from "../../../../theme/themeContext";

const EquipmentsTable = () => {
    const { isDarkMode } = useTheme();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    useEffect(() => {
        fetchUserEquipment();
    }, []);

    const fetchUserEquipment = async () => {
        try {
            setLoading(true);

            // Get all equipment
            const response = await axiosInstance.get('/api/Equipment');
            console.log('Fetched all equipment:', response.data);

            // Get current user info
            const userResponse = await axiosInstance.get('/api/Employees/current');
            const currentUser = userResponse.data;
            console.log('Current user:', currentUser);

            // Filter equipment for the current user
            const userEquipment = Array.isArray(response.data)
                ? response.data.filter(item => {
                    // Check if the employee field matches the current user's email
                    return item.employee === currentUser.email;
                })
                : [];

            console.log('User equipment after filtering:', userEquipment);

            // Transform data to match column structure
            const formattedData = userEquipment.map(item => ({
                key: item.serialNumber,
                serialNumber: item.serialNumber || '',
                name: item.equipmentName || '',
                employee: item.employee || '',
                status: item.status || 'Unknown',
                category: item.category || '',
                warrantyExpiration: item.warrantyExpiration,
                lastServiceDate: item.lastServiceDate,
                purchaseDate: item.purchaseDate,
                remarks: item.remarks || ''
            }));

            console.log('Formatted equipment data for current user:', formattedData);
            setData(formattedData);
        } catch (error) {
            console.error('Error fetching user equipment:', error);
            message.error('Failed to load equipment data');
            setData([]);
        } finally {
            setLoading(false);
        }
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
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current?.select());
            }
        },
    });

    const handleMore = (record) => {
        console.log('View details:', record);
        setSelectedEquipment(record);
        setDetailsVisible(true);
    };

    const handleCloseDetails = () => {
        setDetailsVisible(false);
        setSelectedEquipment(null);
    };

    const handleUpdateEquipment = (updatedEquipment) => {
        console.log('Equipment updated:', updatedEquipment);
        // Update the equipment in the data array
        setData(prevData =>
            prevData.map(item =>
                item.serialNumber === updatedEquipment.serialNumber ?
                    {
                        ...item,
                        name: updatedEquipment.name,
                        status: updatedEquipment.status,
                        category: updatedEquipment.category,
                        warrantyExpiration: updatedEquipment.warrantyExpiration,
                        lastServiceDate: updatedEquipment.lastServiceDate,
                        purchaseDate: updatedEquipment.purchaseDate,
                        remarks: updatedEquipment.remarks
                    } : item
            )
        );
    };

    const handleDelete = async (serialNumber) => {
        try {
            await axiosInstance.delete(`/api/Equipment/${serialNumber}`);
            message.success('Equipment deleted successfully');
            // Remove the deleted equipment from the data array
            setData(prevData => prevData.filter(item => item.serialNumber !== serialNumber));
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
            title: 'Serial Number',
            dataIndex: 'serialNumber',
            sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
            ...getColumnSearchProps('serialNumber'),
            ellipsis: true, // Add ellipsis for long text
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            ...getColumnSearchProps('name'),
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            ...getColumnSearchProps('status'),
            render: (status) => {
                let color = getStatusColor(status);
                return (
                    <Space>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, marginRight: '8px' }}></span>
                        {status}
                    </Space>
                );
            },
        },
        {
            title: 'Category',
            dataIndex: 'category',
            sorter: (a, b) => a.category.localeCompare(b.category),
            ...getColumnSearchProps('category'),
            responsive: ['md'], // Only show on medium screens and larger
        },
        {
            title: 'Action',
            key: 'action',
            width: 100, // Fixed width for action column
            render: (_, record) => (
                <Flex gap="small">
                    <Tooltip title="Details">
                        <Button
                            icon={<MoreOutlined />}
                            size="small"
                            onClick={() => handleMore(record)}
                            style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", color: isDarkMode ? "white" : "dark" }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure to delete this equipment?"
                            onConfirm={() => handleDelete(record.serialNumber)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button icon={<DeleteOutlined />} size="small" danger style={{ backgroundColor: isDarkMode ? "#292A2A" : "white" }} />
                        </Popconfirm>
                    </Tooltip>
                </Flex>
            ),
        },
    ];


    // In equipmentsTable.jsx
    return (
        <Flex width='100%'>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                style={{ width: '100%', justifySelf: 'center' }}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 'max-content' }} // Add horizontal scrolling
                size="small" // Make the table more compact
            />
            {selectedEquipment && (
                <EqDetails
                    visible={detailsVisible}
                    equipment={selectedEquipment}
                    onClose={handleCloseDetails}
                    onUpdateEquipment={handleUpdateEquipment}
                />
            )}
        </Flex>
    );

};

export default EquipmentsTable;
