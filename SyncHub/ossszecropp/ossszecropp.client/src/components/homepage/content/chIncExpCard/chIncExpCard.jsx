import React from "react";
import { Card, Row, Col } from "antd";
import ChartIncExp from "../../../financePage/chartIncExp/chartIncExp";
import { useTheme } from "../../../../theme/themeContext";

const ChIncExpCard = () => {
    const { isDarkMode } = useTheme();
    return(
        <Card style={{ width: "100%", backgroundColor: isDarkMode ? "#292A2A" : "white",borderColor: isDarkMode ? "#515151" : "#EEEEEE"}}>
            <Row gutter={24}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <ChartIncExp />
                </Col>
            </Row>
        </Card>
    );
}
export default ChIncExpCard;