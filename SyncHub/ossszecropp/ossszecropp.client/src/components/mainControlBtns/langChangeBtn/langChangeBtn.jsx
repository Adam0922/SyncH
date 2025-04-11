import { FloatButton } from "antd";
import React, { useState, useEffect } from "react";
import { CloseOutlined, TransactionOutlined } from "@ant-design/icons";
import "./langChangeBtn.css";

const LanguageChangeButton = () => {
    const [showWidget, setShowWidget] = useState(false);

    useEffect(() => {
        const addGoogleTranslateScript = () => {
            if (!document.querySelector('script[src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]')) {
                const script = document.createElement("script");
                script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
                script.async = true;

                script.onload = () => {
                    console.log("Google Translate script loaded");
                    window.googleTranslateElementInit = () => {
                        console.log("Google Translate initialized");
                        new window.google.translate.TranslateElement(
                            { pageLanguage: "en" },
                            "google_translate_element"
                        );
                    };
                };

                script.onerror = () => {
                    console.error("Failed to load Google Translate script");
                };

                document.body.appendChild(script);
            } else {
                console.log("Google Translate script already loaded");
            }
        };

        addGoogleTranslateScript();
    }, []);

    const toggleWidget = () => {
        setShowWidget((prevState) => {
            const newState = !prevState;
            const translateElement = document.getElementById("google_translate_element");
            if (translateElement) {
                translateElement.style.display = newState ? "block" : "none";
            } else {
                console.error("Translate element not found");
            }
            return newState;
        });
    };

    return (
        <div>
            <FloatButton
                icon={
                    <span className="lang-span">
                        {showWidget ? <CloseOutlined /> : <TransactionOutlined />}
                    </span>
                }
                className="lang-chng-btn"
                onClick={toggleWidget}
            />
            <div
                id="google_translate_element"
                style={{
                    display: "none",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    zIndex: 1000,
                    backgroundColor: "#fff",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                }}
            ></div>
        </div>
    );
};

export default LanguageChangeButton;