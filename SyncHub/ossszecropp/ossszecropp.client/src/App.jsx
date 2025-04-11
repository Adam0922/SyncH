// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignInForm from './components/loginForm/signIn.jsx';
import HomePage from './HomePage.jsx';
import EmployeePage from './employeePage.jsx';
import SuccessNewEmployee from './components/successPages/successNewEmployee.jsx';
import ServicePage from './servicePage.jsx';
import ProfilPage from './profilPage.jsx';
import EquipmentsPage from './equipmentsPage.jsx';
import DocsPage from './docsPage.jsx';
import FinancePage from './financePage.jsx';
import PrivateRoute from './components/PrivateRoute';
import { useTheme } from './theme/themeContext.jsx';

const App = () => {
    const { isDarkMode } = useTheme();
    useEffect(() => {
        document.body.style.backgroundColor = isDarkMode ? '#292A2A' : '#ffffff';
        document.body.style.color = isDarkMode ? '#f0f0f0' : '#000000';
    }, [isDarkMode]);
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/sign-in" element={<SignInForm />} />
                    <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                    <Route path="/profile/*" element={<PrivateRoute><ProfilPage /></PrivateRoute>} />
                    <Route path="/employees/*" element={<PrivateRoute><EmployeePage /></PrivateRoute>} />
                    <Route path="/services/*" element={<ServicePage />} />
                    <Route path="/equipments/" element={<PrivateRoute><EquipmentsPage /></PrivateRoute>} />
                    {<Route path="/documents/" element={<PrivateRoute><DocsPage /></PrivateRoute>} />}
                    <Route path="/finance/" element={<PrivateRoute><FinancePage /></PrivateRoute>} />
                    <Route path="/success-new-employee" element={<PrivateRoute><SuccessNewEmployee /></PrivateRoute>} />
                    <Route path="/" element={<Navigate to="/sign-in" replace />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
