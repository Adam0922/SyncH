import React, { useState, useEffect } from "react";
import { Modal, Steps, Typography, Row, Col, Flex } from "antd";
import GeneralData from "./generalDataStep/generalData";
import CompanyData from "./companyData/companyData";
import axiosInstance from '../../../utils/axiosInstance';

const OwnComp = ({ visible, onClose }) => {
    const [current, setCurrent] = useState(0);
    const [percent, setPercent] = useState(0);
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Total fields across both forms for percentage calculation
    const totalFields = 11; // Adjust this based on the actual number of fields

    useEffect(() => {
        if (visible) {
            fetchCompanyData();
        }
    }, [visible]);

    const fetchCompanyData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/Company');
            if (response.data) {
                setCompanyData({
                    name: response.data.name,
                    cTaxNumber: response.data.cTaxNumber,
                    vatNumber: response.data.vatNumber,
                    registrationNumber: response.data.registrationNumber,
                    email: response.data.email,
                    phone: response.data.phone,
                    bankAccountNumber: response.data.bankAccountNumber,
                    country: response.data.country,
                    postalCode: response.data.postalCode,
                    city: response.data.city,
                    streetAddress: response.data.streetAddress
                });
            }
        } catch (error) {
            console.error('Error fetching company data:', error);
            // Initialize with empty data if not found
            setCompanyData({
                name: '',
                cTaxNumber: '',
                vatNumber: '',
                registrationNumber: '',
                email: '',
                phone: '',
                bankAccountNumber: '',
                country: '',
                postalCode: '',
                city: '',
                streetAddress: ''
            });
        } finally {
            setLoading(false);
        }
    };

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const updatePercent = (newPercent) => {
        setPercent(newPercent);
    };

    const steps = [
        {
            title: 'General Data',
            content: (
                <GeneralData
                    onNext={next}
                    onBack={onClose}
                    updatePercent={updatePercent}
                    totalFields={totalFields}
                    companyData={companyData}
                    setCompanyData={setCompanyData}
                />
            ),
        },
        {
            title: 'Company Data',
            content: (
                <CompanyData
                    onNext={onClose}
                    onBack={prev}
                    updatePercent={updatePercent}
                    totalFields={totalFields}
                    companyData={companyData}
                    setCompanyData={setCompanyData}
                />
            ),
        },
    ];

    return (
        <Modal
            title={<Typography.Title level={3}>Company Registration</Typography.Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Flex gap='0.1vh' justify='space-between' vertical>
                <Row style={{ marginTop: "1vh" }}>
                    <Col span={24}>
                        <Steps current={current} items={steps} />
                    </Col>
                </Row>
                <Row style={{ marginTop: "2vh" }}>
                    <Col span={24}>
                        <div className="steps-content">
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                            ) : (
                                steps[current].content
                            )}
                        </div>
                    </Col>
                </Row>
            </Flex>
        </Modal>
    );
};

export default OwnComp;
