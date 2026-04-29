import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo-white.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Drawer.css';
import { API_URL } from '../../proxy';
import EditDepartment from "./EditDepartment";
import { LiaEditSolid } from 'react-icons/lia';
import { IoCloseSharp } from "react-icons/io5";
import { MdArchive } from "react-icons/md";
import { IoCreate } from "react-icons/io5";
import { RiUserAddLine, RiDeleteBin6Line } from "react-icons/ri";
import { LiaUserEditSolid } from "react-icons/lia";
import UserForm from './User'
import Profile from './profile';

const Drawer = ({ selectedDepartment, fetchDepartments, allDepartments, isOpen, status, onClose, handleLogout }) => {
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDepartment, setIsDepartment] = useState(false);
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [selectedArchivedDepartments, setSelectedArchivedDepartments] = useState([]);
    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [userData, setUserData] = useState([]);
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/user`);
            const data = await response.json();
            setUserData(data);
            setCachedValue('userData', data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getCachedValue = (key, fallback = null) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
            console.warn("Failed to read local cache:", key, err);
            return fallback;
        }
    };

    const setCachedValue = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn("Failed to save local cache:", key, err);
        }
    };

    const [editingDepartment, setEditingDepartment] = useState({});

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
                console.log("Updated user departments:", updatedUser);
                setUserData(prevData => {
                    const updatedUsers = prevData.map(u => u._id === user._id ? updatedUser : u);
                    setCachedValue('userData', updatedUsers);
                    return updatedUsers;
                });
            } else {
                console.error("Failed to update department");
            }
        } catch (err) {
            console.error("Error updating department:", err);
        }
    };
    const handleStatusChange = async (user, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/user/${user._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUserData(prevData => {
                    const updatedUsers = prevData.map(u => u._id === user._id ? updatedUser : u);
                    setCachedValue('userData', updatedUsers);
                    return updatedUsers;
                });
            } else {
                console.error("Failed to update user status");
            }
        } catch (err) {
            console.error("Error updating user status:", err);
        }
    };

    const handleSaveDepartment = async (e) => {
        e.preventDefault();
        const deptName = newDepartmentName.trim(); // ✅ store first
        if (!deptName) return;

        try {
            const response = await fetch(`${API_URL}/api/department`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    department: deptName,
                    // Internal name will be handled by backend
                }),
            });

            if (response.ok) {
                try {
                    const response2 = await fetch(`${API_URL}/api/create-collection`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ collectionName: deptName }) // ✅ correct
                    });

                    if (!response2.ok) {
                        throw new Error('Failed to create collection');
                    }

                    const data2 = await response2.json();
                    console.log(data2.message);
                    alert(data2.message);

                } catch (error) {
                    console.error('Error creating collection:', error);
                    alert('Error creating collection');
                }
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

    const handleUnarchiveDepartments = async () => {
        try {
            await Promise.all(
                selectedArchivedDepartments.map(id =>
                    fetch(`${API_URL}/api/department/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "Active" }),
                    })
                )
            );
            setIsArchiveModalOpen(false);
            setSelectedArchivedDepartments([]);
            fetchDepartments();
        } catch (err) {
            console.error("Failed to unarchive departments:", err);
        }
    };

    const handleDeleteUser = async () => {
        try {
            await fetch(`${API_URL}/api/user/${userToDelete._id}`, {
                method: "DELETE",
            });
            setUserToDelete(null);
            fetchUsers();
        } catch (err) {
            console.error("Failed to delete user:", err);
        }
    };

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
                        <div className="nav-section">Main</div>
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
                        {/* <div className="drawer-nav-item">
                            <NavLink
                                to="/department/development"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                Tasks
                            </NavLink>
                        </div>
                        <div className="drawer-nav-item">
                            <NavLink
                                to="/department/development"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8M12 17v4"></path></svg>
                                Projects
                            </NavLink>
                        </div> */}
                        {/* <div className="drawer-nav-item coming_soon_link">
                            <NavLink
                                to="/team"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <span className='coming_soon_badge'>COMING SOON</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path></svg>
                                Team
                            </NavLink>
                        </div> */}
                        {/* <div className="drawer-nav-item coming_soon_link">
                            <NavLink
                                to="/reports"
                                className={({ isActive }) => `drawer-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <span className='coming_soon_badge text-danger fw-bold'>COMING SOON</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"></path></svg>
                                Reports
                            </NavLink>
                        </div> */}
                        <div className="nav-section">Departments</div>
                        {status?.status === 'admin' ? (
                            allDepartments.map((row, rowIndex) => row.status !== 'archived' && (
                                <div className="drawer-nav-item" key={row.name}>
                                    <div className={`drawer-nav-link d-flex justify-content-between`}>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="dept-dot"></span>
                                            <NavLink className="text-decoration-none text-white" to={`/department/${row?.department?.toLowerCase()}`}>
                                            {row?.department ? row?.department?.charAt(0).toUpperCase() + row?.department?.slice(1) : ''}</NavLink>
                                        </div>
                                        <button
                                            className="action-btn-mini text-white action-btn-mini_ct"
                                            title="Edit"
                                            onClick={() => {
                                                setEditingDepartment(row);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            <LiaEditSolid />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            status?.department?.map((dept) => (
                                <div className="drawer-nav-item" key={dept}>
                                    <NavLink
                                        to={`/department/${dept.toLowerCase()}`}
                                        className={`drawer-nav-link`}
                                        onClick={onClose}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path></svg>
                                        {dept}
                                    </NavLink>
                                </div>
                            ))
                        )}
                        {
                            isEditUserModalOpen && (
                                <div className="modal-overlay" style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                                }}>
                                    <div className="modal-content" style={{
                                        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                                        width: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4 className="m-0"><strong>Edit User Status</strong></h4>
                                            <button type="button" className="close-btn" onClick={() => setIsEditUserModalOpen(false)} aria-label="Close"><IoCloseSharp /></button>
                                        </div>
                                        <div>
                                            {userData
                                                .filter(user => user.user_name !== status.user_name)
                                                .map((user) => (
                                                    <div key={user._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="fw-semibold">{user.user_name}</span>
                                                        </div>
                                                        <div className="d-flex gap-3">
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name={`status-${user._id}`}
                                                                    id={`staff-${user._id}`}
                                                                    value="staff"
                                                                    checked={user.status === 'staff'}
                                                                    onChange={() => handleStatusChange(user, 'staff')}
                                                                />
                                                                <label className="form-check-label" htmlFor={`staff-${user._id}`}>Team leader</label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name={`status-${user._id}`}
                                                                    id={`admin-${user._id}`}
                                                                    value="admin"
                                                                    checked={user.status === 'admin'}
                                                                    onChange={() => handleStatusChange(user, 'admin')}
                                                                />
                                                                <label className="form-check-label" htmlFor={`admin-${user._id}`}>Admin</label>
                                                            </div>
                                                            <button
                                                                className="btn btn-link text-danger p-0 border-0"
                                                                title="Delete User"
                                                                onClick={() => setUserToDelete(user)}
                                                            >
                                                                <RiDeleteBin6Line size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {
                            userToDelete && (
                                <div className="modal-overlay" style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                                    justifyContent: 'center', alignItems: 'center', zIndex: 1100
                                }}>
                                    <div className="modal-content" style={{
                                        backgroundColor: 'white', padding: '25px', borderRadius: '12px',
                                        width: '400px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                    }}>
                                        <h5 className="mb-4">Want to delete <strong>{userToDelete.user_name}</strong>?</h5>
                                        <div className="d-flex justify-content-center gap-3">
                                            <button
                                                className="btn btn-secondary px-4"
                                                onClick={() => setUserToDelete(null)}
                                            >
                                                No
                                            </button>
                                            <button
                                                className="btn btn-danger px-4"
                                                onClick={handleDeleteUser}
                                            >
                                                Yes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {
                            isDepartmentModalOpen && (
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
                                            <button type="button" className="close-btn" onClick={() => setIsDepartmentModalOpen(false)} aria-label="Close"><IoCloseSharp /></button>
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
                            )
                        }

                        {
                            isArchiveModalOpen && (
                                <div className="modal-overlay" style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                                }}>
                                    <div className="modal-content" style={{
                                        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                                        width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxHeight: '80vh', overflowY: 'auto'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4 className="m-0">Archived Departments</h4>
                                            <button type="button" className="close-btn" onClick={() => setIsArchiveModalOpen(false)} aria-label="Close"><IoCloseSharp /></button>
                                        </div>
                                        <div className="mb-3">
                                            {allDepartments.filter(d => d.status === 'archived').length === 0 ? (
                                                <p className="text-muted">No archived departments.</p>
                                            ) : (
                                                <div className="list-group">
                                                    {allDepartments.filter(d => d.status === 'archived').map(dept => (
                                                        <label key={dept._id} className="list-group-item d-flex gap-2 align-items-center" style={{ cursor: "pointer" }}>
                                                            <input
                                                                className="form-check-input flex-shrink-0 m-0"
                                                                type="checkbox"
                                                                value={dept._id}
                                                                checked={selectedArchivedDepartments.includes(dept._id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedArchivedDepartments(prev => [...prev, dept._id]);
                                                                    } else {
                                                                        setSelectedArchivedDepartments(prev => prev.filter(id => id !== dept._id));
                                                                    }
                                                                }}
                                                            />
                                                            <span>
                                                                {dept.department}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsArchiveModalOpen(false)}>Close</button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleUnarchiveDepartments}
                                                disabled={selectedArchivedDepartments.length === 0}
                                            >
                                                Unarchive Selected
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {status?.status === 'admin' && (
                            <>
                                <div className="nav-section">Create or Manage Departments</div>

                                <div className="drawer-nav-item button__drawer_nav position-relative">
                                    <div
                                        className={`drawer-nav-link relative`}
                                    >
                                        <MdArchive />
                                        <button type='button' onClick={() => setIsArchiveModalOpen(true)} className="w-100 text-start p-0 text-white btn btn-transparent border-0">Archive Departments</button>
                                    </div>
                                </div>
                                <div className="drawer-nav-item button__drawer_nav position-relative">
                                    <div
                                        className={`drawer-nav-link relative`}
                                    >
                                        <IoCreate />
                                        <button type='button' onClick={() => setIsDepartmentModalOpen(true)} className="w-100 p-0 text-start text-white btn btn-transparent border-0">Create Department</button>
                                    </div>
                                </div>
                                <div className="drawer-nav-item button__drawer_nav position-relative">
                                    <div
                                        className={`drawer-nav-link relative`}
                                    >
                                        <RiUserAddLine />
                                        <button type='button' onClick={() => setIsUserFormOpen(true)} className="w-100 text-start p-0 text-white btn btn-transparent border-0">Create User</button>
                                    </div>
                                </div>
                                <div className="drawer-nav-item button__drawer_nav position-relative">
                                    <div
                                        className={`drawer-nav-link relative`}
                                    >
                                        <LiaUserEditSolid />
                                        <button type='button' onClick={() => setIsEditUserModalOpen(true)} className="text-start w-100 p-0 text-white btn btn-transparent border-0">Edit User</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </nav>
                </div >

                <div className="drawer-footer">
                    <Profile handleLogout={handleLogout} status={status} />
                </div>
            </div >
            <UserForm isUserFormOpen={isUserFormOpen} onClose={() => setIsUserFormOpen(false)} onUserCreated={fetchUsers} />
            <EditDepartment handleCheckboxChange={handleCheckboxChange} userData={userData} isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} department={editingDepartment} fetchDepartments={fetchDepartments} />
        </>
    );
};

export default Drawer;
