import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { API_URL } from "../../proxy";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaChevronDown, FaBell, FaSearch } from "react-icons/fa";
import logo from "../assets/ea72b0a312922dca13f69c2e529e6abebde9ecc2.svg";
const Header = ({ allDepartments, handleDepartmentChange, selectedDepartment, isHome, status, handleLogout }) => {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();

    const fetchAudits = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/audit`);
            const data = await response.json();
            setAudits(data);
        } catch (err) {
            console.error("Failed to fetch audits:", err);
        }
    }, []);

    useEffect(() => {
        fetchAudits();

        window.addEventListener('dataUpdated', fetchAudits);

        return () => {
            window.removeEventListener('dataUpdated', fetchAudits);
        };
    }, [fetchAudits]);

    const lastActiveTime = useMemo(() => {
        if (!status?.user_name || !audits.length) return null;

        const latest = audits.find(
            a => a.changedByUserName === status.user_name
        );

        return latest ? latest.changedAt : null;

    }, [audits, status]);

    const getDepartmentOrderIndex = (deptName) => {
        const order = ['development', 'seo', 'marketing', 'sales'];
        const index = order.indexOf(deptName?.toLowerCase?.() || '');
        return index === -1 ? order.length : index;
    };

    const orderedUserDepartments = useMemo(() => {
        if (!status?.department) return [];
        return [...status.department].sort((a, b) => getDepartmentOrderIndex(a) - getDepartmentOrderIndex(b));
    }, [status?.department]);

    const orderedAllDepartments = useMemo(() => {
        if (!allDepartments?.length) return [];
        return [...allDepartments].sort((a, b) => getDepartmentOrderIndex(a?.department) - getDepartmentOrderIndex(b?.department));
    }, [allDepartments]);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className={`app-header ${isHome ? 'left__300' : 'pl-0 pr-0'}`}>
            <div className="d-flex justify-content-between container align-items-center">
                <div className="header-leading">
                    {location.pathname !== '/' && (
                        <button className="header-icon-btn" onClick={() => navigate('/')} title="Go back" aria-label="Go back">
                            <FaArrowLeft size={13} />
                        </button>
                    )}
                    {location.pathname === '/' ? (
                        <div className="department-switcher" aria-label="Department selector">
                            <span className="department-switcher-label">Workspace</span>
                            <div className="department-tabs">
                                {(status?.status === 'admin' ? orderedAllDepartments : orderedUserDepartments).map(dept => dept?.status !== 'archived' && (
                                    <button
                                        key={dept?.department || dept}
                                        className={selectedDepartment?.toLowerCase() === (dept?.department || dept)?.toLowerCase() ? 'active' : ''}
                                        onClick={() => handleDepartmentChange(dept?.department || dept)}
                                    >
                                        {(dept?.department || dept)?.charAt(0).toUpperCase() + (dept?.department || dept)?.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <h1 className="header-brand"><img alt="Mandasa CRM" loading="lazy" src={logo} /></h1>
                    )}
                </div>

                <div className="header-actions">
                    {/* <label className="header-search">
                        <FaSearch size={13} />
                        <input type="search" placeholder="Search dashboard" aria-label="Search dashboard" />
                        <kbd>Cmd K</kbd>
                    </label> */}
                    <div className="last-updated">
                        <span>Last updated</span>
                        <strong>{lastActiveTime ? new Date(lastActiveTime).toLocaleString() : 'Live dashboard'}</strong>
                    </div>
                    {/* <button className="header-icon-btn notification-btn" title="Notifications" aria-label="Notifications">
                        <FaBell size={15} />
                        <span className="notification-dot" />
                    </button> */}
                    <span className="header-divider" aria-hidden="true" />
                    {status && (
                        <div className="profile-menu-wrap" ref={dropdownRef}>
                            <button className="profile-trigger" onClick={() => setIsDropdownOpen(value => !value)} aria-expanded={isDropdownOpen} aria-label="Open profile menu">
                                <span className="profile-avatar">{status?.user_name?.[0]?.toUpperCase()}</span>
                                <span className="profile-trigger-copy"><strong>{status.user_name}</strong><small>{status.status}</small></span>
                                <FaChevronDown size={11} />
                            </button>
                            {isDropdownOpen && (
                                <div className="profile-menu">
                                    <div className="profile-menu-heading">Signed in as <strong>{status.user_name}</strong></div>
                                    <button onClick={handleLogout}>Log out</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header;
