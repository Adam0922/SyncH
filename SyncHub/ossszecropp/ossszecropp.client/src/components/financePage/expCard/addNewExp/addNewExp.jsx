import React, { useState } from "react";
import { Flex, Input, Modal, Typography, Button, Form, Col, Row, Dropdown, Menu, ConfigProvider, message } from "antd";
import { useTheme } from "../../../../theme/themeContext";
import axios from 'axios';

const AddNewExp = ({ visible, onCancel }) => {
    const { isDarkMode } = useTheme();
    const [form] = Form.useForm();
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const expenseData = {
                expenseDate: values.expenseDate,
                amount: parseFloat(values.amount),
                description: values.description || '',
                category: values.category,
                paymentMethod: values.paymentMethod,
                paymentStatus: values.status,
                dueDate: values.dueDate || null,
                recipientName: values.recipientName || '',
                recipientTaxNumber: values.taxNumber || '',
                invoiceNumber: values.invoiceNumber || '',
            };

await axios.post('/api/Expenses', expenseData);

message.success('Expense added successfully!');
form.resetFields();
onCancel(true); // Pass true to indicate success and refresh the list
        } catch (error) {
    console.error("Error adding expense:", error);
    message.error('Failed to add expense. Please try again.');
} finally {
    setLoading(false);
}
    };

const handleCategoryMenuClick = (category) => {
    form.setFieldsValue({ category: category.label });
    setSelectedCategory(category.label);
};

const handleStatusMenuClick = (status) => {
    form.setFieldsValue({ status: status.label });
    setSelectedStatus(status.label);
};

const handlePaymentMethodMenuClick = (paymentMethod) => {
    form.setFieldsValue({ paymentMethod: paymentMethod.label });
    setSelectedPaymentMethod(paymentMethod.label);
};

const categorys = [
    { value: 'Salary', label: 'Salary' },
    { value: 'Service', label: 'Service' },
    { value: 'Tax', label: 'Tax' },
    { value: 'Bill', label: 'Bill' },
    { value: 'Office Supplies', label: 'Office Supplies' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Rent', label: 'Rent' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Other', label: 'Other' },
];

const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Debit Card', label: 'Debit Card' },
    { value: 'Check', label: 'Check' },
];

const status = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Overdue', label: 'Overdue' },
];

return (
    <ConfigProvider theme={{ token: { colorBgBase: isDarkMode ? "#292A2A" : "white", colorText: isDarkMode ? "white" : "black", colorBorder: isDarkMode ? "#515151" : "white" } }}>
        <Modal open={visible} onCancel={() => onCancel(false)} width='50vh' footer={[
            <Button key="cancel" onClick={() => onCancel(false)} style={{ boxShadow: "none" }}>
                Cancel
            </Button>,
            <Button key="save" type="primary" onClick={handleSave} loading={loading} style={{ boxShadow: "none" }}>
                Save
            </Button>]}
        >
            <Form form={form} style={{ width: "100%" }}>
                <Typography.Title level={3}>Add New Expense</Typography.Title>
                <Flex style={{ width: "100%", marginBottom: '5vh' }} wrap="wrap" gap='large'>
                    <Row gutter={10} layout="horizontal" style={{ width: "100%", marginBottom: form.getFieldsError().some(field => field.errors.length > 0) ? "5vh" : "0px" }}>
                        <Col span={8}>
                            <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Expense Date</Typography>} name="expenseDate" rules={[{ required: true, message: "Please input Expense Date" }]} layout="vertical">
                                <Input type="date" placeholder="Expenses Date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Amount</Typography>} name="amount" rules={[{ required: true, message: "Please input Amount" }]} layout="vertical">
                                <Input type="number" step={0.01} suffix='Ft' />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Due Date</Typography>} name="dueDate" layout="vertical">
                                <Input type="date" placeholder="Due Date" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={10} layout="horizontal" style={{ width: "100%", marginBottom: form.getFieldsError().some(field => field.errors.length > 0) ? "5vh" : "0px" }}>
                        <Col span={8}>
                            <Form.Item name="category" label={<Typography style={{ fontWeight: "bold" }}>Category</Typography>} rules={[{ required: true, message: 'Please fill Category' }]} layout="vertical">
                                <Dropdown overlay={
                                    <Menu>
                                        {categorys.map(category => (
                                            <Menu.Item key={category.value} onClick={() => handleCategoryMenuClick(category)}>
                                                {category.label}
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                }>
                                    <Input placeholder="Category" readOnly value={selectedCategory || form.getFieldValue('category')} />
                                </Dropdown>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
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
                        <Col span={8}>
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
                    </Row>
                    <Row gutter={10} layout="horizontal" style={{ width: "100%" }}>
                        <Col span={8}>
                            <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Recipient Name</Typography>} name="recipientName" layout="vertical">
                                <Input type="text" placeholder="Recipient Name" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Tax Number</Typography>} name="taxNumber" layout="vertical">
                                <Input type="text" maxLength={20} placeholder="Tax Number" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Invoice Number</Typography>} name="invoiceNumber" layout="vertical">
                                <Input type="text" placeholder="Invoice Number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={10} layout="horizontal" style={{ width: "100%" }}>
                        <Col span={24}>
                            <Form.Item label={<Typography style={{ fontWeight: "bold" }}>Description</Typography>} name="description" layout="vertical">
                                <Input.TextArea rows={3} placeholder="Description" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Flex>
            </Form>
        </Modal>
    </ConfigProvider>
);
}

export default AddNewExp;
