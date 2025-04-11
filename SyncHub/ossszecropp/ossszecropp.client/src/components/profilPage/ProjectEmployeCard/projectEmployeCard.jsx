import { Card, Tabs, Typography } from "antd";
import React from "react";
import ProjectTable from "./projectTable/projectTable";
import StaffTable from "./staffTable/staffTable";
import DocumentsTable from "./documentsTable/documentsTable";
import EquipmentsTable from "./equipmentsTable/equipmentsTable";
import { useTheme } from "../../../theme/themeContext";
import "./proEmpCard.css";

const ProjectEmployeCard = () => {
    const { isDarkMode } = useTheme();
    const items = [
        {
            key: '1',
            label: <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black" }}> Staff</Typography.Title>,
            children: <StaffTable />,
        },
        {
            key: '2',
            label: <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black" }}> Documents</Typography.Title>,
            children: <DocumentsTable />,
        },
        {
            key: '3',
            label: <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black" }}> Equipments</Typography.Title>,
            children: <EquipmentsTable />,
        },
    ];

    // In projectEmployeCard.jsx
    return (
        <div className={isDarkMode ? "dark-mode" : "light-mode"}>
        <Card style={{ width: '100%', maxWidth: '71vh', height: '100%', overflow: 'hidden', backgroundColor: isDarkMode ? "#292A2A" : "white", color: isDarkMode ? "white" : "black"}}>
            <Tabs items={items} style={{ width: '100%' }} tabBarStyle={{ width: '100%', height: '100%' }} />
            </Card>
        </div>
    )


}
export default ProjectEmployeCard;