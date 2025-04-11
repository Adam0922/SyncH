import { Col, Flex, Row } from "antd";
import { Content } from "antd/es/layout/layout";
import React from "react";
import ExpCard from "./expCard/expCard";
import IncCard from "./incCard/incCard";
import ChartIncExp from "./chartIncExp/chartIncExp";

const FinancePageCnt = () => {
    return(
        <Content className="content">
            <Flex style={{ width: "100%", height: "100%" }} vertical gap="large" wrap="wrap">
                <Row gutter={[24]}>
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <ChartIncExp/>
                    </Col>
                </Row>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={24} md={12} lg={12}>
                        <ExpCard/>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12}>
                        <IncCard/>
                    </Col>
                </Row>
            </Flex>
        </Content>
    );
};
export default FinancePageCnt;