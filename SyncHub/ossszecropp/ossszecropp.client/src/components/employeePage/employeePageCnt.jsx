import { Content } from "antd/es/layout/layout";
import { Flex } from "antd";
import { Routes, Route, useNavigate } from 'react-router-dom';
import ListedEmployee from "./listedEmployee/listedEmployee.jsx";
import AddNewEmployee from "./addNewEmployee/addNewEmployee.jsx";
//import ProfileEmployee from "./profileEmployee/profileEmployee.jsx";
//import ProfileEdit from "./profileEmployee/profileEdit/profileEdit.jsx";

const EmployeePageContent = () => {
    const navigate = useNavigate();

    const handleProfileClick = (employeeId, employeeData) => {
        navigate(`/employees/profile/${employeeId}`, { state: { employee: employeeData } });
    };

    return (
        <Content className="content">
            <Flex justify="space-between" gap="small">
                <Routes>
                    <Route path="/" element={<ListedEmployee onProfileClick={handleProfileClick} />} />
                    <Route path="/add-employee" element={<AddNewEmployee />} />
                    {/*    <Route path="/profile/:employeeId" element={<ProfileEmployee />} />*/}
                    {/*    <Route path="/profile/:employeeId/edit" element={<ProfileEdit />} />*/}
                </Routes>
            </Flex>
        </Content>
    );
};

export default EmployeePageContent;