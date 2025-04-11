import { FloatButton } from "antd";
import React from "react";
import { LogoutOutlined } from "@ant-design/icons";
import "./logOutBtn.css";

const LogOutButton = () => {
    const handleLogout = () => {
        // Clear user session, tokens, etc.
        localStorage.removeItem('authToken'); // Remove auth token from local storage
        sessionStorage.removeItem('authToken'); // Remove auth token from session storage

        // Redirect to sign-in page
        window.location.href = '/sign-in';
    };

    return (
        <FloatButton icon={<LogoutOutlined />} className="log-out-btn" onClick={handleLogout} />
    );
};
export default LogOutButton;