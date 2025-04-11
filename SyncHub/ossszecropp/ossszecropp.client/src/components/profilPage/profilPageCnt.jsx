import React from 'react';
import { Content } from "antd/es/layout/layout";
import { Flex } from "antd";
import { Routes, Route } from 'react-router-dom';
import DataCard from "./dataCard/dataCard.jsx";
import ProjectEmployeCard from "./ProjectEmployeCard/projectEmployeCard.jsx";
import SuccessProfileEdit from "../successPopUp/successEP.jsx";

const ProfilPageCnt = () => {
    return (
        <Content className="content">
            <Routes>
                <Route path="/" element={
                    <Flex justify="space-around" gap="small" wrap='wrap'>
                        <Flex vertical align="center" style={{ width: '100%', maxWidth: '85vh' }} gap='middle'>
                            <DataCard />
                            <Flex gap='small' style={{ width: '100%' }} justify="space-around">
                                {/*<WorkingTime />*/}
                                {/*<SalaryCard />*/}
                            </Flex>
                        </Flex>
                        <ProjectEmployeCard />
                    </Flex>
                } />
                <Route path="/edit" element={<SuccessProfileEdit />} />
            </Routes>
        </Content>
    );
};

export default ProfilPageCnt;
