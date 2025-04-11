/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Flex, Row, Col, Card } from 'antd';

const PersonalInfo = ({ employee }) => {
    // Format the date to show only yyyy-mm-dd
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // If it's already in ISO format, just take the first 10 characters
        if (typeof dateString === 'string' && dateString.includes('T')) {
            return dateString.substring(0, 10);
        }
        // If it's a Date object or another format, convert to ISO and take first 10 chars
        try {
            const date = new Date(dateString);
            return date.toISOString().substring(0, 10);
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString; // Return original if parsing fails
        }
    };

    return (
        <Flex justify="space-around">
            <Row gutter={16} justify="start" style={{ marginBottom: '0.5em' }}>
                <Col style={{ textAlign: 'center' }}>
                    <Card style={{ border: "0px" }}>
                        <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                            Birthplace:
                        </Typography.Title>
                        <Typography.Text>
                            {employee?.placeOfBirth || '-'}
                        </Typography.Text>
                    </Card>
                </Col>
                <Col style={{ textAlign: 'center' }}>
                    <Card style={{ border: "0px" }}>
                        <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                            Birthdate:
                        </Typography.Title>
                        <Typography.Text>
                            {formatDate(employee?.dateOfBirth) || '-'}
                        </Typography.Text>
                    </Card>
                </Col>
            </Row>
        </Flex>
    );
};


PersonalInfo.propTypes = {
    employee: PropTypes.shape({
        placeOfBirth: PropTypes.string,
        dateOfBirth: PropTypes.string,
    }),
};

export default PersonalInfo;
