import { useCallback, useEffect } from 'react';
import { MdDashboard, MdOutlineIncompleteCircle, MdOutlinePhoneForwarded } from 'react-icons/md';
import { IoPlayCircleOutline } from 'react-icons/io5';
import { FaRegCheckCircle } from 'react-icons/fa';
import { RxCrossCircled } from 'react-icons/rx';
import { CgDanger } from 'react-icons/cg';
import { RiChatFollowUpFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { FaTasks } from "react-icons/fa";
import { API_URL } from "../../proxy";
import { CiUser } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";

import { GiRadioactive } from "react-icons/gi";
import { GrProjects } from "react-icons/gr";
import { GiHamburgerMenu } from "react-icons/gi";

import {
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaUser,
    FaProjectDiagram
} from "react-icons/fa";


import { useState } from 'react';

function DepartmentFilters({ selectedDepartment, setSelectedArchivedDepartments, isArchiveModalOpen, setIsArchiveModalOpen, isModalOpen, setIsModalOpen, isDepartment, isEditUserModalOpen, setIsEditUserModalOpen, selectedDepartmentDown, isDepartmentModalOpen, setIsDepartmentModalOpen, projects, addUser, departments, status, totalProjects, totalTasks, activeProjectsCount, activeTasksByUser = {}, confirmationPendingCount, projectsByStatus, setSelectedDepartment }) {
    const [savedFilters, setSavedFilters] = useState([]);
    const departmentKey = selectedDepartment.toLowerCase();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const iconMap = {
        "completed": FaCheckCircle,
        "pending": FaClock,
        "confirmation": FaExclamationTriangle,
        "aditya": FaRegUser,
        "nikhil": FaRegUser,
        "active": GiRadioactive,
        "project": FaProjectDiagram
    };
    const getIconFromFilterName = (name) => {
        const lower = (name || "").toLowerCase().trim().replace(/[^\w\s-]/g, ""); // remove special chars

        console.log("lower", lower);
        const matchKey = Object.keys(iconMap).find(key =>
            lower.includes(key)
        );

        return matchKey ? iconMap[matchKey] : FaTasks; // fallback icon
    };
    const fetchSavedFilters = useCallback(async () => {
        if (!status?._id) return;
        try {
            const url = `${API_URL}/api/filters?userId=${status._id}${departmentKey ? `&department=${departmentKey}` : ""}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch filters');
            const data = await response.json();
            setSavedFilters(data);
        } catch (err) {
            console.error('Failed to load saved filters:', err);
        }
    }, [status?._id, departmentKey]);
    useEffect(() => {
        fetchSavedFilters();
    }, [fetchSavedFilters, selectedDepartment]);
    const countMatchingRows = (filterData) => {
        if (!filterData || !projects) return 0;

        let matchingCount = 0;
        projects.forEach(row => {
            let rowMatches = true;

            Object.keys(filterData).forEach(key => {
                const filterValue = filterData[key];
                if (filterValue === undefined || filterValue === null) return;

                // Handle Date Range (object with start/end)
                if (typeof filterValue === "object" && !Array.isArray(filterValue)) {
                    const { start, end } = filterValue;
                    if (!start && !end) return;

                    const cellValue = row[key];
                    if (!cellValue) {
                        rowMatches = false;
                        return;
                    }

                    let rowDate;
                    if (String(cellValue).includes("-")) {
                        rowDate = new Date(cellValue);
                    } else if (String(cellValue).includes("/")) {
                        const [d, m, y] = String(cellValue).split("/");
                        rowDate = new Date(`${y}-${m}-${d}`);
                    } else {
                        rowDate = new Date(cellValue);
                    }

                    if (isNaN(rowDate.getTime())) {
                        rowMatches = false;
                        return;
                    }

                    rowDate.setHours(0, 0, 0, 0);

                    if (start && end) {
                        const startDate = new Date(start);
                        const endDate = new Date(end);
                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(0, 0, 0, 0);
                        if (!(rowDate >= startDate && rowDate <= endDate)) rowMatches = false;
                    } else if (start) {
                        const startDate = new Date(start);
                        startDate.setHours(0, 0, 0, 0);
                        if (!(rowDate >= startDate)) rowMatches = false;
                    } else if (end) {
                        const endDate = new Date(end);
                        endDate.setHours(0, 0, 0, 0);
                        if (!(rowDate <= endDate)) rowMatches = false;
                    }
                    return;
                }

                // Multi-select (array)
                if (Array.isArray(filterValue)) {
                    if (filterValue.length === 0) return;
                    const cellValue = String(row[key] ?? "").trim().toLowerCase();
                    const matches = filterValue.some((fv) => {
                        const fvLower = String(fv ?? "").trim().toLowerCase();
                        return cellValue === fvLower || cellValue.startsWith(fvLower + " ");
                    });
                    if (!matches) rowMatches = false;
                } else {
                    // String or number
                    const filterStr = String(filterValue).toLowerCase();
                    if (!filterStr) return;
                    const cellValue = String(row[key] || "").toLowerCase();
                    if (!cellValue.includes(filterStr)) rowMatches = false;
                }
            });

            if (rowMatches) matchingCount++;
        });

        return matchingCount;
    };

    const formatFilterName = (name) => {
        return (name || "")
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // remove special chars
            .replace(/\s+/g, "-");
    };
    return (
        <div className="">
            <div className='custom_alert_first_row py-3 px-4 bg-white rounded mb-4'>
                <div className="col-md-12">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h2 className="mb-3 text-dark"> <strong> Welcome back, {status.user_name}!</strong></h2>
                            <p>Here's your comprehensive projects & performance overview.</p>
                        </div>
                        <div className="staff__analytics border-bottom pb-2 d-flex align-items-center gap-2">
                            {status?.department?.length > 1 ? (
                                <ul className="nav nav-pills g-1" style={{ fontSize: "0.875rem", columnGap: "8px" }}>
                                    {status.department.map(dept => (
                                        <li className="nav-item" key={dept}>
                                            <button
                                                className={`btn fw-bold fs-6 btn-sm btn-outline-primary ${selectedDepartment === dept ? 'active' : ''} `}
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
                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`} className="btn btn-primary btn-sm mt-2">View All Analytics</Link>
                            )}
                            {status?.status === 'admin' && (
                                <div className="dropdown">
                                    <button
                                        className="btn btn-secondary text-dark d-inline-flex align-items-center p-2"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        <GiHamburgerMenu size={20} />
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="custom_alert row">
                {/* Total Projects Card */}
                {status?.status === 'staff' && (

                    <div className="col-md-3">
                        <div className="card border-primary">
                            <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-projects`} className="text-dark text-decoration-none">
                                <div className="card-body">
                                    <FaTasks />


                                    <h6 className="card-title text-transform-uppercase text-muted mb-2">Total Tasks</h6>
                                    <h2 className="mb-0 text-primary">{totalProjects}</h2>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
                {/* ACTIVE Card - click to go to Development with active filter applied */}
                {status?.status === 'staff' && (
                    <div className="col-md-3">
                        <div className="card border-danger">
                            <Link
                                to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-active-projects`}
                                className="text-dark text-decoration-none"
                            >
                                <div className="card-body ">
                                    <IoPlayCircleOutline />

                                    <h6 className="card-title text-transform-uppercase text-muted mb-2">
                                        ACTIVE Projects
                                    </h6>
                                    <h2 className="mb-0 text-danger">
                                        {activeProjectsCount}
                                    </h2>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
                {status?.status === 'staff' && (
                    <>
                        <div className="col-md-3">
                            <div className="card border-success">
                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-on-track-projects`} className="text-dark text-decoration-none">

                                    <div className="card-body ">
                                        <FaRegCheckCircle />

                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">ON TRACK</h6>
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

                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">OFF TRACK</h6>
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

                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">NOT STARTED</h6>
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

                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">Follow up</h6>
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

                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">Forwarded to client</h6>
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

                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">Completed</h6>
                                        <h2 className="mb-0 text-danger">{projectsByStatus.completed}</h2>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
                {status?.status === 'admin' && (
                    <>
                        <div className="col-md-3">
                            <div className="card">
                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`} className="text-dark text-decoration-none">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div className='d-flex align-items-center gap-3'>
                                            <GrProjects />
                                            <h6 className="card-title fw-bold mb-0">Total Tasks</h6>
                                        </div>
                                        <h2 className="mb-0 text-primary">{totalProjects || 0}</h2>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card">
                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`} className="text-dark text-decoration-none">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div className='d-flex align-items-center gap-3'>
                                            <FaTasks />
                                            <h6 className="card-title mb-0 fw-bold">Total Projects</h6>
                                        </div>
                                        <h2 className="mb-0 text-primary">{totalTasks || 0}</h2>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {savedFilters.length > 0 &&
                            savedFilters
                                .filter(f => f.showInDepartment && f.department === selectedDepartment?.toLowerCase())
                                .map((filter) => {
                                    const IconComponent = filter.filterName.toLowerCase().includes("confirmation pending") ? FaExclamationTriangle : getIconFromFilterName(filter.filterName);
                                    return (
                                        <div key={filter._id} className="col-md-3">
                                            <div className="card">
                                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${formatFilterName(filter.filterName)}`} className="text-dark text-decoration-none">

                                                    <div className="card-body d-flex justify-content-between align-items-center">
                                                        <div className='d-flex align-items-center gap-3'>
                                                            <div className="icon-wrapper">
                                                                <IconComponent size={28} />
                                                            </div>
                                                            <h6 className="card-title mb-0 fw-bold">{filter.filterName}</h6>

                                                        </div>
                                                        <h2 className="mb-0 text-primary">{countMatchingRows(filter.filterData)}</h2>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                    </>
                )}
            </div>
        </div>
    )
}
export default DepartmentFilters