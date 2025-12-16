import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaTasks, FaChartPie, FaCog, FaSignOutAlt, FaRocket, FaCalendarAlt, FaTint, FaBook } from 'react-icons/fa';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);

    return (
        <div className="sidebar">
            <div className="brand">
                <div className="logo-icon"><FaRocket /></div>
                SmartLife
            </div>

            <nav className="nav-menu flex-grow-1">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaHome /> Dashboard
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaTasks /> My Tasks
                </NavLink>
                <NavLink to="/schedule" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaCalendarAlt /> Schedule
                </NavLink>
                <NavLink to="/habits" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaTint /> Habits
                </NavLink>
                <NavLink to="/journal" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaBook /> Journal
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaChartPie /> Analytics
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaCog /> Settings
                </NavLink>
            </nav>

            <div className="mt-auto">
                <button onClick={logout} className="nav-link w-100 border-0 bg-transparent text-danger">
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
