import React from "react";
import { FloatButton } from "antd";
import { UpOutlined } from "@ant-design/icons";
import ThemeToggleButton from "./themeToggleBtn/themeTgglbtn.jsx";
import "./mainCntrlBtns.css";
import LanguageChangeButton from "./langChangeBtn/langChangeBtn.jsx";
import LogOutButton from "./logOutBtn/logOutBtn.jsx";

const MainCntrlBtns = () => {
    return (
        <div className="main-ctrl-div">
            <FloatButton.Group trigger="click" style={{ right: 24, bottom: 24 }} icon={<UpOutlined />}>
                <ThemeToggleButton />
                <LanguageChangeButton />
                <LogOutButton />
            </FloatButton.Group>
        </div>
    );
};

export default MainCntrlBtns;