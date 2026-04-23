import React, { useEffect, useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import { LiaEditSolid } from "react-icons/lia";
import EditDepartment from "./EditDepartment";
import { API_URL } from "../../proxy";
import DepartmentFilters from "./DepartmentFilters";
import UserForm from "../components/User";
import "./custom.css";

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

function Departments({ isFiltersLoading, selectedDepartment, setIsLoggedIn }) {
    const [audits, setAudits] = useState([]);
    const [savedFilters, setSavedFilters] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDepartment, setIsDepartment] = useState(false);
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [selectedArchivedDepartments, setSelectedArchivedDepartments] = useState([]);
    const [newDepartmentName, setNewDepartmentName] = useState("");

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

    const [userData, setUserData] = useState(() => getCachedValue('userData', []));
    const [departments, setDepartments] = useState(() => getCachedValue('departments', []));
    const [projects, setProjects] = useState([]);
    const [projectColumns, setProjectColumns] = useState([]);
    const [mainProjects, setMainProjects] = useState(() => getCachedValue('mainProjects', []));
    const [result, setResult] = useState(() => getCachedValue('adminTotalProjectCount', 0));
    const [totalProjects, setTotalProjects] = useState(0);
    const [adminTotalProjects, setAdminTotalProjects] = useState(() => getCachedValue('adminTotalTasks', 0));
    const [activeProjectsCount, setActiveProjectsCount] = useState(0);
    const [adminActiveProjectsCount, setAdminActiveProjectsCount] = useState(0);
    const [adminTotalTasks, setAdminTotalTasks] = useState(0);
    const [adminActiveTasksByUser, setAdminActiveTasksByUser] = useState({ Aditya: 0, Nikhil: 0 });
    const [adminConfirmationPendingCount, setAdminConfirmationPendingCount] = useState(0);
    const [countsLoading, setCountsLoading] = useState(true);

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

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${API_URL}/api/department`);
            const data = await response.json();
            setDepartments(data);
            setCachedValue('departments', data);
        } catch (err) {
            console.error("Failed to fetch departments:", err);
        }
    };

    useEffect(() => {
        const cachedMainProjects = getCachedValue('mainProjects', []);
        if (cachedMainProjects.length > 0) {
            setMainProjects(cachedMainProjects);
        }

        fetch(`${API_URL}/api/mainProject`)
            .then(res => res.json())
            .then(data => {
                setMainProjects(data);
                setCachedValue('mainProjects', data);
            })
            .catch(err => console.error("Failed to fetch main projects:", err));
    }, []);

    useEffect(() => {
        if (projects.length === 0) return;

        const uniqueIds = [
            ...new Set(
                projects
                    .map(p => p.mainProjectId)
                    .filter(id => id !== undefined && id !== null && id !== "")
                    .map(id => String(id))
            )
        ];

        const projectList = uniqueIds.map(id => ({
            mainProjectId: id,
            projectCount: 1
        }));

        const uniqueCount = projectList.length;
        setResult(uniqueCount);
        setCachedValue('adminTotalProjectCount', uniqueCount);
    }, [projects, result]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const selectedDepartmentDown = selectedDepartment.toLowerCase();
    const matchedDepartment = departments.find(
        (department) => department.department.toLowerCase() === selectedDepartmentDown
    );
    const matchedDepartmentData = matchedDepartment?.dataCollection;
    const matchedDepartmentColumn = matchedDepartment?.columnCollection;

    // const handleStatusChange = async (user, newStatus) => {
    //     try {
    //         const response = await fetch(`${API_URL}/api/user/${user._id}`, {
    //             method: "PATCH",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ status: newStatus }),
    //         });

    //         if (response.ok) {
    //             const updatedUser = await response.json();
    //             setUserData(prevData => {
    //                 const updatedUsers = prevData.map(u => u._id === user._id ? updatedUser : u);
    //                 setCachedValue('userData', updatedUsers);
    //                 return updatedUsers;
    //             });
    //         } else {
    //             console.error("Failed to update user status");
    //         }
    //     } catch (err) {
    //         console.error("Error updating user status:", err);
    //     }
    // };

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
            setCachedValue('userData', data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchUsers();
        fetchAudits();
    }, []);

    useEffect(() => {
        if (!status?.department) return;

        const isAnyDepartmentTrue = status.department.some(dept => dept === true);
        setIsDepartment(isAnyDepartmentTrue);

        if (status.department.length > 0 && !selectedDepartment) {
            // setSelectedDepartment(status.department[0]);
        }
    }, [status, selectedDepartment]);
    useEffect(() => {
        if (!matchedDepartmentData || !matchedDepartmentColumn || !status?.user_name) {
            setCountsLoading(false);
            return;
        }

        const projectsCacheKey = `projects_${matchedDepartmentData}`;
        const columnsCacheKey = `columns_${matchedDepartmentColumn}`;
        const cachedProjects = getCachedValue(projectsCacheKey, null);
        const cachedColumns = getCachedValue(columnsCacheKey, null);

        if (cachedProjects) {
            setProjects(cachedProjects);
        }

        if (cachedColumns) {
            setProjectColumns(cachedColumns);
        }

        const fetchProjectsAndCount = async () => {
            setCountsLoading(true);
            try {
                // Fetch projects and columns together (same as Development page)
                const projectsRes = await fetch(`${API_URL}/api/data?collectionName=${matchedDepartmentData}s`);
                const columnsRes = await fetch(`${API_URL}/api/columns?collectionName=${matchedDepartmentColumn}`);
                const data = await projectsRes.json();
                const columns = await columnsRes.json();
                setProjects(data);
                setProjectColumns(columns);
                setCachedValue(projectsCacheKey, data);
                setCachedValue(columnsCacheKey, columns);
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
                    const adminProjectCount = adminProjects.length;
                    setAdminTotalProjects(adminProjectCount);
                    setCachedValue('adminTotalTasks', adminProjectCount);
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

                    setAdminTotalTasks(adminProjects.length);
                    setAdminActiveTasksByUser(activeCountsByUser);
                    setAdminConfirmationPendingCount(confirmationPendingCount);
                }
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            } finally {
                setCountsLoading(false);
            }
        };

        if (status?.user_name) {
            fetchProjectsAndCount();
        }
    }, [status, matchedDepartmentData, matchedDepartmentColumn, userData]);

    return (
        < div className="main-parent" >
            <section className="w-100">
                {status?.status === 'staff' ? (
                    <DepartmentFilters
                        selectedDepartment={selectedDepartment}
                        status={status}
                        totalProjects={totalProjects}
                        projectsByStatus={projectsByStatus}
                        activeProjectsCount={activeProjectsCount}
                        countsLoading={countsLoading}
                    />
                ) : (
                    <DepartmentFilters
                        result={result}
                        isFiltersLoading={isFiltersLoading}
                        projects={projects}
                        columns={projectColumns}
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
                        selectedArchivedDepartments={selectedArchivedDepartments}
                        departments={departments}
                        totalProjects={adminTotalProjects}
                        totalTasks={adminTotalTasks}
                        activeProjectsCount={adminActiveProjectsCount}
                        countsLoading={countsLoading}
                        activeTasksByUser={adminActiveTasksByUser}
                        confirmationPendingCount={adminConfirmationPendingCount}
                        // setSelectedDepartment={setSelectedDepartment}
                        projectsByStatus={projectsByStatus}
                    />
                )}
            </section>
        </div >
    );
}

export default Departments;
