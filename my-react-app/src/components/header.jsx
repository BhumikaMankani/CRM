import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { API_URL } from "../../proxy";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";

import logo from "../assets/ea72b0a312922dca13f69c2e529e6abebde9ecc2.svg";
const Header = ({ currentUser, fetchDepartments, allDepartments, handleDepartmentChange, selectedDepartment, setSelectedDepartment, isDrawerOpen, status, handleLogout, setIsDepartmentModalOpen, heading, toggleDrawer }) => {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
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
    <header className={`pt-2 pb-2 ${location.pathname === '/' ? (isDrawerOpen ? 'left__300' : '') : ''}`}>
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

                    {location.pathname === '/' && (
                        <div className="staff__analytic p-1 d-flex align-items-center gap-2">
                            {currentUser?.status === 'admin' && allDepartments.length > 1 ? (
                                <ul className="nav nav-pills g-1" style={{ fontSize: "0.875rem", columnGap: "8px" }}>
                                    {allDepartments?.map(dept => dept?.status !== 'archived' && (
                                        <li className="nav-item" key={dept?.department}>
                                            <button
                                                className={`${selectedDepartment?.toLowerCase() === dept?.department?.toLowerCase() ? 'active' : ''} rounded pl-4 pr-4 btn-sm bg-transparent
                                                    `}
                                                onClick={() => handleDepartmentChange(dept?.department)}

                                                style={{ cursor: 'pointer', border: '1px solid transparent', color: "#6b7280", fontSize: "12.5px" }}
                                            >
                                                {dept?.department ? dept?.department?.charAt(0).toUpperCase() + dept?.department?.slice(1) : ''}
                                            </button>
                                        </li>

                                    ))}
                                </ul>
                            ) : (
                                <ul className="nav nav-pills g-1" style={{ fontSize: "0.875rem", columnGap: "8px" }}>
                                    {currentUser?.department && currentUser.department.map((dept) => (
                                        <li className="nav-item" key={dept}>
                                            <button
                                                className={`${selectedDepartment?.toLowerCase() === dept?.toLowerCase() ? 'active' : ''} rounded pl-4 pr-4 btn-sm bg-transparent
                                                    `}
                                                onClick={() => handleDepartmentChange(dept)}

                                                style={{ cursor: 'pointer', border: '1px solid transparent', color: "#6b7280", fontSize: "12.5px" }}
                                            >
                                                {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                            </button>
                                        </li>

                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {location.pathname !== '/' && (
                        <h1 className='text-left logo fw-bold m-0' style={{ fontSize: '1.5rem' }}><img width="100%" height="auto" alt="Mandasa crm" loading="lazy" src={logo}></img></h1>
                    )}
                </div>
                <div className='d-flex justify-content-center align-items-center gap-2'>
                    {lastActiveTime && (
                        <p className="text-light-custom mb-0" style={{ fontSize: '11.5px' }}>
                            Last update: <span className="text-light-custom">
                                {new Date(lastActiveTime).toLocaleString()}
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </header >
    )
}

export default Header;