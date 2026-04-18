import React, { useEffect, useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import { LiaEditSolid } from "react-icons/lia";
import EditDepartment from "./EditDepartment";
import { API_URL } from "../../proxy";
import DepartmentFilters from "./DepartmentFilters";
import UserForm from "../components/User";
import "./custom.css";
import { IoCloseSharp } from "react-icons/io5";

// Status values that should be treated as "ACTIVE" for the active-project count
const ACTIVE_STATUSES = [
    "not started",
    "off track",
    "offtrack",
    "forwarded to client",
    "follow up",
    "on track",
    "active",
];

function Departments({ setIsLoggedIn }) {
    const [savedFilters, setSavedFilters] = useState([]);
    const [audits, setAudits] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDepartment, setIsDepartment] = useState(false);
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [selectedArchivedDepartments, setSelectedArchivedDepartments] = useState([]);
    const [newDepartmentName, setNewDepartmentName] = useState("");
    const [editingDepartment, setEditingDepartment] = useState({});
    const [userData, setUserData] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [adminTotalProjects, setAdminTotalProjects] = useState(0);
    const [activeProjectsCount, setActiveProjectsCount] = useState(0);
    const [adminActiveProjectsCount, setAdminActiveProjectsCount] = useState(0);
    const [adminTotalTasks, setAdminTotalTasks] = useState(0);
    const [adminActiveTasksByUser, setAdminActiveTasksByUser] = useState({ Aditya: 0, Nikhil: 0 });
    const [adminConfirmationPendingCount, setAdminConfirmationPendingCount] = useState(0);

    const [projectsByStatus, setProjectsByStatus] = useState({
        onTrack: 0,
        activeCT: 0,
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
                const statusFieldName = statusCol?.name ||
                    Object.keys(data[0] || {}).find(key => {
                        const k = key.toLowerCase();
                        return k.includes("status") && !k.includes("showstatus");
                    }) || null;
                if (statusFieldName) setStatusColumnName(statusFieldName);

                // Calculate total projects for the logged-in user by Team Lead field
                if (status?.user_name) {
                    // Use the exact same Team Lead column as the Development filter
                    const teamLeadColumn = Array.isArray(columns) && columns.find(col => {
                        const h = (col.column_heading || "").toLowerCase();
                        return h.includes("team") && (h.includes("lead") || h.includes("leader"));
                    });
                    let adminTeamLeadField = teamLeadColumn?.name;

                    // Fallback: find by key pattern if columns API didn't return the column
                    if (!adminTeamLeadField && data.length > 0) {
                        const firstProject = data[0];
                        adminTeamLeadField =
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
                            adminTeamLeadField ||
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
                    const adminProjects = data.filter(project => {
                        return (
                            project
                        );
                    });
                    setAdminTotalProjects(adminProjects.length);
                    setTotalProjects(userProjects.length);
                    const adminStatusCounts = {
                        onTrack: 0,
                        offTrack: 0,
                        activeCT: 0,
                        forwardedToClient: 0,
                        atRisk: 0,
                        notStarted: 0,
                        followUp: 0,
                        completed: 0
                    };
                    const staffStatusCounts = {
                        onTrack: 0,
                        offTrack: 0,
                        activeCT: 0,
                        forwardedToClient: 0,
                        atRisk: 0,
                        notStarted: 0,
                        followUp: 0,
                        completed: 0
                    };
                    let activeCount = 0;

                    const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    const isActiveStatus = value => {
                        const normalized = (value || "").trim().toLowerCase();
                        return ACTIVE_STATUSES.some(s => {
                            const escaped = escapeRegExp(s.trim().toLowerCase());
                            return new RegExp(`\\b${escaped}\\b`).test(normalized);
                        });
                    };

                    const resolveStatusField = project => {
                        if (statusFieldName && (statusFieldName in project)) {
                            return statusFieldName;
                        }
                        return Object.keys(project).find(
                            key =>
                                key.toLowerCase().includes("status") &&
                                !key.toLowerCase().includes("showstatus")
                        );
                    };

                    const countStatus = (statusValue, counts) => {
                        if (!statusValue) return;
                        const normalizedStatus = String(statusValue).trim().toUpperCase();

                        const wordMatch = (text) => new RegExp(`\\b${text}\\b`).test(normalizedStatus);

                        if (wordMatch("ON TRACK")) {
                            counts.onTrack++;
                        } else if (wordMatch("OFF TRACK")) {
                            counts.offTrack++;
                        } else if (wordMatch("AT RISK")) {
                            counts.atRisk++;
                        } else if (wordMatch("NOT STARTED")) {
                            counts.notStarted++;
                        } else if (normalizedStatus.includes("FORWARDED") || normalizedStatus.includes("FORWORDED")) {
                            counts.forwardedToClient++;
                        } else if (wordMatch("FOLLOW UP") || normalizedStatus.includes("FOLLOWUP") || normalizedStatus.includes("FOLLOW-UP")) {
                            counts.followUp++;
                        } else if (normalizedStatus === "COMPLETED") {
                            counts.completed++;
                        } else if (wordMatch("ACTIVE")) {
                            counts.activeCT++;
                        }
                    };

                    if (status?.status === 'admin') {
                        adminProjects.forEach(project => {
                            const fieldToUse = resolveStatusField(project);
                            if (!fieldToUse) return;

                            const statusValue = project[fieldToUse];
                            countStatus(statusValue, adminStatusCounts);
                        });

                        const totalAdminActiveStatuses = adminStatusCounts.onTrack + adminStatusCounts.offTrack + adminStatusCounts.activeCT + adminStatusCounts.forwardedToClient + adminStatusCounts.atRisk + adminStatusCounts.notStarted + adminStatusCounts.followUp;
                        setProjectsByStatus(adminStatusCounts);
                        setAdminActiveProjectsCount(totalAdminActiveStatuses);
                    } else {
                        userProjects.forEach(project => {
                            const fieldToUse = resolveStatusField(project);
                            if (!fieldToUse) return;

                            const statusValue = project[fieldToUse];
                            countStatus(statusValue, staffStatusCounts);
                        });

                        const totalStaffActiveStatuses = staffStatusCounts.onTrack + staffStatusCounts.offTrack + staffStatusCounts.activeCT + staffStatusCounts.forwardedToClient + staffStatusCounts.atRisk + staffStatusCounts.notStarted + staffStatusCounts.followUp;
                        setProjectsByStatus(staffStatusCounts);
                        activeCount = totalStaffActiveStatuses;
                    }

                    setActiveProjectsCount(activeCount);

                    // Admin-specific dashboard counts
                    const mainProjectColumnName = Array.isArray(columns)
                        ? columns.find(col => col.showInMainProject === true)?.name
                        : null;
                    const adminTotalTasksValue = data.filter(item => {
                        const projectKey = mainProjectColumnName
                            ? mainProjectColumnName
                            : Object.keys(item).find(key => key.startsWith("project1773898690093"));

                        return (
                            item.showstatus === "activate" &&
                            projectKey &&
                            String(item[projectKey] || "").trim() !== ""
                        );
                    }).length;

                    const teamLeadField = Array.isArray(columns) && columns.find(col => {
                        const h = (col.column_heading || "").toLowerCase();
                        return h.includes("team") && (h.includes("lead") || h.includes("leader"));
                    })?.name ||
                        Object.keys(data[0] || {}).find(key => {
                            const k = key.toLowerCase();
                            return (
                                k.startsWith("team_lead") ||
                                k.startsWith("team_leader") ||
                                (k.includes("team") && (k.includes("lead") || k.includes("leader")))
                            );
                        });

                    const developmentStaff = userData
                        .filter(user => user.status === 'staff' && Array.isArray(user.department) && user.department.some(dept => dept.toLowerCase() === 'development'))
                        .map(user => user.user_name.trim().toLowerCase());

                    const USER_ACTIVE_STATUSES = [
                        "not started",
                        "off track",
                        "offtrack",
                        "forwarded to client",
                        "follow up",
                        "on track",
                    ];

                    const isUserActiveStatus = value => {
                        const normalized = (value || "").trim().toLowerCase();
                        return USER_ACTIVE_STATUSES.some(s => {
                            const escaped = escapeRegExp(s.trim().toLowerCase());
                            return new RegExp(`\\b${escaped}\\b`).test(normalized);
                        });
                    };

                    const activeCountsByUser = {
                        Aditya: 0,
                        Nikhil: 0,
                    };
                    if (teamLeadField) {
                        data.forEach(project => {
                            const fieldValue = String(project[teamLeadField] || "").trim().toLowerCase();
                            if (!fieldValue) return;
                            const isActive = isUserActiveStatus(project[resolveStatusField(project)]);
                            if (!isActive) return;
                            if (fieldValue.includes("aditya")) activeCountsByUser.Aditya += 1;
                            if (fieldValue.includes("nikhil")) activeCountsByUser.Nikhil += 1;
                        });
                    }

                    const confirmationPendingCount = data.reduce((count, project) => {
                        const fieldToUse = resolveStatusField(project);
                        const statusValue = fieldToUse ? (project[fieldToUse] || "") : "";
                        const normalized = String(statusValue).trim().toLowerCase();
                        if (!(normalized.includes("confirmation pending") || normalized.includes("pending"))) {
                            return count;
                        }

                        if (!teamLeadField || developmentStaff.length === 0) {
                            return count;
                        }

                        const leadValue = String(project[teamLeadField] || "").trim().toLowerCase();
                        if (!leadValue) return count;

                        const matchesDevStaff = developmentStaff.some(name => leadValue === name || leadValue.startsWith(name + " ") || leadValue.includes(name));
                        return matchesDevStaff ? count + 1 : count;
                    }, 0);

                    setAdminTotalTasks(adminTotalTasksValue);
                    setAdminActiveTasksByUser(activeCountsByUser);
                    setAdminConfirmationPendingCount(confirmationPendingCount);
                }
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            }
        };

        if (status?.user_name) {
            fetchProjectsAndCount();
        }
    }, [status, matchedDepartmentData, matchedDepartmentColumn, userData]);
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
                <Link to={`/department/${row.name.replace(/\d+/g, "")}`}
                    className="text-dark text-decoration-none">{row.department}</Link>
            )
        },
    ];

    return (
        < div className="main-parent" >
            <section className="w-100">
                {status?.status === 'staff' ? (
                    <DepartmentFilters
                        selectedDepartment={selectedDepartment}
                        status={status}
                        totalProjects={totalProjects}
                        projectsByStatus={projectsByStatus}
                        setSelectedDepartment={setSelectedDepartment}
                        activeProjectsCount={activeProjectsCount}
                    />
                ) : (
                    <DepartmentFilters
                    projects={projects}
                        isEditUserModalOpen={isEditUserModalOpen}
                        setIsEditUserModalOpen={setIsEditUserModalOpen}
                        isModalOpen={isModalOpen}
                        setSelectedArchivedDepartments={setSelectedArchivedDepartments}
                        selectedDepartment={selectedDepartment}
                        isArchiveModalOpen={isArchiveModalOpen}
                        setIsArchiveModalOpen={setIsArchiveModalOpen}
                        isDepartmentModalOpen={isDepartmentModalOpen}
                        setIsDepartmentModalOpen={setIsDepartmentModalOpen}
                        savedFilters={savedFilters}
                        setSavedFilters={setSavedFilters}
                        setIsModalOpen={setIsModalOpen}
                        isDepartment={isDepartment}
                        setIsDepartment={setIsDepartment}
                        status={status}
                        handleUnarchiveDepartments={handleUnarchiveDepartments}
                        selectedArchivedDepartments={selectedArchivedDepartments}
                        addUser={addUser}
                        departments={departments}
                        totalProjects={adminTotalProjects}
                        totalTasks={adminTotalTasks}
                        activeProjectsCount={adminActiveProjectsCount}
                        activeTasksByUser={adminActiveTasksByUser}
                        confirmationPendingCount={adminConfirmationPendingCount}
                        setSelectedDepartment={setSelectedDepartment}
                        projectsByStatus={projectsByStatus}
                    />
                )}
                {status?.status === 'admin' &&
                    <div className="custom_alert_first_row py-3 px-4 bg-white rounded mt-4">
                        <h4 className="mb-4">Manage departments</h4>
                        <div className="row">
                            {departments.map((row, rowIndex) => row.status !== 'archived' && (
                                (status?.status === 'admin' || status?.department?.includes(row.department)) && (
                                    <div className="col-12 col-md-12 col-lg-4 mb-3" key={rowIndex}>
                                        {columns.map((column, colIndex) => (
                                            <div className={`cell-input-wrapper  p-2 ${rowIndex}`} key={colIndex}>
                                                <div className="d-flex gap-2 align-items-center justify-content-between">
                                                    {column.render
                                                        ? column.render(row, rowIndex)
                                                        : row[column.accessor]}
                                                    {status?.status === 'admin' && column.accessor === 'department' && (
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
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>}

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
