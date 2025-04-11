import { Avatar, Flex, Table, Tooltip, Typography, Input, Space, Button } from "antd";
import { MoreOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useState, useRef } from "react";

const ProjectTable = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

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
                    placeholder={`Keresés ${dataIndex}`}
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
                        Keresés
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current?.select());
            }
        },
    });

    const dataSources = [
        {
            id: '1',
            name: 'Füli baszás',
            status: 'In progress',
            team: 
                <Avatar.Group maxCount={3} max={{ count: 3 }}>
                    <Tooltip>
                        <Avatar/>
                    </Tooltip>
                    <Tooltip>
                        <Avatar/>
                    </Tooltip>
                    <Tooltip>
                        <Avatar/>
                    </Tooltip>
                    <Tooltip>
                        <Avatar/>
                    </Tooltip>
                    <Tooltip>
                        <Avatar/>
                    </Tooltip>
                </Avatar.Group>,
            action: <MoreOutlined/>
        },
    ];

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            ...getColumnSearchProps('id'),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            ...getColumnSearchProps('status'),
        },
        {
            title: 'Team',
            dataIndex: 'team',
            key: 'team',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
        },
    ];

    return(
        <Flex width='100%'>
            <Table 
                columns={columns} 
                style={{ width: '100%', justifySelf: 'center'}} 
                dataSource={dataSources}
            />
        </Flex>
    );
};

export default ProjectTable;