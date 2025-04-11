import React, { useState, useEffect } from "react";
import { Button, Flex, Grid, Input, Popconfirm, Table, Tooltip, Space, message } from "antd";
import { MoreOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import DocsDetails from "../docsDetails/docsDetails.jsx";
import axios from "axios";
import axiosInstance from "../../../utils/axiosInstance.js";
import { useTheme } from "../../../theme/themeContext.jsx";

const { useBreakpoint } = Grid;

const DocsTable = ({ data: initialData, onDataChange }) => {
    const screens = useBreakpoint();
    const { isDarkMode } = useTheme();
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/Documents', {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('API response:', response.data); // Debug log

            const formattedData = response.data.map(doc => ({
                key: doc.docID,
                documentId: doc.docID,
                name: doc.docName,
                type: doc.docType,
                createdBy: doc.createdBy, // This should be replaced with actual user info
                remarks: doc.docDescription,
                createdAt: new Date(doc.createdAt).toLocaleString(),
                lastUpdated: new Date(doc.lastUpdated).toLocaleString(),
                hasFile: doc.hasFile
            }));
            setData(formattedData);
        } catch (error) {
            console.error("Error fetching documents:", error);
            // More detailed error logging
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("Request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
            message.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (text, record, dataIndex) => {
        if (screens.xs) {
            return dataIndex === 'documentId' || dataIndex === 'type' ? text : null;
        }
        if (screens.sm) {
            return dataIndex !== 'createdBy' ? text : null;
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
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
                    <Button
                        onClick={() => handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => document.querySelector('.ant-table-filter-dropdown input')?.select());
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Tooltip title={text}>
                    {text?.toString().length > 10 ? `${text.toString().substring(0, 10)}...` : text}
                </Tooltip>
            ) : (
                text
            ),
    });

    const handleMore = (record) => {
        setSelectedDocument(record);
        setDetailsVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/Documents/${id}`);
            message.success("Document deleted successfully");
            fetchDocuments(); // Refresh the list
        } catch (error) {
            console.error("Error deleting document:", error);
            message.error("Failed to delete document");
        }
    };

    const handleDownload = async (documentId, documentName) => {
        try {
            setDownloadLoading(true);
            message.loading({ content: 'Downloading document...', key: 'download' });

            // Make API request to download the document
            const response = await axiosInstance.get(`/api/Documents/${documentId}/download`, {
                responseType: 'blob' // Important: This tells axios to handle the response as a binary blob
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Create a temporary link element to trigger the download
            const link = document.createElement('a');
            link.href = url;

            // Try to get filename from Content-Disposition header
            const contentDisposition = response.headers['content-disposition'];
            let filename = documentName || `document-${documentId}`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Add file extension based on document type if not present
            if (!filename.includes('.')) {
                const docType = data.find(doc => doc.documentId === documentId)?.type?.toLowerCase();
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
            console.error('Error downloading document:', error);
            message.error({
                content: 'Failed to download document: ' + (error.response?.data?.message || error.message),
                key: 'download',
                duration: 3
            });
        } finally {
            setDownloadLoading(false);
        }
    };


    const handleCloseDetails = () => {
        setDetailsVisible(false);
        setSelectedDocument(null);
    };

    const handleDocumentUpdated = () => {
        fetchDocuments(); // Refresh the list after update
        setDetailsVisible(false);
    };

    const columns = [
        {
            title: 'Document ID',
            dataIndex: 'documentId',
            sorter: (a, b) => a.documentId - b.documentId,
            ...getColumnSearchProps('documentId'),
            render: (text, record) => renderContent(text, record, 'documentId'),
        },
        {
            title: 'Document Name',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            ...getColumnSearchProps('name'),
            render: (text, record) => renderContent(text, record, 'name'),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            sorter: (a, b) => a.type.localeCompare(b.type),
            ...getColumnSearchProps('type'),
            render: (text, record) => renderContent(text, record, 'type'),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (text, record) => renderContent(text, record, 'createdAt'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Flex gap="small">
                    <Tooltip title="More">
                        <Button
                            icon={<MoreOutlined />}
                            size="small"
                            onClick={() => handleMore(record)}
                            style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", color: isDarkMode ? "white" : "black" }}
                        />
                    </Tooltip>
                    <Tooltip title="Download">
                        <Button
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={() => handleDownload(record.documentId, record.name)}
                            style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", color: isDarkMode ? "white" : "black" }} 
                            disabled={!record.hasFile}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Popconfirm
                            title="Are you sure to delete this document?"
                            onConfirm={() => handleDelete(record.documentId)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ backgroundColor: isDarkMode ? "#292A2A" : "white", color: isDarkMode ? "white" : "black" }} 
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                style={{ boxShadow: 'none', backgroundColor: isDarkMode ? "#292A2A" : "white" }}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Flex>
            ),
        },
    ];

    return (
        <Flex style={{ width: '100%' }} vertical>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{ responsive: true }}
                style={{ width: '100%' }}
            />
            <DocsDetails
                visible={detailsVisible}
                documents={selectedDocument}
                onClose={handleCloseDetails}
                onDocumentUpdated={handleDocumentUpdated}
            />
        </Flex>
    );
};

export default DocsTable;
