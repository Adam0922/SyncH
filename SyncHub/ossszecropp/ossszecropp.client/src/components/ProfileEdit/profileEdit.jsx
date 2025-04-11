import React, { useState } from "react";
import { Typography, Flex, Steps, Modal } from "antd";
import HomeAddressEdit from "./homeAddressEdit/homeAddressEdit.jsx";
import DateOfBirthEdit from "./dataOfBirthEdit/dataOfBirthEdit.jsx";
import PersonalDataEdit from "./personalDataEdit/personalDataEdit.jsx";


const ProfileEdit = ({ visible, employee, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [percent, setPercent] = useState(0);
    const [userData, setUserData] = useState(null);

    const handleNext = () => {
        setCurrentStep(prevStep => prevStep + 1);
    };

    const handleBack = () => {
        if (currentStep === 0) {
            onClose();
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
            content: <HomeAddressEdit onNext={handleNext} onBack={handleBack} updatePercent={updatePercent} totalFields={4}/> //userData={userData} />
        },
        {
            title: 'Date of Birth',
            content: <DateOfBirthEdit onNext={handleNext} onBack={handleBack} updatePercent={updatePercent} totalFields={4}/> //userData={userData} />
        },
        {
            title: 'Personal details',
            content: <PersonalDataEdit onNext={handleNext} onBack={handleBack} updatePercent={updatePercent} totalFields={6} userData={userData} onClose={onClose}/>
        },
    ];

    return (
        <Modal visible={visible} onCancel={onClose} footer={null} width='80vh'>
            <Typography.Title level={3}>
                Edit Your Profile
            </Typography.Title>
            <Flex vertical gap='middle'>
                <Steps size="small" labelPlacement="vertical" current={currentStep} percent={percent} items={steps}/>
                {steps[currentStep].content}
            </Flex>
        </Modal>
    );
};

export default ProfileEdit;
