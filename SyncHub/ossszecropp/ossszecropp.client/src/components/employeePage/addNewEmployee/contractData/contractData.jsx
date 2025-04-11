import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Typography, Row, Col, Button, Dropdown, Menu, notification } from "antd";
import { ReloadOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../utils/axiosInstance';
import { useTheme } from '../../../../theme/themeContext';

const ContractData = ({ onNext, onBack, updatePercent, totalFields }) => {
    const { isDarkMode } = useTheme();
    const [form] = Form.useForm();
    const [jobs, setJobs] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedSupervisor, setSelectedSupervisor] = useState('');
    const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('/api/Employees/GetJobs');
                setJobs(response.data);
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
                notification.error({
                    message: 'Error',
                    description: 'Failed to fetch jobs. Please try again later.',
                });
            }
        };

        const fetchEmployees = async () => {
            try {
                const response = await axios.get('/api/Employees');
                setEmployees(response.data);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
                notification.error({
                    message: 'Error',
                    description: 'Failed to fetch employees. Please try again later.',
                });
            }
        };

        fetchJobs();
        fetchEmployees();

        const savedData = JSON.parse(localStorage.getItem('contractData'));
        if (savedData) {
            form.setFieldsValue(savedData);
        }

        const savedJobId = localStorage.getItem('selectedJobId');
        if (savedJobId) {
            setSelectedJobId(savedJobId);
        }

        const savedSupervisorId = localStorage.getItem('selectedSupervisorId');
        if (savedSupervisorId) {
            setSelectedSupervisorId(savedSupervisorId);
        }
    }, [form]);


    const handleSave = (values) => {
        localStorage.setItem('contractData', JSON.stringify(values));
    };

    const validateEmployeeData = (data) => {
        const errors = {};

        if (!data.IdCardNum || data.IdCardNum === data.supervisorId) {
            errors.IdCardNum = 'Valid ID Card Number is required';
        }

        if (!data.postalCode || !/^\d{4}$/.test(data.postalCode)) {
            errors.postalCode = 'Valid Postal Code is required';
        }

        if (!data.streetAddress || data.streetAddress.trim() === '') {
            errors.streetAddress = 'Street Address is required';
        }

        return Object.keys(errors).length > 0 ? errors : null;
    };

    const handleFinish = async (values) => {
        handleSave(values);
        const personalData = JSON.parse(localStorage.getItem('personalData'));
        const homeAddress = JSON.parse(localStorage.getItem('homeAddress')) || {};
        const dataOfBirth = JSON.parse(localStorage.getItem('dataOfBirth'));

        if (!homeAddress.postalCode || !homeAddress.streetAddress) {
            notification.error({
                message: 'Missing Address Information',
                description: 'Postal code and street address are required. Please complete your address information.',
            });
            return; // Stop form submission
        }

        // Log the selected job and supervisor IDs to verify they are set correctly
        console.log('Selected Job ID:', selectedJobId);
        console.log('Selected Supervisor ID:', selectedSupervisorId);

        const employeeData = {
            ...personalData,
            ...homeAddress,
            ...dataOfBirth,
            ...values,
            jobId: parseInt(selectedJobId, 10),
            supervisorId: selectedSupervisorId,
            IdCardNum: personalData.idCardNumber,
            postalCode: homeAddress.postalCode,
            streetAddress: homeAddress.streetAddress,
            startDate: values.startDate,
            endDate: values.endDate,
            hourlyRates: values.hourlyRates,
            working_hours: values.working_hours,
            daysOffNum: values.daysOffNum,
            DateOfBirth: new Date(dataOfBirth.birthdate), // Ensure proper date formatting
            placeOfBirth: dataOfBirth.birthplace // Standardize field name
        };

        const validationErrors = validateEmployeeData(employeeData);
        if (validationErrors) {
            console.error('Validation errors:', validationErrors);
            notification.error({
                message: 'Validation Failed',
                description: 'Please correct the errors in the form before submitting.',
            });
            return; // Stop form submission
        }

        console.log('Employee data being submitted:', JSON.stringify(employeeData, null, 2));

        try {
            const response = await axios.post('/api/EmployeeRegistration', employeeData);
            localStorage.removeItem('personalData');
            localStorage.removeItem('homeAddress');
            localStorage.removeItem('dataOfBirth');
            localStorage.removeItem('contractData');
            localStorage.removeItem('selectedJobId'); // Clear local storage
            localStorage.removeItem('selectedSupervisorId'); // Clear local storage
            navigate('/employees');
        } catch (error) {
            console.error('Failed to add employee:', error.response ? error.response.data : error.message);
            if (error.response && error.response.data && error.response.data.errors) {
                console.error('Validation errors:', error.response.data.errors);
            }
            notification.error({
                message: 'Error',
                description: 'Failed to add employee. Please check the data and try again.',
            });
        }
    };


    const handleSubmit = () => {
        form.validateFields().then((values) => {
            handleFinish(values);
        }).catch((errorInfo) => {
            console.log('Validation Failed:', errorInfo);
        });
    };

    const handleValuesChange = () => {
        const values = form.getFieldsValue();
        const filledFields = Object.values(values).filter(Boolean).length;
        updatePercent(Math.round((filledFields / totalFields) * 100));
    };

    const handleJobMenuClick = (job) => {
        form.setFieldsValue({ job: job.jobTitle });
        setSelectedJob(job.jobTitle);
        setSelectedJobId(job.jobID); // Ensure this is correctly set
        localStorage.setItem('selectedJobId', job.jobID); // Save to local storage
    };

    const handleSupervisorMenuClick = (supervisor) => {
        form.setFieldsValue({ supervisor: `${supervisor.firstName} ${supervisor.lastName}` });
        setSelectedSupervisor(`${supervisor.firstName} ${supervisor.lastName}`);
        setSelectedSupervisorId(supervisor.idCardNum); // Ensure this is correctly set
        localStorage.setItem('selectedSupervisorId', supervisor.idCardNum); // Save to local storage
    };


    const validateDaysOffNum = (_, value) => {
        if (value > 30) {
            return Promise.reject(new Error('Days Off Number cannot exceed 30'));
        }
        return Promise.resolve();
    };

    const validateHourlyRates = (_, value) => {
        if (value > 69) {
            return Promise.reject(new Error('Hourly Rates cannot exceed $69'));
        }
        return Promise.resolve();
    };

    const validateworking_hours = (_, value) => {
        if (value > 192) {
            return Promise.reject(new Error('Working Hours cannot exceed 192 hours'));
        }
        return Promise.resolve();
    };

    const jobMenu = (
        <Menu style={{ backgroundColor: isDarkMode ? "#292A2A" : "white", }} items={jobs.map(job => ({
            key: job.jobID,
            label: job.jobTitle,
            onClick: () => handleJobMenuClick(job)
        }))} />
    );

    const supervisorMenu = (
        <Menu style={{backgroundColor: isDarkMode ? "#292A2A" : "white",}} items={employees.map(employee => ({
            key: employee.idCardNum,
            label: `${employee.firstName} ${employee.lastName}`,
            onClick: () => handleSupervisorMenuClick(employee)
        }))} />
    );

    return (
        <Card>
            <Form form={form} layout="vertical" autoComplete="off" onValuesChange={handleValuesChange}>
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item name="job" label={<Typography style={{ fontWeight: "bold" }}>Job</Typography>} rules={[{ required: true, message: 'Please fill Job' }]}>
                            <Dropdown overlay={jobMenu}>
                                <Input placeholder="Job" readOnly value={selectedJob || form.getFieldValue('job')} />
                            </Dropdown>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="supervisor" label={<Typography style={{ fontWeight: "bold" }}>Supervisor</Typography>} rules={[{ required: true, message: 'Please fill your Supervisor' }]}>
                            <Dropdown overlay={supervisorMenu}>
                                <Input placeholder="Supervisor" readOnly value={selectedSupervisor || form.getFieldValue('supervisor')} />
                            </Dropdown>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item name="daysOffNum" label={<Typography style={{ fontWeight: "bold" }}>Days Off Number</Typography>} rules={[
                            { required: true, message: 'Please fill Days Off Number' },
                            { validator: validateDaysOffNum }
                        ]}
                        >
                            <Input type="number" placeholder="Days Off Number" maxLength={2} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="startDate" label={<Typography style={{ fontWeight: "bold" }}>Starting Date</Typography>} rules={[{ required: true, message: 'Please fill Starting Date', type: 'startDate' }]}>
                            <Input type="date" placeholder="Starting Date" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item name="hourlyRates" label={<Typography style={{ fontWeight: "bold" }}>Hourly Rates</Typography>} rules={[
                            { required: true, message: 'Please fill Hourly Rate' },
                            { validator: validateHourlyRates }
                        ]}
                        >
                            <Input placeholder="Hourly Rates" type="number" maxLength={2} suffix="$" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="working_hours" label={<Typography style={{ fontWeight: "bold" }}>Working Hours</Typography>} rules={[
                            { required: true, message: 'Please fill Working Hours' },
                            { validator: validateworking_hours }
                        ]}
                        >
                            <Input placeholder="Working Hours" type="number" suffix="hours" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '40px' }}>
                            <Button icon={<ReloadOutlined style={{ color: "red" }} />} style={{ border: 'none' }} />
                            <Button type="primary" onClick={handleSubmit} style={{ margin: '0 auto', boxShadow: "none" }}>
                                Create New Employee
                            </Button>
                            <Button icon={<RollbackOutlined />} style={{ border: 'none' }} onClick={onBack} />
                        </div>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ContractData;
