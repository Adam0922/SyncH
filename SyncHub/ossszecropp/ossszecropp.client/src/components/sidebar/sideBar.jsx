import "./sideBar.css";
import Logo from "./logo/logo.jsx";
import React from "react";
import { Layout } from 'antd';
const { Sider } = Layout;
import MenuList from "./menuList/menuList.jsx";
import { useTheme } from "../../theme/themeContext.jsx";
import { useCollapsed } from "../../collapsedContext.jsx";
import MenuToggleBtn from "../menuToggel/menuToggleButton.jsx";

const SideBar = () => {
    const { isDarkMode } = useTheme();
    const { collapsed } = useCollapsed();

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="sider"
            theme={isDarkMode ? "dark" : "light"}
            style={{ backgroundColor: isDarkMode ? "#292A2A" : "white" }}
        >
            <Logo />
            <MenuList mode="inline" />
            <MenuToggleBtn />
        </Sider>
    );
};

export default SideBar;

