import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const SuccessNewEmployee = () => {
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        navigate('/employees');
    };

    return (
        <Result 
            style={{ backgroundColor: "#fff" }} 
            status="success" 
            title="Employee Added Successfully!" 
            subTitle="You have successfully added a new employee to the system. You can now manage their details or add more employees." 
            extra={[
                <Button type="primary" key="console" onClick={handleGoToDashboard}>
                    Go to Employees
                </Button>,
            ]}
        />
    );
};

export default SuccessNewEmployee;
