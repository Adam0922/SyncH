//// eslint-disable-next-line no-unused-vars
//import React, { useEffect, useState } from "react";
//import { Button, Flex, Layout, Typography } from "antd";
//const { Header } = Layout;
//import "./header.css";
//import { BellOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
//import { useNavigate } from "react-router-dom";
//import axios from "axios";

//const CostumeHeader = () => {
//    const navigate = useNavigate();
//    const [fullName, setFullName] = useState("");

//    useEffect(() => {
//        const fetchFullName = async () => {
//            try {
//                const response = await axios.get("/api/employees/profile");
//                const { firstName, middleName, lastName } = response.data;
//                const fullName = `${firstName} ${middleName ? middleName + " " : ""}${lastName}`;
//                setFullName(fullName);
//            } catch (error) {
//                console.error("Error fetching full name:", error);
//            }
//        };

//        fetchFullName();
//    }, []);

//    const handleProfile = () => {
//        navigate('/profile');
//    };

//    return (
//        <Header className="header">
//            <Flex align="center" justify="space-between">
//                <Typography.Title level={3} className="wlc-typ">
//                    Welcome back, {fullName}!
//                </Typography.Title>
//                <Flex align="center" gap="3rem" style={{ marginTop: -5 }}>
//                    <Flex align="center" gap="10px">
//                        <Button icon={<BellOutlined />} className="notificationBtn" />
//                        <Button icon={<SettingOutlined />} className="settingsBtn" />
//                        <Button icon={<UserOutlined />} className="avatarBtn" onClick={handleProfile} />
//                    </Flex>
//                </Flex>
//            </Flex>
//        </Header>
//    );
//};

//export default CostumeHeader;
