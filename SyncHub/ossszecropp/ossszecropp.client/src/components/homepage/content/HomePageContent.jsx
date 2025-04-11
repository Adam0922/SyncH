import { Col, Layout, Row } from "antd";
const { Content } = Layout;
import React from "react";
import ChIncExpCard from "./chIncExpCard/chIncExpCard";
import CashFlowBnr from "./cashflowBanner/cashflowBnr";
import StaffListCard from "./staffListCard/staffListCard";
import EquipmentListCard from "./equipmentListCard/equipList";

const HomePageContent = () => {
    return (
        <Content className="content">
            <Row gutter={[24]} style={{ marginBottom: '1vh' }}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginBottom: '1vh' }}>
                    <ChIncExpCard />
                </Col>
            </Row>
            <Row gutter={[24]}>
                <Col xs={24} sm={24} md={12} lg={12} xl={8} style={{ marginBottom: '1vh' }}>
                    <CashFlowBnr />
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={8} style={{ marginBottom: '1vh' }}>
                    <StaffListCard />
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={8} style={{ marginBottom: '1vh' }}>
                    <EquipmentListCard />
                </Col>
            </Row>
        </Content>
    );
};

export default HomePageContent;
