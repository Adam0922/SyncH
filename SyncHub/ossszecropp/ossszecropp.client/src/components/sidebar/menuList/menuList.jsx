import { Menu } from "antd";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from "../../../theme/themeContext.jsx";
import {HomeOutlined, ProjectOutlined, TeamOutlined, ProductOutlined, BankOutlined, ToolOutlined, FileOutlined, UserOutlined} from '@ant-design/icons';

const MenuList = ({ mode }) => {
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const menuItems = [
        {
            key: '/home',
            icon: <HomeOutlined />,
            label: <Link to="/home">Home</Link>,
        },
        {
            key: '/employees',
            icon: <TeamOutlined />,
            label: <Link to="/employees">Employees</Link>,
        },
        {
            key: '/products',
            icon: <ProductOutlined />,
            label: <Link to="/services">Services</Link>,
        },
        {
            key: '/finance',
            icon: <BankOutlined/>,
            label: <Link to="/finance">Finance</Link>,
        },
        {
            key: '/equipments',
            icon: <ToolOutlined />,
            label: <Link to="/equipments">Equipments</Link>,
        },
        {
            key: '/documents',
            icon: <FileOutlined />,
            label: <Link to="/documents">Documents</Link>,
        },
    ];

    if (isMobile) {
        menuItems.push({
            key: '/profile',
            icon: <UserOutlined />,
            label: <Link to="/profile">Profile</Link>,
        });
    }

    return (
        <Menu mode={mode} selectedKeys={[location.pathname]} className="menu-bar" items={menuItems} theme={isDarkMode ? "dark" : "light"} style={{ backgroundColor: isDarkMode ? "#292A2A" : "white" }}/>
    );
};

export default MenuList;
