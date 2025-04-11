import React, { useState, useEffect } from "react";
import { Flex, Input, Modal, Typography, Button, Form, Col, Row, Dropdown, Menu, ConfigProvider, message } from "antd";
import { useTheme } from "../../../../theme/themeContext";
import axios from 'axios';

const AddNewInc = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [companies, setCompanies] = useState([]);

    // Fetch services and companies when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch services
                const servicesResponse = await axios.get('/api/Services');
                setServices(servicesResponse.data.map(service => ({
                    value: service.serviceID,
                    label: service.serviceName
                })));

                // Fetch companies (assuming you have a Companies API)
                const companiesResponse = await axios.get('/api/Companies');
                setCompanies(companiesResponse.data.map(company => ({
                    value: company.companyID,
                    label: company.companyName
                })));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const incomeData = {
                invoiceNumber: values.invoiceNumber || '',
                companyID: values.company,
                serviceID: parseInt(values.service),
                price: parseFloat(values.price),
                invoiceDate: values.invoiceDate,
                dueDate: values.dueDate || values.invoiceDate,
                paymentStatus: values.status,
                paymentMethod: values.paymentMethod,
                description: values.description || '',
                quantity: values.quantity ? parseInt(values.quantity) : 1,
                taxRate: values.taxRate ? parseFloat(values.taxRate) : 0,
                taxAmount: values.taxAmount ? parseFloat(values.taxAmount) : 0,
                totalAmount: parseFloat(values.totalAmount || values.price),
                notes: values.notes || '',
            };

            await axios.post('/api/income', incomeData);

            message.success('Income added successfully!');
            form.resetFields();
            onCancel(true); // Pass true to indicate success and refresh the list
        } catch (error) {
            console.error("Error adding income:", error);
            message.error('Failed to add income. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceMenuClick = (service) => {
        form.setFieldsValue({ service: service.value });
        setSelectedService(service.label);
    };

    const handleStatusMenuClick = (status) => {
        form.setFieldsValue({ status: status.label });
        setSelectedStatus(status.label);
    };

    const handlePaymentMethodMenuClick = (paymentMethod) => {
        form.setFieldsValue({ paymentMethod: paymentMethod.label });
        setSelectedPaymentMethod(paymentMethod.label);
    };

    const handleCompanyMenuClick = (company) => {
        form.setFieldsValue({ company: company.value });
        setSelectedCompany(company.label);
    };

    // Fallback services if API fails
    const fallbackServices = [
        { value: '1', label: 'Consulting' },
        { value: '2', label: 'Development' },
        { value: '3', label: 'Maintenance' },
    ];

    // Fallback companies if API fails
    const fallbackCompanies = [
        { value: 'C001', label: 'Company A' },
        { value: 'C002', label: 'Company B' },
        { value: 'C003', label: 'Company C' },
    ];

    const paymentMethods = [
        { value: 'Cash', label: 'Cash' },
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Credit Card', label: 'Credit Card' },
    ];

    const status = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Overdue', label: 'Overdue' },
    ];

    return (
        <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? "#292A2A" : "white", colorText: isDarkMode ? "white" : "black", colorBorder: isDarkMode ? "#515151" : "white" } }}>
            <Modal open={visible} onCancel={() => onCancel(false)} width='70vh' footer={[
                <Button key="cancel" onClick={() => onCancel(false)} style={{ boxShadow: "none" }}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSave} loading={loading} style={{ boxShadow: "none" }}>
                    Save
                </Button>]}
            >
                <Form form={form} style={{ width: "100%" }}>
                    <Typography.Title level={3}>Add New Income</Typography.Title>
                    <Flex style={{ width: "100%", marginBottom: '5vh' }} wrap="wrap" gap='5vh'>
                        <Row gutter={10} layout="horizontal" style={{ width: "100%", marginBottom: '2vh' }}>
                            <Col span={6}>
                                <Form.Item name="status" label={<Typography style={{ fontWeight: "bold" }}>Status</Typography>} rules={[{ required: true, message: 'Please fill Status' }]} layout="vertical">
                                    <Dropdown overlay={
                                        <Menu>
                                            {status.map(status => (
                                                <Menu.Item key={status.value} onClick={() => handleStatusMenuClick(status)}>
                                                    {status.label}
                                                </Menu.Item>
                                            ))}
                                        </Menu>
                                    }>
                                        <Input placeholder="Status" readOnly value={selectedStatus || form.getFieldValue('status')} />
                                    </Dropdown>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="service" label={<Typography style={{ fontWeight: "bold" }}>Service</Typography>} rules={[{ required: true, message: 'Please fill Service' }]} layout="vertical">
                                    <Dropdown overlay={
                                        <Menu>
                                            {(services.length > 0 ? services : fallbackServices).map(service => (
                                                <Menu.Item key={service.value} onClick={() => handleServiceMenuClick(service)}>
                                                    {service.label}
                                                </Menu.Item>
                                            ))}
                                        </Menu>
                                    }>
                                        <Input placeholder="Services" readOnly value={selectedService || form.getFieldValue('service')} />
                                    </Dropdown>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="paymentMethod" label={<Typography style={{ fontWeight: "bold" }}>Payment Method</Typography>} rules={[{ required: true, message: 'Please fill Payment Method' }]} layout="vertical">
                                    <Dropdown overlay={
                                        <Menu>
                                            {paymentMethods.map(paymentMethod => (
                                                <Menu.Item key={paymentMethod.value} onClick={() => handlePaymentMethodMenuClick(paymentMethod)}>
                                                    {paymentMethod.label}
                                                </Menu.Item>
                                            ))}
                                        </Menu>
                                    }>
                                        <Input placeholder="Payment Method" readOnly value={selectedPaymentMethod || form.getFieldValue('paymentMethod')} />
                                    </Dropdown>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="company" label={<Typography style={{ fontWeight: "bold" }}>Company</Typography>} rules={[{ required: true, message: 'Please fill Company' }]} layout="vertical">
                                    <Dropdown overlay={
                                        <Menu>
                                            {(companies.length > 0 ? companies : fallbackCompanies).map(company => (
                                                <Menu.Item key={company.value} onClick={() => handleCompanyMenuClick(company)}>
                                                    {company.label}
                                                </Menu.Item>
                                            ))}
                                        </Menu>
                                    }>
                                        <Input placeholder="Company" readOnly value={selectedCompany || form.getFieldValue('company')} />
                                    </Dropdown>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={10} layout="horizontal" style={{ width: "100%", marginBottom: '1vh' }}>
                            <Col span={6}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Invoice Date</Typography>} name="invoiceDate" rules={[{ required: true, message: "Please input Invoice Date" }]} layout="vertical">
                                    <Input type="date" placeholder="Invoice Date" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Due Date</Typography>} name="dueDate" layout="vertical">
                                    <Input type="date" placeholder="Due Date" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Invoice Number</Typography>} name="invoiceNumber" rules={[{ required: true, message: "Please input Invoice Number" }]} layout="vertical">
                                    <Input type="text" placeholder="Invoice Number" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Price</Typography>} name="price" rules={[{ required: true, message: "Please input Price" }]} layout="vertical">
                                    <Input type="number" step={0.01} suffix='Ft' placeholder="Price" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={10} layout="horizontal" style={{ width: "100%", marginBottom: '1vh' }}>
                            <Col span={6}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Recipient Name</Typography>} name="recipientName" layout="vertical">
                                    <Input type="text" placeholder="Recipient Name" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Tax Amount</Typography>} name="taxAmount" layout="vertical">
                                    <Input type="number" step={0.01} suffix='Ft' maxLength={20} placeholder="Tax Amount" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Total Amount</Typography>} name="totalAmount" rules={[{ required: true, message: 'Please fill Total Amount' }]} layout="vertical">
                                    <Input type="number" step={0.01} suffix='Ft' maxLength={20} placeholder="Total Amount" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Tax Rate</Typography>} name="taxRate" layout="vertical">
                                    <Input type="number" suffix='%' maxLength={20} placeholder="Tax Rate" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={10} layout="horizontal" style={{ width: "100%", marginBottom: '1vh' }}>
                            <Col span={8}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Quantity</Typography>} name="quantity" layout="vertical">
                                    <Input type="number" maxLength={20} placeholder="Quantity" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Description</Typography>} name="description" layout="vertical">
                                    <Input type="text" placeholder="Description" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Notes</Typography>} name="notes" layout="vertical">
                                    <Input type="text" placeholder="Notes" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Flex>
                </Form>
            </Modal>
        </ConfigProvider>
    );
}

export default AddNewInc;
