import React, { useState, useEffect } from "react";
import DocsTable from "./docsTable/docsTable";
import { Content } from "antd/es/layout/layout";
import { Button, Card, Flex, Typography, message } from "antd";
import DocsAddNew from "./docsAddNew/docsAddNew.jsx";
import axios from "axios";
import "./docsTable/docsTab.css";
import { useTheme } from "../../theme/themeContext";

const DocsPageCnt = () => {
    const { isDarkMode } = useTheme();
    const [addNewVisible, setAddNewVisible] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/Documents');
            const formattedData = response.data.map(doc => ({
                key: doc.docID,
                documentId: doc.docID,
                name: doc.docName,
                type: doc.docType,
                createdBy: "System User", // This should be replaced with actual user info
                remarks: doc.docDescription,
                createdAt: new Date(doc.createdAt).toLocaleString(),
                lastUpdated: new Date(doc.lastUpdated).toLocaleString(),
                hasFile: doc.hasFile
            }));
            setData(formattedData);
        } catch (error) {
            console.error("Error fetching documents:", error);
            message.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDocument = (newDocument) => {
        fetchDocuments(); // Refresh the list after adding a new document
        setAddNewVisible(false);
    };

    const handleAddNewClose = () => {
        setAddNewVisible(false);
    };

    const handleAddNewClick = () => {
        setAddNewVisible(true);
    };

    return (
        <Content className="content">
            <Flex>
                <div className={isDarkMode ? "dark-mode" : "light-mode"}>
                    <Card style={{ width: '100%', height: '100%', backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
                        <Flex gap={"middle"} style={{ width: '100%', height: '100%' }} vertical>
                            <Flex justify="space-between" wrap="wrap">
                                <Typography.Title level={2} style={{ marginBottom: "1vh", marginTop: "1vh", color: isDarkMode ? "white" : "black" }}>Documents</Typography.Title>
                                <Button type="primary" onClick={handleAddNewClick}>
                                    Add New Document
                                </Button>
                            </Flex>
                            <DocsTable
                                data={data}
                                loading={loading}
                                onDataChange={fetchDocuments}
                            />
                        </Flex>
                    </Card>
                </div>
            </Flex>
            <DocsAddNew
                visible={addNewVisible}
                onAddDocuments={handleAddDocument}
                onClose={handleAddNewClose}
            />
        </Content>
    );
};

export default DocsPageCnt;
