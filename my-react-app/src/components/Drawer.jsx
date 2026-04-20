import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo-white.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Drawer.css';
import { LiaLockSolid } from 'react-icons/lia';

const Drawer = ({ isOpen, status, onClose, handleLogout }) => {
    // const [showUserPopup, setShowUserPopup] = useState(false);

    // const toggleUserPopup = (e) => {
    //     e.stopPropagation();
    //     setShowUserPopup(!showUserPopup);
    // };

    return (
        <>
            <div
                className={`drawer-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            ></div>
            <div className={`drawer-content ${isOpen ? 'open' : ''}`}>
                {/* <button className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
                    <IoCloseOutline size={24} />
                </button> */}

                <div className="drawer-header">
                    <img src={logo} alt="Mandasa CRM" className="drawer-logo" />
                </div>

                <div className="drawer-body">
                    <nav className="drawer-nav">
                        <div class="nav-section">Main</div>
                        <div className="drawer-nav-item">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>
                                Dashboard
                            </NavLink>
                        </div>
                        <div className="drawer-nav-item">
                            <NavLink
                                to="/tasks"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                Tasks
                            </NavLink>
                        </div>
                        <div className="drawer-nav-item">
                            <NavLink
                                to="/projects"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8M12 17v4"></path></svg>
                                Projects
                            </NavLink>
                        </div>
                        <div className="drawer-nav-item">
                            <NavLink
                                to="/projects"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path></svg>
                                Team
                            </NavLink>
                        </div>
                        <div className="drawer-nav-item coming_soon_link">
                            <NavLink
                                to="/projects"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <span className='coming_soon_badge'>COMING SOON</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"></path></svg>                                Reports
                            </NavLink>
                        </div>
                        <div class="nav-section">Departments</div>
                        {status?.department?.map(dept => (
                            <div className="drawer-nav-item" key={dept}>
                                <NavLink
                                    to={`/department/${dept.toLowerCase()}`}
                                    className={({ isActive }) =>
                                        `drawer-nav-link ${isActive ? 'active' : ''}`
                                    }
                                    onClick={onClose}
                                >
                                    <span
                                        className="dept-dot"
                                    ></span>
                                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                </NavLink>
                            </div>
                        ))}
                        {/* Add more links as needed */}
                    </nav>
                </div>

                <div className="drawer-footer">
                    <div className="user-row rounded d-flex w-100 gap-2 p-2 flex-column position-relative">
                        {/* <div className="dup_avatar">{status?.user_name?.[0]?.toUpperCase()}</div>
                        <div className="user-info-text">
                            <div className="dup_name">{status?.user_name}</div>
                            <div className="dup_role">{status?.email}</div>
                        </div> */}
                        {/* {showUserPopup && ( */}
                        {/* <div className="user-popup p-2 overflow-hidden rounded border-white bg-white position-absolute"> */}
                        <div className="d-flex align-items-center gap-2 w-100">
                            <div className="dup_avatar">{status?.user_name?.[0]?.toUpperCase()}</div>
                            <div className="popup-user-details d-flex justify-content-between align-items-center w-100">
                                <div className="popup-name fw-bold text-white">{status?.user_name}</div>
                                <span className={`status-badge ${status?.status}`}>
                                    {status?.status?.charAt(0).toUpperCase() + status?.status?.slice(1)}
                                </span>
                                {/* <div className="popup-email">{status?.email}</div> */}
                            </div>
                        </div>
                        <div className="user-popup-footer w-100">
                            <button className="cursor-pointer button button-primary d-flex align-items-center justify-content-center gap-2 rounded popup-logout-btn w-100" onClick={handleLogout}>
                                <LiaLockSolid />
                                Logout
                            </button>
                        </div>
                        {/* </div> */}
                        {/* )} */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Drawer;
