import React from "react";
import { Button, Tooltip  } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useCollapsed } from "../../collapsedContext.jsx";
import './menuToggleButton.css';

const MenuToggleButton = () => {
    const { collapsed, setCollapsed } = useCollapsed();
    return(
        <Tooltip title={collapsed ? "Expand" : "Collapse"}>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} className="trigger-btn"/>
        </Tooltip>
    );
};
export default MenuToggleButton;