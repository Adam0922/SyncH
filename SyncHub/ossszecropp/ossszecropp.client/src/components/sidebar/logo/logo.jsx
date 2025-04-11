import { Flex } from "antd";
import React from "react";
import "./logo.css";
import LogoImgDark from "../../../assets/logo/darkLogo/logoDark.svg";
import LogoImgLight from "../../../assets/logo/lightLogo/logoLight.svg";
import { useTheme } from "../../../theme/themeContext";

const Logo = (visible) => {
    const { isDarkMode } = useTheme();

    if (!visible) {
        return null;
    }

    return (
        <Flex align="center" justify="center">
            <div className="logo">
                <img src={isDarkMode ? LogoImgLight : LogoImgDark} />
            </div>
        </Flex>
    );
};
export default Logo;