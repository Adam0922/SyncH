/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Row, Col, Card, Flex } from 'antd';

const AddressInfo = ({ employee }) => (
    <Flex justify="space-around">
        <Row gutter={16} justify="start" style={{ marginBottom: '0.5em', width: '100%' }}>
            <Col style={{ textAlign: 'center' }} xs={24} sm={8}>
                <Card style={{ border: "0px" }}>
                    <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                        Country:
                    </Typography.Title>
                    <Typography.Text>
                        {employee?.country || '-'}
                    </Typography.Text>
                </Card>
            </Col>
            <Col style={{ textAlign: 'center' }} xs={24} sm={8}>
                <Card style={{ border: "0px" }}>
                    <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                        City:
                    </Typography.Title>
                    <Typography.Text>
                        {employee?.city || '-'}
                    </Typography.Text>
                </Card>
            </Col>
            <Col style={{ textAlign: 'center' }} xs={24} sm={8}>
                <Card style={{ border: "0px" }}>
                    <Typography.Title level={5} style={{ marginBottom: '0.2em' }}>
                        Street Address:
                    </Typography.Title>
                    <Typography.Text>
                        {employee?.streetAddress || '-'}
                    </Typography.Text>
                </Card>
            </Col>
        </Row>
    </Flex>
);

AddressInfo.propTypes = {
    employee: PropTypes.shape({
        country: PropTypes.string,
        city: PropTypes.string,
        streetAddress: PropTypes.string,
    }),
};

export default AddressInfo;
