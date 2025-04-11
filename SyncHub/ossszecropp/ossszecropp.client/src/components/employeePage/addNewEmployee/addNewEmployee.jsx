// addNewEmployee.jsx
import { Card, Flex, Steps, Typography, ConfigProvider } from "antd";
import React, { useState } from "react";
import HomeAddress from "./homeAddress/homeAddress";
import DataOfBirth from "./dataOfBirth/dataOfBirth.jsx";
import PersonalData from "./personalData/personalData.jsx";
import { useNavigate } from 'react-router-dom';
import ContractData from "./contractData/contractData.jsx";
import { useTheme } from "../../../theme/themeContext";

const AddNewEmployee = () => {
    const { isDarkMode } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [percent, setPercent] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentStep === 3) {
            navigate('/employees/add-employee/processing');
        } else {
            setCurrentStep(prevStep => prevStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep === 0) {
            navigate('/employees');
        } else {
            setCurrentStep(prevStep => prevStep - 1);
        }
    };

    const updatePercent = (stepPercent) => {
        setPercent(stepPercent);
    };

    const steps = [
        {
            title: 'Home Address',
            content: <HomeAddress onNext={handleNext} onBack={handleBack} updatePercent={updatePercent} totalFields={4} />
        },
        {
            title: 'Data of birth',
            content: <DataOfBirth onNext={handleNext} onBack={handleBack} updatePercent={updatePercent} totalFields={4} />
        },
        {
            title: 'Personal Data',
            content: <PersonalData onNext={handleNext} onBack={handleBack} updatePercent={updatePercent} totalFields={4} />
        },
        {
            title: 'Contract Data',
            content: <ContractData onNext={handleNext} onBack={handleBack} updatePercent={updatePercent} totalFields={6} />
        }
    ];

    return (
        <Card style={{ width: '100%', height: '100%', backgroundColor: isDarkMode ? "#292A2A" : "white", borderColor: isDarkMode ? "#515151" : "#EEEEEE" }}>
            <Typography.Title level={2} style={{ color: isDarkMode ? "white" : "black", marginTop: "1vh", marginBottom: "2vh" }}>
                Add Employee
            </Typography.Title>
            <Flex vertical>
                <ConfigProvider theme={{ token: { colorText: isDarkMode ? "white" : "black", colorBgContainer: isDarkMode ? "#292A2A" : "white" }, components: { Steps: { titleColor: isDarkMode ? "white" : "black", descriptionColor: isDarkMode ? "white" : "black", colorTextDescription: isDarkMode ? "white" : "black", waitIconColor: isDarkMode ? "white" : "#d9d9d9" } } }} >
                    <Steps size="small" labelPlacement="vertical" current={currentStep} percent={percent} items={steps} style={{ marginTop: "2vh", marginBottom: "2vh" }} />
                    {steps[currentStep].content}
                </ConfigProvider>
            </Flex>
        </Card>
    );
};

export default AddNewEmployee;