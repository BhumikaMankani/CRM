import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { API_URL } from "../../proxy";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";
import { LiaLockSolid } from "react-icons/lia";
import { FiMenu } from "react-icons/fi";

import logo from "../assets/ea72b0a312922dca13f69c2e529e6abebde9ecc2.svg";
const Header = ({ isDrawerOpen, status, handleLogout, setIsDepartmentModalOpen, heading, toggleDrawer }) => {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        <header className={`pt-2 pb-2 ${isDrawerOpen ? 'left__300' : ''}`}>
            <div className="d-flex justify-content-between gap-2">
                <div className="d-flex align-items-center gap-3">
                    {location.pathname !== '/' && (
                        <button
                            className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
                            onClick={() => navigate('/')}
                            title="Go Back"
                            style={{ padding: '8px' }}
                        >
                            <FaArrowLeft size={12} />
                        </button>
                    )}

                    {/* <button
                        className="btn btn-link p-0 text-dark border-0 shadow-none d-flex align-items-center"
                        onClick={toggleDrawer}
                        title="Open menu"
                    >
                        <FiMenu size={24} />
                    </button> */}
                    {location.pathname === '/' && (
                        <div className="staff__analytic p-1 d-flex align-items-center gap-2">
                            {status?.department?.length > 1 ? (
                                <ul className="nav nav-pills g-1" style={{ fontSize: "0.875rem", columnGap: "8px" }}>
                                    {status.department.map(dept => (
                                        <li className="nav-item" key={dept}>
                                            <button
                                                className={`text-dark fw-bold rounded pl-4 pr-4 fs-7 btn-sm bg-transparent
                                                    `}
                                                // onClick={(e) => {
                                                //     e.preventDefault();
                                                //     setSelectedDepartment(dept);
                                                // }}
                                                style={{ cursor: 'pointer', border: '1px solid transparent' }}
                                            >
                                                {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                            </button>
                                        </li>

                                    ))}
                                </ul>
                            ) : (
                                null
                                // <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`} className="btn btn-primary btn-sm mt-2">View All Analytics</Link>
                            )}
                        </div>
                    )}
                    {location.pathname !== '/' && (
                        <h1 className='text-left logo fw-bold m-0' style={{ fontSize: '1.5rem' }}><img width="100%" height="auto" alt="Mandasa crm" loading="lazy" src={logo}></img></h1>
                    )}
                </div>
                <div className='d-flex justify-content-center align-items-center gap-2'>
                    {lastActiveTime && (
                        <p className="text-dark fw-bold mb-0" style={{ fontSize: '16px' }}>
                            Last update: <span class="text-primary">
                                {new Date(lastActiveTime).toLocaleString()}
                            </span>
                        </p>
                    )}
                    {/* <div className="custom-dropdown" ref={dropdownRef}>
                        <div
                            className="dropdown-toggle d-flex align-items-center gap-2 cursor-pointer"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="profile">{status?.user_name?.[0]?.toUpperCase()}</span>
                        </div>
                        {isDropdownOpen && (
                            <div className="dropdown-menu-custom">
                                <div className="dropdown-user-info">
                                    <p className="mb-0 fw-bold">{status?.user_name}</p>
                                    <p className="mb-0 text-muted small">{status?.email}</p>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item-custom" style={{ color: "#e87c00" }} onClick={handleLogout}>
                                    <LiaLockSolid />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
        </header >
    )
}

export default Header;