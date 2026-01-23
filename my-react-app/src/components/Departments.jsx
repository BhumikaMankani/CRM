import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom'
import Marketing from "../pages/marketing";
import Seo from "../pages/seo";
import Form from "../components/Form";
import Header from "./header";
// import Md5Hasher from "../components/Password";
import Development from "../pages/development";
import { API_URL } from "../../proxy";

function Departments({ setIsLoggedIn }) {

    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isDepartment, setIsDepartment] = useState(false);
    const [userData, setUserData] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [status, setStatus] = useState(() => {
        const savedData = localStorage.getItem('user');
        return savedData ? JSON.parse(savedData) : null;
    });
    const navigate = useNavigate();

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${API_URL}/api/department`);
            const data = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        }
    };

    const handleSaveDepartment = async (e) => {
        e.preventDefault();
        if (!newDepartmentName.trim()) return;

        try {
            const response = await fetch(`${API_URL}/api/department`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    department: newDepartmentName.trim(),
                    // Internal name will be handled by backend
                }),
            });

            if (response.ok) {
                setNewDepartmentName("");
                setIsDepartmentModalOpen(false);
                fetchDepartments();
            } else {
                console.error("Failed to add department");
            }
        } catch (err) {
            console.error("Error adding department:", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user`);
                const data = await response.json();
                setUserData(data);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!status?.department) return;

        const isAnyDepartmentTrue = status.department.some(dept => dept === true);
        setIsDepartment(isAnyDepartmentTrue);
    }, [status]);


    const handleCheckboxChange = async (event, user, deptName) => {
        const { checked } = event.target;
        let updatedDepartments = user.department || [];

        if (checked) {
            if (!updatedDepartments.includes(deptName)) {
                updatedDepartments = [...updatedDepartments, deptName];
            }
        } else {
            updatedDepartments = updatedDepartments.filter(d => d !== deptName);
        }

        try {
            const response = await fetch(`${API_URL}/api/user/${user._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ department: updatedDepartments }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUserData(prevData => prevData.map(u => u._id === user._id ? updatedUser : u));
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                console.error("Failed to update department");
            }
        } catch (err) {
            console.error("Error updating department:", err);
        }
    };


    console.log("userData", userData);

    const columns = [
        {
            header: 'Department',
            accessor: 'department',
            render: (row) => (
                <div className="cell-input-wrapper">
                    <Link to={row.link || `/${row.department.toLowerCase()}`} className="text-dark">{row.department}</Link>
                </div>
            )
        },
    ];

    return (
        <>
            <section className="">
                <div className="row">
                    <div className="col-md-12">
                        <table className="table">
                            <thead className="thead-primary">
                                <tr>
                                    {columns.map((column, index) => (
                                        <th className="p-2 w-100 d-flex justify-content-between align-items-center" key={index}>{column.header}
                                            {status?.status === 'admin' ? (
                                                <button
                                                    className="btn btn-secondary d-inline-flex align-items-center"
                                                    onClick={() => setIsDepartmentModalOpen(true)}
                                                >
                                                    Create
                                                </button>
                                            ) : null}</th>
                                    ))}

                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((row, rowIndex) => (
                                    (status?.status === 'admin' || status?.department?.includes(row.department)) && (
                                        <tr className="w-100" key={rowIndex}>
                                            {columns.map((column, colIndex) => (
                                                <td className="p-2 w-100 d-flex justify-content-between align-items-center" key={colIndex}>
                                                    {column.render
                                                        ? column.render(row, rowIndex)
                                                        : row[column.accessor]}
                                                    {status?.status === 'admin' && column.accessor === 'department' && (
                                                        <div className="d-flex gap-2">
                                                            {userData
                                                                .filter(user => user.status === 'staff')
                                                                .map((user, index) => (
                                                                    <div key={user._id || index} className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="checkbox"
                                                                            value={user.user_name}
                                                                            id={`${user._id}-${row.department}`}
                                                                            checked={user.department?.includes(row.department)}
                                                                            onChange={(e) => handleCheckboxChange(e, user, row.department)}
                                                                        />
                                                                        <label
                                                                            htmlFor={`${user._id}-${row.department}`}
                                                                            className="form-check-label"
                                                                        >
                                                                            {user.user_name}
                                                                        </label>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isDepartmentModalOpen && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="modal-content" style={{
                            backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                            width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="m-0">Add New Department</h4>
                                <button type="button" className="btn-close" onClick={() => setIsDepartmentModalOpen(false)} aria-label="Close"></button>
                            </div>
                            <form onSubmit={handleSaveDepartment}>
                                <div className="mb-3">
                                    <label htmlFor="deptName" className="form-label">Department Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="deptName"
                                        value={newDepartmentName}
                                        onChange={(e) => setNewDepartmentName(e.target.value)}
                                        placeholder="e.g. Design"
                                        required
                                    />
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsDepartmentModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Department</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section >
        </>
    );
}

export default Departments;