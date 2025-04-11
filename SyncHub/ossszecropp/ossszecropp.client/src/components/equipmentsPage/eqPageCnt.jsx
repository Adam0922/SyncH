import React, { useState, useEffect } from "react";
import { Content } from "antd/es/layout/layout";
import { Button, Card, Flex, Typography } from "antd";
import EqTable from "./eqTable/eqTable";
import EqAddNew from "./eqAddNew/eqAddNew";
import { useTheme } from "../../theme/themeContext";
import "./eqTable/eqTab.css";

const EqPageCnt = () => {
    const { isDarkMode } = useTheme();
    const [addNewVisible, setAddNewVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddNew = () => {
        setAddNewVisible(true);
    };

    const handleAddNewClose = () => {
        setAddNewVisible(false);
    };

    const handleAddEquipment = (newEquipment) => {
        console.log('New equipment added:', newEquipment);
        // Force a re-render of the table by changing the key
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <Content className="content">
            <Flex>
                <div className={isDarkMode ? "dark-mode" : "light-mode"}>
                    <Card style={{ width: '100%', height: '100%', backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
                        <Flex vertical gap={'small'} style={{ width: "100%", height: "100%" }}>
                            <Flex justify="space-between" wrap="wrap">
                                <Typography.Title level={2} style={{ marginBottom: "1vh", marginTop: "1vh", color: isDarkMode ? "white" : "black" }}>Equipments</Typography.Title>
                                <Button type="primary" onClick={handleAddNew}>Add New Equipment</Button>
                            </Flex>
                            <Flex>
                                {/* Using key to force re-render when new equipment is added */}
                                <EqTable key={refreshKey} />
                            </Flex>
                        </Flex>
                    </Card>
                </div>
            </Flex>
            <EqAddNew visible={addNewVisible} onClose={handleAddNewClose} onAddEquipment={handleAddEquipment} />
        </Content>
    );
};

export default EqPageCnt;
