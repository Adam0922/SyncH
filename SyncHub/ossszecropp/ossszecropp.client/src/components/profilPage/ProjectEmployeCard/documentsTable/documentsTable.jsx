import { Button, Flex, Input, Table, Tooltip, message } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import axiosInstance from "../../../../utils/axiosInstance";
import { useTheme } from "../../../../theme/themeContext";

const DocumentsTable = ({ employeeId }) => {
    const { isDarkMode } = useTheme();
    const [documents, setDocuments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const searchInput = useRef(null);

    useEffect(() => {
        // First, get the current user's email
        getCurrentUserEmail();
    }, []);

    useEffect(() => {
        // Only fetch documents once we have the user's email
        if (currentUserEmail) {
            fetchUserDocuments();
        }
    }, [currentUserEmail, employeeId]);

    const getCurrentUserEmail = async () => {
        try {
            // Get the current user's profile information using the correct endpoint
            const response = await axiosInstance.get('/api/employees/current');

            if (response.data && response.data.email) {
                setCurrentUserEmail(response.data.email);
            } else {
                console.error('Could not retrieve user email from profile');
                message.error('Could not retrieve your user information');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            message.error('Failed to load your profile information');
        }
    };


    const fetchUserDocuments = async () => {
        try {
            setLoading(true);
            // Get all documents
            const response = await axios.get('/api/Documents');

            if (!response.data || !Array.isArray(response.data)) {
                console.error('Invalid response format:', response.data);
                setDocuments([]);
                return;
            }

            // Filter documents where CreatedBy matches the current user's email
            const userDocuments = response.data
                .filter(doc => doc.createdBy === currentUserEmail)
                .map(doc => ({
                    key: doc.docID,
                    docuid: doc.docID,
                    docutitle: doc.docName,
                    docudesc: doc.docDescription,
                    docutype: doc.docType,
                    createdAt: new Date(doc.createdAt).toLocaleString(),
                    hasFile: doc.hasFile
                }));


            setDocuments(userDocuments);
        } catch (error) {
            console.error('Error fetching documents:', error);
            message.error('Failed to load your documents');
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (record) => {
        try {
            message.loading({ content: 'Downloading document...', key: 'download' });
            const response = await axiosInstance.get(`/api/Documents/${record.docuid}/download`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Try to get filename from Content-Disposition header
            const contentDisposition = response.headers['content-disposition'];
            let filename = record.docutitle || `document-${record.docuid}`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Add file extension based on document type if not present
            if (!filename.includes('.')) {
                const docType = record.docutype?.toLowerCase();
                if (docType === 'pdf') {
                    filename += '.pdf';
                } else if (docType === 'word') {
                    filename += '.docx';
                } else if (docType === 'excel') {
                    filename += '.xlsx';
                } else if (docType === 'powerpoint') {
                    filename += '.pptx';
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success({ content: 'Document downloaded successfully', key: 'download', duration: 2 });
        } catch (error) {
            console.error('Error downloading file:', error);
            message.error({
                content: 'Failed to download document: ' + (error.response?.data?.message || error.message),
                key: 'download',
                duration: 3
            });
        }
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
        filterDropdownProps: {
            onOpenChange: (visible) => {
                if (visible) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
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
            title: 'ID',
            dataIndex: 'docuid',
            sorter: (a, b) => a.docuid - b.docuid,
        },
        {
            title: 'Title',
            dataIndex: 'docutitle',
            sorter: (a, b) => a.docutitle.localeCompare(b.docutitle),
            ...getColumnSearchProps('docutitle'),
        },
        {
            title: 'Type',
            dataIndex: 'docutype',
            sorter: (a, b) => a.docutype.localeCompare(b.docutype),
            ...getColumnSearchProps('docutype'),
        },
        {
            title: 'Description',
            dataIndex: 'docudesc',
            sorter: (a, b) => (a.docudesc || '').localeCompare(b.docudesc || ''),
            ...getColumnSearchProps('docudesc'),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Flex gap="small">
                    <Tooltip title="Download">
                        <Button
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={() => downloadFile(record)}
                            disabled={!record.hasFile}
                            style={{ boxShadow: 'none', backgroundColor: isDarkMode ? "#292A2A" : "white", color: isDarkMode ? "white" : "dark" }}
                        />
                    </Tooltip>
                </Flex>
            ),
        },
    ];

    return (
        <Flex width='100%'>
            <Table
                columns={columns}
                dataSource={documents}
                style={{ width: '100%', justifySelf: 'center' }}
                rowKey="docuid"
                loading={loading}
                pagination={{ responsive: true }}
                scroll={{ x: 'max-content' }}
            />
        </Flex>
    );
};

export default DocumentsTable;
