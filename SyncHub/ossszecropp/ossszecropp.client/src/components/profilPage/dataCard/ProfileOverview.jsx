import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Typography, Row, Col, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axiosInstance from '../../../utils/axiosInstance';

const ProfileOverview = ({ employee }) => {
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

    useEffect(() => {
        // Always try to fetch the profile photo when the component mounts
        fetchProfilePhoto();
    }, []);

    const fetchProfilePhoto = async () => {
        try {
            const response = await axiosInstance.get('/api/Employees/profile-photo', {
                responseType: 'blob'
            });

            // Create a URL for the blob
            const url = URL.createObjectURL(response.data);
            setProfilePhotoUrl(url);
        } catch (error) {
            console.error('Error fetching profile photo:', error);
            // Don't show error message to user, just silently fail and use default avatar
        }
    };

    return (
        <Flex vertical align="center">
            <Row>
                <Col span={24}>
                    <Avatar
                        style={{ width: '15vh', height: '15vh' }}
                        size={64}
                        src={profilePhotoUrl}
                        icon={!profilePhotoUrl && <UserOutlined />}
                    >
                        {!profilePhotoUrl && employee?.firstName ? employee.firstName[0] : ''}
                    </Avatar>
                </Col>
            </Row>
            <Row style={{ marginTop: '1vh' }}>
                <Col span={24}>
                    <Typography.Title level={3}>
                        {`${employee?.firstName || 'N/A'} ${employee?.lastName || ''}`}
                    </Typography.Title>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Typography.Text style={{ fontSize: '2vh' }}>
                        {employee?.email || '-'}
                    </Typography.Text>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Typography.Text style={{ fontSize: '1.6vh' }}>
                        {employee?.jobTitle || '-'}
                    </Typography.Text>
                </Col>
            </Row>
        </Flex>
    );
};

ProfileOverview.propTypes = {
    employee: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        email: PropTypes.string,
        jobTitle: PropTypes.string,
        idCardNum: PropTypes.string,
    }),
};

export default ProfileOverview;
