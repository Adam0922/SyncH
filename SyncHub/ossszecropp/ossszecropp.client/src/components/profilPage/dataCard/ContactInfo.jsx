/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Row, Col, Card, Flex } from 'antd';

const ContactInfo = ({ employee }) => (
    <Flex justify="space-around">
        <Row gutter={16} justify="start" style={{ marginBottom: '0.5em', width: '100%' }}>
            <Col style={{ textAlign: 'center' }} xs={24} sm={12}>
                <Card style={{ border: "0px" }}>
                    <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                        Phone:
                    </Typography.Title>
                    <Typography.Text>
                        {employee?.phoneNumber || '-'}
                    </Typography.Text>
                </Card>
            </Col>
            <Col style={{ textAlign: 'center' }} xs={24} sm={12}>
                <Card style={{ border: "0px" }}>
                    <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                        Email:
                    </Typography.Title>
                    <Typography.Text>
                        {employee?.email || '-'}
                    </Typography.Text>
                </Card>
            </Col>
        </Row>
    </Flex>
);

ContactInfo.propTypes = {
    employee: PropTypes.shape({
        phoneNumber: PropTypes.string,
        email: PropTypes.string,
    }),
};

export default ContactInfo;
