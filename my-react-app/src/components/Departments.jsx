import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LiaEditSolid } from "react-icons/lia";
import EditDepartment from "./EditDepartment";
import { API_URL } from "../../proxy";
import { MdDashboard } from "react-icons/md";
import { IoPlayCircleOutline } from "react-icons/io5";
import { FaRegCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { CgDanger } from "react-icons/cg";
import { MdOutlineIncompleteCircle } from "react-icons/md";
import { MdOutlinePhoneForwarded } from "react-icons/md";
import { RiChatFollowUpFill } from "react-icons/ri";
import UserForm from "../components/User";
import "./custom.css";
import { IoCloseSharp } from "react-icons/io5";
import { LiaBarsSolid } from "react-icons/lia";

// Status values that should be treated as "ACTIVE"
const ACTIVE_STATUSES = [
    "Not started",
    "OFF TRACK",
    "Forwarded to client",
    "Forwarded to Client",
    "Forworded to Client",
    "At Risk",
    "AT RISK",
    "Offtrack - client",
    "Follow up",
    "ON TRACK",
];

function Departments({ setIsLoggedIn }) {
    const [audits, setAudits] = useState([]);

    const [dataCollection, setDataCollection] = useState("");
    const [columnCollection, setColumnCollection] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedArchivedDepartments, setSelectedArchivedDepartments] = useState([]);
    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isDepartment, setIsDepartment] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState({});
    const [userData, setUserData] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [activeProjectsCount, setActiveProjectsCount] = useState(0);

    const [projectsByStatus, setProjectsByStatus] = useState({
        onTrack: 0,
        offTrack: 0,
        atRisk: 0,
        notStarted: 0,
        forwardedToClient: 0,
        followUp: 0,
        completed: 0,
    });
    const [statusColumnName, setStatusColumnName] = useState(null);
    const [status, setStatus] = useState(() => {
        const savedData = localStorage.getItem('user');
        return savedData ? JSON.parse(savedData) : null;
    });
    const [selectedDepartment, setSelectedDepartment] = useState(() => {
        const savedData = localStorage.getItem('user');
        const parsed = savedData ? JSON.parse(savedData) : null;
        return parsed?.department?.[0] || "";
    });

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${API_URL}/api/department`);
            const data = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const selectedDepartmentDown = selectedDepartment.toLowerCase();
    const matchedDepartment = departments.find(
        (department) => department.department.toLowerCase() === selectedDepartmentDown
    );
    const matchedDepartmentData = matchedDepartment?.dataCollection;
    const matchedDepartmentColumn = matchedDepartment?.columnCollection;
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const addUser = async (e) => {
        setIsUserFormOpen(true);
    }

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
                setUserData(prevData => prevData.map(u => u._id === user._id ? updatedUser : u));
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

    const fetchAudits = async () => {
        try {
            const response = await fetch(`${API_URL}/api/audit`);
            const data = await response.json();
            setAudits(data);
        } catch (err) {
            console.error("Failed to fetch audits:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/user`);
            const data = await response.json();
            setUserData(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchUsers();
        fetchAudits();
    }, []);

    const lastActiveTime = useMemo(() => {
        if (!status?.user_name || !audits.length) return null;
        // Audits are fetched sorted by changedAt desc
        const latest = audits.find(a => a.changedByUserName === status.user_name);
        return latest ? latest.changedAt : null;
    }, [audits, status]);

    useEffect(() => {
        if (!status?.department) return;

        const isAnyDepartmentTrue = status.department.some(dept => dept === true);
        setIsDepartment(isAnyDepartmentTrue);

        if (status.department.length > 0 && !selectedDepartment) {
            setSelectedDepartment(status.department[0]);
        }
    }, [status, selectedDepartment]);
    useEffect(() => {
        if (!matchedDepartmentData || !matchedDepartmentColumn) return;
        const fetchProjectsAndCount = async () => {
            try {
                // Fetch projects and columns together (same as Development page)
                const projectsRes = await fetch(`${API_URL}/api/data?collectionName=${matchedDepartmentData}s`);
                const columnsRes = await fetch(`${API_URL}/api/columns?collectionName=${matchedDepartmentColumn}`);
                const data = await projectsRes.json();
                const columns = await columnsRes.json();
                setProjects(data);
                // Find Status column for active filter (used when clicking ACTIVE card)
                const statusCol = Array.isArray(columns) && columns.find(col => {
                    const h = (col.column_heading || "").toLowerCase();
                    return h.includes("status") && !h.includes("showstatus");
                });
                if (statusCol?.name) setStatusColumnName(statusCol.name);

                // Calculate total projects for the logged-in user by Team Lead field
                if (status?.user_name) {
                    // Use the exact same Team Lead column as the Development filter
                    const teamLeadColumn = Array.isArray(columns) && columns.find(col => {
                        const h = (col.column_heading || "").toLowerCase();
                        return h.includes("team") && (h.includes("lead") || h.includes("leader"));
                    });
                    let teamLeadField = teamLeadColumn?.name;

                    // Fallback: find by key pattern if columns API didn't return the column
                    if (!teamLeadField && data.length > 0) {
                        const firstProject = data[0];
                        teamLeadField =
                            Object.keys(firstProject).find(key => {
                                const k = key.toLowerCase();
                                return (
                                    k.startsWith("team_lead") ||
                                    k.startsWith("team_leader") ||
                                    (k.includes("team") &&
                                        (k.includes("lead") || k.includes("leader")))
                                );
                            }) || null;
                    }

                    const userNameNorm = (status.user_name || "").trim().toLowerCase();
                    const userProjects = data.filter(project => {
                        const field =
                            teamLeadField ||
                            Object.keys(project).find(key => {
                                const k = key.toLowerCase();
                                return (
                                    k.startsWith("team_lead") ||
                                    k.startsWith("team_leader") ||
                                    (k.includes("team") &&
                                        (k.includes("lead") || k.includes("leader")))
                                );
                            });
                        if (!field || !(field in project)) return false;
                        const projectValue = (project[field] || "").trim().toLowerCase();
                        return (
                            projectValue === userNameNorm ||
                            projectValue.startsWith(userNameNorm + " ")
                        );
                    });
                    setTotalProjects(userProjects.length);

                    // Calculate projects by status
                    const statusCounts = {
                        onTrack: 0,
                        offTrack: 0,
                        forwardedToClient: 0,
                        atRisk: 0,
                        notStarted: 0,
                        followUp: 0,
                        completed: 0
                    };
                    let activeCount = 0;

                    const isActiveStatus = value => {
                        const normalized = (value || "").trim().toLowerCase();
                        return ACTIVE_STATUSES.some(
                            s => normalized.includes(s.trim().toLowerCase())
                        );
                    };

                    userProjects.forEach(project => {
                        // Use identified statusColumnName if available, else fallback to search
                        const fieldToUse = statusColumnName && (statusColumnName in project)
                            ? statusColumnName
                            : Object.keys(project).find(
                                key =>
                                    key.toLowerCase().includes("status") &&
                                    !key.toLowerCase().includes("showstatus")
                            );

                        if (fieldToUse) {
                            const statusValue = project[fieldToUse];

                            if (!statusValue) return;

                            const normalizedStatus = String(statusValue).trim().toUpperCase();

                            // Use fuzzy matching for status counts to match Development filter behavior
                            if (normalizedStatus.includes("ON TRACK")) {
                                statusCounts.onTrack++;
                            } else if (normalizedStatus.includes("OFF TRACK")) {
                                statusCounts.offTrack++;
                            } else if (normalizedStatus.includes("AT RISK")) {
                                statusCounts.atRisk++;
                            } else if (normalizedStatus.includes("NOT STARTED")) {
                                statusCounts.notStarted++;
                            } else if (normalizedStatus.includes("FORWARDED") || normalizedStatus.includes("FORWORDED")) {
                                statusCounts.forwardedToClient++;
                            } else if (normalizedStatus.includes("FOLLOW UP")) {
                                statusCounts.followUp++;
                            } else if (normalizedStatus.includes("COMPLETED")) {
                                statusCounts.completed++;
                            }

                            if (isActiveStatus(normalizedStatus)) {
                                activeCount++;
                            }
                        }
                    });

                    setProjectsByStatus(statusCounts);
                    setActiveProjectsCount(activeCount);
                }
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            }
        };

        if (status?.user_name) {
            fetchProjectsAndCount();
        }
    }, [status, matchedDepartmentData, matchedDepartmentColumn]);


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
                // localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                console.error("Failed to update department");
            }
        } catch (err) {
            console.error("Error updating department:", err);
        }
    };

    const columns = [
        {
            header: 'Department',
            accessor: 'department',
            render: (row) => (
                <div className="cell-input-wrapper">
                    <Link to={`/department/${row.name.replace(/\d+/g, "")}`}
                        className="text-dark">{row.department}</Link>
                </div>
            )
        },
    ];

    return (
        < div className="main-parent" >
            <section className="w-100">

                {status?.status === 'admin' &&
                    <div className="row">

                        <div className="col-md-12">
                            <table className="table" style={{ 'marginBottom': "0" }}>
                                <thead className="thead-primary">
                                    <tr>
                                        {columns.map((column, index) => (
                                            <th className="p-2 w-100 d-flex justify-content-between align-items-center" key={index}>{column.header}
                                                {status?.status === 'admin' ? (
                                                    <div className="d-flex align-items-center justify-content-end gap-2 position-relative">
                                                        <div className="dropdown">
                                                            <button
                                                                className="btn btn-secondary text-dark d-inline-flex align-items-center p-2"
                                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                            >
                                                                <LiaBarsSolid />
                                                            </button>
                                                            {isDropdownOpen && (
                                                                <div className="dropdown-menu show dropdown-menu-end position-absolute" style={{ top: "100%", right: 0, zIndex: 10 }}>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => {
                                                                            setIsDropdownOpen(false);
                                                                            setIsDepartmentModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Create
                                                                    </button>
                                                                    {departments.filter(d => d.status === 'archived').length > 0 && (
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() => {
                                                                                setIsDropdownOpen(false);
                                                                                setSelectedArchivedDepartments([]);
                                                                                setIsArchiveModalOpen(true);
                                                                            }}
                                                                        >
                                                                            Archived
                                                                        </button>
                                                                    )}
                                                                    {status?.status === 'admin' && (
                                                                        <>
                                                                            <button className="dropdown-item" onClick={addUser}>Add User</button>
                                                                            <button className="dropdown-item" onClick={() => setIsEditUserModalOpen(true)}>Edit User</button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>) : null}
                                            </th>
                                        ))}

                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map((row, rowIndex) => row.status !== 'archived' && (
                                        (status?.status === 'admin' || status?.department?.includes(row.department)) && (
                                            <tr className="w-100" key={rowIndex}>
                                                {columns.map((column, colIndex) => (
                                                    <td className="p-2 w-100 d-flex justify-content-between align-items-center" key={colIndex}>
                                                        {column.render
                                                            ? column.render(row, rowIndex)
                                                            : row[column.accessor]}
                                                        {status?.status === 'admin' && column.accessor === 'department' && (
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <button
                                                                    className="action-btn-mini action-btn-mini_ct"
                                                                    title="Edit"
                                                                    onClick={() => {
                                                                        setEditingDepartment(row);
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                >
                                                                    <LiaEditSolid />
                                                                </button>
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
                    </div>}

                {/* Display Total Projects for Logged-in Staff */}
                {status?.status === 'staff' && (
                    <div className="row ">
                        <div className="col-md-12">
                            <div className="alert alert-light border">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h2 className="mb-3"> <strong> Welcome back, {status.user_name}!</strong></h2>
                                        <p>Here's what happening with your project's today</p>
                                    </div>
                                    <div className="staff__analytics d-flex flex-column align-items-end gap-2">
                                        {status?.department?.length > 1 ? (
                                            <ul className="nav nav-pills g-1" style={{ fontSize: "0.875rem", columnGap: "8px" }}>
                                                {status.department.map(dept => (
                                                    <li className="nav-item" key={dept}>
                                                        <button
                                                            className={`btn btn-sm btn-outline-primary ${selectedDepartment === dept ? 'active' : ''} `}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSelectedDepartment(dept);
                                                            }}
                                                            style={{ cursor: 'pointer', border: '1px solid transparent' }}
                                                        >
                                                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <a href={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`} className="btn btn-primary btn-sm mt-2">View All Analytics</a>
                                        )}
                                    </div>
                                </div>
                                <div className="row g-3">
                                    {/* Total Projects Card */}
                                    <div className="col-md-3">
                                        <div className="card border-primary">
                                            <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-projects`} className="text-dark text-decoration-none">

                                                <div className="card-body">
                                                    <MdDashboard />


                                                    <h6 className="card-title text-muted mb-2">Total Projects</h6>
                                                    <h2 className="mb-0 text-primary">{totalProjects}</h2>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* ACTIVE Card - click to go to Development with active filter applied */}
                                    <div className="col-md-3">
                                        <div className="card border-danger">
                                            <Link
                                                to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-active-projects`}
                                                className="text-dark text-decoration-none"
                                            >
                                                <div className="card-body ">
                                                    <IoPlayCircleOutline />

                                                    <h6 className="card-title text-muted mb-2">
                                                        ACTIVE Projects
                                                    </h6>
                                                    <h2 className="mb-0 text-danger">
                                                        {activeProjectsCount}
                                                    </h2>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* ON TRACK Card */}
                                    <div className="col-md-3">
                                        <div className="card border-success">
                                            <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-on-track-projects`} className="text-dark text-decoration-none">

                                                <div className="card-body ">
                                                    <FaRegCheckCircle />

                                                    <h6 className="card-title text-muted mb-2">ON TRACK</h6>
                                                    <h2 className="mb-0 text-success">{projectsByStatus.onTrack}</h2>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* OFF TRACK Card */}
                                    <div className="col-md-3">
                                        <div className="card border-warning">
                                            <Link to={`/department/${(selectedDepartment || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-off-track-projects`} className="text-dark text-decoration-none">
                                                <div className="card-body">
                                                    <RxCrossCircled />

                                                    <h6 className="card-title text-muted mb-2">OFF TRACK</h6>
                                                    <h2 className="mb-0 text-warning">{projectsByStatus.offTrack}</h2>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* AT RISK Card */}
                                    <div className="col-md-3">
                                        <div className="card border-info">
                                            <Link to={`/department/${(selectedDepartment || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-not-started-projects`} className="text-dark text-decoration-none">
                                                <div className="card-body">
                                                    <CgDanger />

                                                    <h6 className="card-title text-muted mb-2">NOT STARTED</h6>
                                                    <h2 className="mb-0 text-danger">{projectsByStatus.notStarted}</h2>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Follow up */}

                                    <div className="col-md-3">
                                        <div className="card border-dark">
                                            <Link to={`/department/${(selectedDepartment || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-follow-up`} className="text-dark text-decoration-none">
                                                <div className="card-body">
                                                    <RiChatFollowUpFill />

                                                    <h6 className="card-title text-muted mb-2">Follow up</h6>
                                                    <h2 className="mb-0 text-danger">{projectsByStatus.followUp}</h2>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Forwarded to client projects */}
                                    <div className="col-md-3">
                                        <div className="card border-warning">
                                            <Link to={`/department/${(selectedDepartment || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-forwarded-projects`} className="text-dark text-decoration-none">
                                                <div className="card-body">
                                                    <MdOutlinePhoneForwarded />

                                                    <h6 className="card-title text-muted mb-2">Forwarded to client</h6>
                                                    <h2 className="mb-0 text-danger">{projectsByStatus.forwardedToClient}</h2>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>


                                    {/* Completed projects */}
                                    <div className="col-md-3">
                                        <div className="card border-success">
                                            <Link to={`/department/${(selectedDepartment || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-completed-projects`} className="text-dark text-decoration-none">
                                                <div className="card-body">
                                                    <MdOutlineIncompleteCircle />

                                                    <h6 className="card-title text-muted mb-2">Completed</h6>
                                                    <h2 className="mb-0 text-danger">{projectsByStatus.completed}</h2>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }

                {/* Edit User Status Modal */}
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
                                        .filter(user => user.user_name !== 'Mandasa Technologies')
                                        .map((user) => (
                                            <div key={user._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                                                <span className="fw-semibold">{user.user_name}</span>
                                                <div className="d-flex gap-3">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name={`status - ${user._id} `}
                                                            id={`staff - ${user._id} `}
                                                            value="staff"
                                                            checked={user.status === 'staff'}
                                                            onChange={() => handleStatusChange(user, 'staff')}
                                                        />
                                                        <label className="form-check-label" htmlFor={`staff - ${user._id} `}>Staff</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name={`status - ${user._id} `}
                                                            id={`admin - ${user._id} `}
                                                            value="admin"
                                                            checked={user.status === 'admin'}
                                                            onChange={() => handleStatusChange(user, 'admin')}
                                                        />
                                                        <label className="form-check-label" htmlFor={`admin - ${user._id} `}>Admin</label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                                    {departments.filter(d => d.status === 'archived').length === 0 ? (
                                        <p className="text-muted">No archived departments.</p>
                                    ) : (
                                        <div className="list-group">
                                            {departments.filter(d => d.status === 'archived').map(dept => (
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
            </section>
            <EditDepartment handleCheckboxChange={handleCheckboxChange} userData={userData} isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} department={editingDepartment} fetchDepartments={fetchDepartments} />

            <UserForm isUserFormOpen={isUserFormOpen} onClose={() => setIsUserFormOpen(false)} onUserCreated={fetchUsers} />
        </div >
    );
}

export default Departments;
