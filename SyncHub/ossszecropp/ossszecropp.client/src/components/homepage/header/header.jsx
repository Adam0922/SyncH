// eslint-disable-next-line no-unused-vars
import "./header.css";
const { Header } = Layout;
import Logo from "../../sidebar/logo/logo.jsx";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useTheme } from '../../../theme/themeContext.jsx';
import { Button, Flex, Layout, Typography } from "antd";
import MenuList from "../../sidebar/menuList/menuList.jsx";
import { DownCircleOutlined, UpCircleOutlined, UserOutlined } from "@ant-design/icons";
import axiosInstance from "../../../utils/axiosInstance"; // Use the axiosInstance instead of axios

const CostumeHeader = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [fullName, setFullName] = useState("");

    useEffect(() => {
	    //const handleResize = () => {
     //       setIsMobile(window.innerWidth < 768);
     //   };
     //   window.addEventListener('resize', handleResize);
     //   return () => {
     //       window.removeEventListener('resize', handleResize);
     //   };
        const storedFullName = localStorage.getItem('fullName');
        if (storedFullName) {
            setFullName(storedFullName);
        } else {
            const fetchFullName = async () => {
                try {
                    const response = await axiosInstance.get("/api/Employees/current");
                    // Make sure we're extracting the correct fields
                    const { firstName, middleName, lastName } = response.data;

                    // Create the full name with just the name parts
                    const fullName = `${firstName || ""} ${middleName ? middleName + " " : ""}${lastName || ""}`.trim();

                    setFullName(fullName);
                    localStorage.setItem('fullName', fullName); // Store full name in local storage
                } catch (error) {
                    console.error("Error fetching full name:", error);
                }
            };

            fetchFullName();
        }
    }, []);

    const handleProfile = () => {
        navigate('/profile');
    };

    const handleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
        <Header className="header" style={{ padding: 0, backgroundColor: [ isDarkMode ? "#292A2A" : "white" ] }}>
            <Flex align="center" justify="space-between" className="flex-container">
                {isMobile && ( <Logo />)}
                <Typography.Title level={3} className="wlc-typ" style={{ color: isDarkMode ? "white" : "black" }}>
                    Welcome back, {fullName}!
                </Typography.Title>
                <Flex align="center" gap="3rem" className="flex-item">
                    <Flex align="center" gap="10px">
                        <Button icon={<UserOutlined />} className="avatarBtn" onClick={handleProfile} />
                        {isMobile && (
                            <Button icon={isMenuOpen ? <UpCircleOutlined /> : <DownCircleOutlined />} style={{ border: "none", boxShadow: "none" }} className="mobileNavBarToggleBtn" onClick={handleMenu} />
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </Header>
        {isMenuOpen && <MenuList mode="vertical" />}
        </>
    );
};

export default CostumeHeader;
