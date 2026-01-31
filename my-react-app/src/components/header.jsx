import { useEffect, useState } from "react";
import { IoIosLock } from "react-icons/io";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";


const Header = ({ status, handleLogout, setIsDepartmentModalOpen, heading }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [Url, setUrl] = useState("");

    useEffect(() => {
        setUrl(window.location.href);
    }, [location]);

    return (
        <header className='pt-2 pb-2'>
            <div className="d-flex justify-content-between gap-2 mb-2">
                <div className="d-flex align-items-center gap-3">
                    {location.pathname !== '/' && (
                        <button
                            className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
                            onClick={() => navigate(-1)}
                            title="Go Back"
                            style={{ padding: '8px' }}
                        >
                            <FaArrowLeft size={12} />
                        </button>
                    )}
                    <h1 className='text-left fw-bold m-0' style={{ fontSize: '1.5rem' }}>CRM</h1>
                </div>
                <div className='d-flex justify-content-center align-items-center gap-2'>
                    <button className="btn btn-primary mb-1 d-inline-flex align-items-center gap-2" onClick={handleLogout}>
                        <IoIosLock />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header;