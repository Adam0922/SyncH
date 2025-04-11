import './signin.css';
import { Modal } from 'antd';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import FogPassLog from './fgPassLog/fogPassLog';
import React, { useState, useEffect } from "react";
import { useTheme } from '../../theme/themeContext';
import SuccessLogin from "../successPages/successLogin";
import DarkBg from "../../assets/background/darkBg/dark-bg.svg";
import LightBg from "../../assets/background/lightBg/light-bg.svg";
import { Card, Divider, Typography, Form, Input, Button, Flex } from "antd";
import axiosInstance from '../../utils/axiosInstance'; // Import Axios instance

const SignInForm = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [isSLModalVisible, setSLModalVisible] = useState(false);
    const [isForgotPassVisible, setForgotPassVisible] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.body.style.backgroundImage = `url(${isDarkMode ? DarkBg : LightBg})`;
        document.body.style.backgroundSize = "cover" || "contain";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundAttachment = "fixed";
        document.body.classList.add('signin-page');
        return () => {
            document.body.style.backgroundImage = "";
            document.body.classList.remove('signin-page');
        };
    }, [isDarkMode]);

    const showSLModal = () => {
        setSLModalVisible(true);
    };

    const handleLSCancel = () => {
        setSLModalVisible(false);
        navigate('/home');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleForgotPassClick = () => {
        setForgotPassVisible(true);
    };

    const handleForgotPassClose = () => {
        setForgotPassVisible(false);
    };

    const handleFinish = async (values) => {
        setIsLoading(true);
        setError('');
        try {
            const payload = { ...formData };
            console.log("Request Payload:", payload);
            const response = await axiosInstance.post('/api/data/login', payload); // Use the correct endpoint

            const data = response.data;
            if (data.success) {
                if (typeof data.token === 'string') {
                    localStorage.setItem('authToken', data.token);

                    const decodedToken = jwtDecode(data.token);
                    console.log("Decoded Token:", decodedToken);

                    // Extract the full name from the decoded token
                    const fullName = decodedToken.unique_name[1];

                    // Store the full name in localStorage
                    localStorage.setItem('fullName', fullName);

                    // Store the token in localStorage or wherever you need it
                    localStorage.setItem('token', data.token);

                    // Show the success login modal
                    showSLModal();
                } else {
                    throw new Error('Invalid token format');
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            console.log('Login failed:', error);

            const errorMsg = error.response?.data?.message || 'Invalid username or password.';

            Modal.error({
                title: 'Login Failed',
                content: errorMsg,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="signin-card" style={{ backgroundColor: isDarkMode ? "rgba(15, 24, 34, 0.7)" : "rgba(255, 255, 255, 0.7)", border: isDarkMode ? "#8a8e94 solid 1px" : "#14213d solid 1px" }}>
            <div className="card-content">
                <Typography.Title level={2} style={{ color: isDarkMode ? "#f0f0f0" : "#000000" }}>
                    Sign In
                </Typography.Title>
                <Divider orientation="horizontal" className="form-divider" style={{ borderBlockColor: isDarkMode ? "#8a8e94" : "#14213d" }} />

                {error && <div className="error-message">{error}</div>}

                <Form
                    autoComplete="off"
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    onFinish={handleFinish}
                >
                    <Form.Item
                        name="identifier"
                        wrapperCol={{ offset: 0, span: 24 }}
                        rules={[{ required: true, message: 'Please input your email or full name!' }]}
                        className="id-input"
                    >
                        <Input
                            type="text"
                            placeholder="Email or Full Name"
                            className="input-form"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        wrapperCol={{ offset: 0, span: 24 }}
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            type="password"
                            placeholder="Password"
                            className="input-form"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </Form.Item>
                    <Flex justify='center' style={{ marginBottom: '1.5vh', marginTop: '-1.5vh' }}>
                        <Typography.Text style={{ color: isDarkMode ? "white" : "black" }} onClick={handleForgotPassClick}> Can't log in? </Typography.Text>
                    </Flex>
                    <Form.Item wrapperCol={{ span: 24 }}>
                        <Button
                            className="btn-form"
                            htmlType="submit"
                            disabled={isLoading}
                            style={{ border: "#14213d solid 1px", color: "#415a77", minWidth: "15vh", width: "100%" }}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <SuccessLogin visible={isSLModalVisible} onClose={handleLSCancel} onSave={handleLSCancel} />
            <FogPassLog visible={isForgotPassVisible} onClose={handleForgotPassClose} />
        </Card>
    );
};

export default SignInForm;
