//import React from 'react';
//import { Button, Result } from 'antd';
//import { useNavigate, useLocation } from 'react-router-dom';

//const SuccessProfileEdit = () => {
//    const navigate = useNavigate();
//    const location = useLocation();
//    const employee = location.state?.employee;

//    const handleGoToEmployeeList = () => {
//        navigate('/employees');
//    };

//    const handleGoToProfile = () => {
//        if (employee && employee.id) {
//            navigate(`/employees/profile/${employee.id}`, { state: { employee } });
//        } else {
//            navigate('/employees');
//        }
//    };

//    return (
//        <Result 
//            style={{ backgroundColor: "#fff" }} 
//            status="success" 
//            title="Employee Profile Updated Successfully!" 
//            subTitle="The employee's information has been successfully modified in the system. You can now view their updated details or return to the employee list." 
//            extra={[
//                <Button type="primary" key="employeeList" onClick={handleGoToEmployeeList}>
//                    Return to Employee List
//                </Button>,
//                <Button key="profile" onClick={handleGoToProfile}>
//                    View Updated Profile
//                </Button>
//            ]}
//        />
//    );
//};

//export default SuccessProfileEdit;
