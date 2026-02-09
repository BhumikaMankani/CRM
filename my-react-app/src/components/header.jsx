import { useEffect, useState, useRef } from "react";
import { IoIosLock } from "react-icons/io";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";
// import User from "../../../server/models/User";


const Header = ({ status, handleLogout, setIsDepartmentModalOpen, heading }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        <header className='pt-2 pb-2'>
            <div className="d-flex justify-content-between gap-2 mb-2">
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
                    <h1 className='text-left fw-bold m-0' style={{ fontSize: '1.5rem' }}>Mandasa</h1>
                </div>
                <div className='d-flex justify-content-center align-items-center gap-2'>
                    <div className="custom-dropdown" ref={dropdownRef}>
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
                                    <IoIosLock />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </header >
    )
}

export default Header;