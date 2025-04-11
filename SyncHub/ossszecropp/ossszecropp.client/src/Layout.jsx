import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Layout as AntLayout } from "antd";
import SideBar from "./components/sidebar/sideBar.jsx";
import { CollapsedProvider } from "./collapsedContext.jsx";
import CustomHeader from "./components/homepage/header/header.jsx";
import { useTheme } from "./theme/themeContext";

const { Content } = AntLayout;

const Layout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < 768 : false
    );
    const { isDarkMode } = useTheme();

    const handleResize = useCallback(() => {
        if (typeof window !== "undefined") {
            setIsMobile(window.innerWidth < 768);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.addEventListener("resize", handleResize);
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }
    }, [handleResize]);

    return (
        <CollapsedProvider>
            <AntLayout style={{ minHeight: '100vh', backgroundColor: isDarkMode ? "#292A2A" : "#ffffff" }}>
                {!isMobile && <SideBar />}
                <AntLayout style={{ backgroundColor: isDarkMode ? "#191919" : "#ffffff"}}>
                    <CustomHeader/>
                    <Content style={{ margin: '24px 16px', padding: 24, backgroundColor: isDarkMode ? "#191919" : "#ffffff", borderRadius: 8 }}>
                        {children}
                    </Content>
                </AntLayout>
            </AntLayout>
        </CollapsedProvider>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
