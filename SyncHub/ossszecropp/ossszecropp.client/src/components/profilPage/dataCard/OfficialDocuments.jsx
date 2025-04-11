/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Row, Col, Card, Flex } from 'antd';

const OfficialDocuments = ({ employee }) => (
    <Flex justify="space-around">
        <Row gutter={16} justify="start" style={{ marginBottom: '0.5em', width: '100%' }}>
            <Col style={{ textAlign: 'center' }} xs={24} sm={12}>
                <Card style={{ border: "0px" }}>
                    <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                        Tax Number:
                    </Typography.Title>
                    <Typography.Text>
                        {employee?.taxNum || '-'}
                    </Typography.Text>
                </Card>
            </Col>
            <Col style={{ textAlign: 'center' }} xs={24} sm={12}>
                <Card style={{ border: "0px" }}>
                    <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                        ID Card Number:
                    </Typography.Title>
                    <Typography.Text>
                        {employee?.idCardNum || '-'}
                    </Typography.Text>
                </Card>
            </Col>
        </Row>
    </Flex>
);

OfficialDocuments.propTypes = {
    employee: PropTypes.shape({
        taxNum: PropTypes.string,
        idCardNum: PropTypes.string,
    }),
};

export default OfficialDocuments;
