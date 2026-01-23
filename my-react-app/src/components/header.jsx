import { useEffect, useState } from "react";
import { IoIosLock } from "react-icons/io";
import { Link } from 'react-router-dom';


const Header = ({ status, handleLogout, setIsDepartmentModalOpen, heading }) => {
    const [Url, setUrl] = useState("");
    useEffect(() => {
       const Url = window.location.href;
       console.log("Current URL:", Url);
    });
    console.log("Current URL:", Url);
    return (
        <header className='pt-2 pb-2'>
            <div className="d-flex justify-content-between gap-2 mb-2">
                <h1 className='text-left fw-bold'>CRM</h1>
                <div className='d-flex justify-content-center align-items-center gap-2'>
                    {/* {window.location.href}
                    <Link to="/department" className='text-decoration-none text-dark fw-bold'>Department</Link> */}
                    <button className="btn btn-primary mb-1 d-inline-flex align-items-center gap-2" onClick={handleLogout}>
                    <IoIosLock />
                    Logout</button>
                </div>
            </div>
        </header>
    )
}

export default Header;