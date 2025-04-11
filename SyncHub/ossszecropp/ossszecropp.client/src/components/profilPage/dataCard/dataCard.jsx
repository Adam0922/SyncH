/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axiosInstance from '../../../utils/axiosInstance';
import { Card, Typography, Row, Col, Button, Avatar, Tooltip, Spin, message, Flex } from "antd";
import { ContactsOutlined, CalendarOutlined, AppstoreOutlined, FolderOpenOutlined, HomeOutlined, LockOutlined, EditOutlined, BankOutlined, PictureOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import ContactInfo from './ContactInfo';
import PersonalInfo from './PersonalInfo';
import ProfileOverview from './ProfileOverview';
import OfficialDocuments from './OfficialDocuments';
import AddressInfo from './AddressInfo';
import NewPassword from "../newPassword/newPassword.jsx";
import ProfileEdit from '../../ProfileEdit/profileEdit.jsx';
import OwnComp from '../ownComp/ownComp.jsx';
import ProfilePics from '../profilePics/profilePics.jsx';
import moment from 'moment';
import { useTheme } from "../../../theme/themeContext";

const DataCard = ({ employeeData = null }) => {
    const [employee, setEmployee] = useState(employeeData);
    const [loading, setLoading] = useState(!employeeData);
    const [error, setError] = useState(null);
    const { isDarkMode } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState("Profile Overview");
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isProfileEditModalVisible, setIsProfileEditModalVisible] = useState(false);
    const [isCompanyModalVisible, setIsCompanyModalVisible] = useState(false);
    const [isProfilePicModalVisible, setIsProfilePicModalVisible] = useState(false);
    const navigate = useNavigate();

    const fetchEmployeeData = async () => {
        if (employeeData) {
            setEmployee(employeeData);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Try different endpoints in sequence
            let response;
            try {
                response = await axiosInstance.get('/api/Employees/current');
                console.log("Successfully fetched employee data:", response.data);
            } catch (err) {
                console.log("Failed to fetch from /current endpoint, trying profile...");
                try {
                    response = await axiosInstance.get('/api/Employees/profile');
                } catch (err2) {
                    console.log("Failed to fetch from profile endpoint, trying GetLoggedInUserData...");
                    response = await axiosInstance.get('/api/Employees/GetLoggedInUserData');
                }
            }

            if (response && response.data) {
                console.log("Employee data:", response.data);
                setEmployee(response.data);
            } else {
                throw new Error("No data returned from API");
            }
        } catch (error) {
            console.error("Error fetching employee data:", error);
            setError('Failed to fetch employee data. Please try again later.');
            message.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeData) {
            setEmployee(employeeData);
            setLoading(false);
        } else {
            fetchEmployeeData();
        }
    }, [employeeData]);

    const categories = [
        {
            key: "Contact Information",
            icon: <ContactsOutlined />,
            content: <ContactInfo employee={employee} />,
        },
        {
            key: "Personal Information",
            icon: <CalendarOutlined />,
            content: <PersonalInfo employee={employee} />,
        },
        {
            key: "Profile Overview",
            icon: <AppstoreOutlined />,
            content: <ProfileOverview employee={employee} />,
        },
        {
            key: "Official Documents",
            icon: <FolderOpenOutlined />,
            content: <OfficialDocuments employee={employee} />,
        },
        {
            key: "Address Information",
            icon: <HomeOutlined />,
            content: <AddressInfo employee={employee} />,
        },
    ];

    const handleCategoryChange = (key) => {
        setSelectedCategory(key);
    };

    const handleEdit = () => {
        setIsProfileEditModalVisible(true);
    };

    const showPasswordModal = () => {
        setIsPasswordModalVisible(true);
    };

    const handlePasswordCancel = () => {
        setIsPasswordModalVisible(false);
    };

    const handleProfileEditCancel = () => {
        setIsProfileEditModalVisible(false);
    };

    const showCompanyModal = () => {
        setIsCompanyModalVisible(true);
    };

    const handleCompanyCancel = () => {
        setIsCompanyModalVisible(false);
    };

    const showProfilePicModal = () => {
        setIsProfilePicModalVisible(true);
    };

    const handleProfilePicCancel = () => {
        setIsProfilePicModalVisible(false);
    };

    const handleProfilePicSuccess = () => {
        // Refresh the employee data to get the updated profile
        fetchEmployeeData();
        message.success('Profile picture updated successfully');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin>
                    <div style={{ padding: '50px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', minHeight: '200px', minWidth: '200px' }}>
                        {/* Empty div for Spin to wrap */}
                    </div>
                </Spin>
            </div>
        );
    }

    if (error) {
        return <Typography.Text type="danger">{error}</Typography.Text>;
    }

    if (!employee) {
        return <Typography.Text>Employee not found</Typography.Text>;
    }

    // Add this right before the return statement
    console.log("Job Title:", employee.jobTitle);
    console.log("Is CEO:", employee.jobTitle && employee.jobTitle.includes("vezet"));

    const isOtherEmployee = employeeData !== null;
    const profileTitle = isOtherEmployee
        ? `${employee.firstName} ${employee.lastName}'s Profile`
        : 'Profile';

    return (
        <Card style={{ width: '100%', maxWidth: '86vh', backgroundColor: isDarkMode? "#292A2A": "white", color: isDarkMode ? "white" : "dark" }}>
            <Row>
                <Col span={10}>
                    <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "dark" }}>
                        {profileTitle}
                    </Typography.Title>
                </Col>
                <Col span={4}>
                    <Typography.Text style={{ color: isDarkMode ? "white" : "dark" }} >
                        Created: {moment(employee.createdAt).format('MMMM Do YYYY')}
                    </Typography.Text>
                </Col>
                <Col span={10}>
                    <Flex justify="end" gap='small'>
                        <Button icon={<LockOutlined />} className="dataCardIcon" onClick={showPasswordModal} />
                        <Button icon={<EditOutlined />} className="dataCardIcon" onClick={handleEdit} />
                        <Button icon={<PictureOutlined />} className="dataCardIcon" onClick={showProfilePicModal} />
                        {employee.jobTitle && employee.jobTitle.includes("vezet") && (
                            <Button icon={<BankOutlined />} className="dataCardIcon" onClick={showCompanyModal} />
                        )}
                    </Flex>
                </Col>
            </Row>

            <Card style={{ marginTop: 16 }}>
                {categories.find((category) => category.key === selectedCategory)?.content}
            </Card>

            <Flex justify="center" align="center" gap='large' vertical>
                <Row style={{ width: '100%', marginTop: 16 }}>
                    <Col span={24}>
                        <Flex justify="center" gap='large'>
                            {categories.map((category) => (
                                <Tooltip key={category.key} title={category.key}>
                                    <Button
                                        icon={category.icon}
                                        className={`dataCardIcon ${selectedCategory === category.key ? 'selected' : ''}`}
                                        onClick={() => handleCategoryChange(category.key)}
                                    />
                                </Tooltip>
                            ))}
                        </Flex>
                    </Col>
                </Row>
            </Flex>

            <NewPassword visible={isPasswordModalVisible} onCancel={handlePasswordCancel} />
            <ProfileEdit
                visible={isProfileEditModalVisible}
                employee={employee}
                onClose={handleProfileEditCancel}
                onSuccess={fetchEmployeeData}
            />
            <OwnComp visible={isCompanyModalVisible} onClose={handleCompanyCancel} />
            <ProfilePics
                visible={isProfilePicModalVisible}
                onClose={handleProfilePicCancel}
                onSuccess={handleProfilePicSuccess}
            />
        </Card>
    );
};

export default DataCard;
