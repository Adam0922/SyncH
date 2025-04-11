import { FloatButton } from "antd";
import React from "react";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "../../../theme/themeContext";
import "./themeTgglBtn.css";

const ThemeToggleButton = () => {
    const theme = useTheme();
    console.log(theme);
    const { isDarkMode, toggleTheme } = theme || {};

    return (
        <FloatButton
            icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />}
            className="theme-tggl-btn"
            onClick={toggleTheme}
            tooltip={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        />
    );
};

export default ThemeToggleButton;