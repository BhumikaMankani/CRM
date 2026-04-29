import { useCallback, useEffect } from 'react';
import { MdOutlineIncompleteCircle, MdOutlinePhoneForwarded } from 'react-icons/md';
import { IoPlayCircleOutline } from 'react-icons/io5';
import { FaRegCheckCircle } from 'react-icons/fa';
import { RxCrossCircled } from 'react-icons/rx';
import { CgDanger } from 'react-icons/cg';
import { RiChatFollowUpFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { FaTasks } from "react-icons/fa";
import { API_URL } from "../../proxy";
import { FaRegUser } from "react-icons/fa";
import { GiRadioactive } from "react-icons/gi";
import { GrProjects } from "react-icons/gr";

import {
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaProjectDiagram
} from "react-icons/fa";


import { useState } from 'react';

function DepartmentFilters({ result, selectedDepartment, projects, status, totalProjects, activeProjectsCount, countsLoading = false, projectsByStatus }) {
    const [savedFilters, setSavedFilters] = useState([]);

    const savedFiltersCacheKey = status?._id ? `savedFilters_${status._id}_${selectedDepartment?.toLowerCase() || 'all'}` : null;

    const getCachedValue = (key, fallback = null) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
            console.warn("Failed to read cache:", key, err);
            return fallback;
        }
    };

    const setCachedValue = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn("Failed to save cache:", key, err);
        }
    };
    useEffect(() => {
        if (!savedFiltersCacheKey) return;
        const cachedFilters = getCachedValue(savedFiltersCacheKey, null);
        if (cachedFilters) {
            setSavedFilters(cachedFilters);
        }
    }, [savedFiltersCacheKey]);
    const fetchSavedFilters = useCallback(async () => {
        if (!status?._id) return;
        try {
            const url = `${API_URL}/api/filters?userId=${status._id}${selectedDepartment ? `&department=${selectedDepartment?.toLowerCase() || 'all'}` : ""}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch filters');
            const data = await response.json();
            setSavedFilters(data);
            if (savedFiltersCacheKey) {
                setCachedValue(savedFiltersCacheKey, data);
            }
        } catch (err) {
            console.error('Failed to load saved filters:', err);
        }
    }, [status?._id, selectedDepartment, savedFiltersCacheKey]);
    useEffect(() => {
        fetchSavedFilters();
    }, [fetchSavedFilters, selectedDepartment]);
    const renderCountValue = (value, fallback = 0, showLoader = true) => {
        if (showLoader && countsLoading) {
            return (
                <span className="d-flex align-items-center gap-2">
                    <span className="count-loader" />
                </span>
            );
        }

        return <span>{value != null ? value : fallback}</span>;
    };
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
        const matchKey = Object.keys(iconMap).find(key =>
            lower.includes(key)
        );

        return matchKey ? iconMap[matchKey] : FaTasks; // fallback icon
    };

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

    const projectOverviewFilters = savedFilters.filter(f =>
        f.showInDepartment &&
        f.department === selectedDepartment?.toLowerCase() &&
        (f.filterName.toLowerCase().includes("all active projects") || f.filterName.toLowerCase().includes("completed"))
    );

    const teamPerformanceFilters = savedFilters.filter(f =>
        f.showInDepartment &&
        f.department === selectedDepartment?.toLowerCase() &&
        !projectOverviewFilters.find(p => p._id === f._id)
    );

    const StatCard = ({ icon: Icon, title, value, colorClass, link, accentClass, trend }) => (
        <div className="col-md-3">
            <Link to={link} className="text-decoration-none">
                <div className={`custom-card ${colorClass}`}>
                    <div className={`icon-box ${colorClass}`}>
                        <Icon size={20} />
                    </div>
                    <h6 className="card-title-mini">{title}</h6>
                    <h2 className={`card-value-large text-${colorClass} ff-outfit`}>
                        {renderCountValue(value, 0, false)}
                    </h2>
                    {/* <div className={`card-accent-border ${accentClass}`}></div> */}
                </div>
            </Link>
        </div>
    );

    const cards = [
        {
            title: "Active Projects",
            key: "active",
            count: activeProjectsCount,
            icon: <IoPlayCircleOutline />,
            colorClass: "purple",
            accentClass: "accent-purple",
            filter: "active-projects",
        },
        {
            title: "On Track",
            key: "onTrack",
            count: projectsByStatus.onTrack,
            icon: <FaRegCheckCircle />,
            colorClass: "green",
            accentClass: "accent-green",
            filter: "on-track-projects",
        },
        {
            title: "Off Track",
            key: "offTrack",
            count: projectsByStatus.offTrack,
            icon: <RxCrossCircled />,
            colorClass: "red",
            accentClass: "accent-red",
            filter: "off-track-projects",
        },
        {
            title: "Not Started",
            key: "notStarted",
            count: projectsByStatus.notStarted,
            icon: <CgDanger />,
            colorClass: "blue",
            accentClass: "accent-blue",
            filter: "not-started-projects",
        },
        {
            title: "Follow Up",
            key: "followUp",
            count: projectsByStatus.followUp,
            icon: <RiChatFollowUpFill />,
            colorClass: "yellow",
            accentClass: "accent-yellow",
            filter: "follow-up",
        },
        {
            title: "Forwarded",
            key: "forwarded",
            count: projectsByStatus.forwardedToClient,
            icon: <MdOutlinePhoneForwarded />,
            colorClass: "cyan",
            accentClass: "accent-cyan",
            filter: "forwarded-projects",
        },
        {
            title: "Completed",
            key: "completed",
            count: projectsByStatus.completed,
            icon: <MdOutlineIncompleteCircle />,
            colorClass: "cv-green",
            accentClass: "accent-cv-green",
            filter: "completed-projects",
        },
    ];

    return (
        <div className="">
            <div className='custom_alert_first_row bg-white py-4 px-4 rounded mb-4'>
                <div className="col-md-12">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h2 className="fw-bold mb-1 fs-4 text-dark ff-outfit"> <strong> Welcome back, {status.user_name}!</strong>👋</h2>
                            <p className='text-dark mb-0 mt-1' style={{ fontSize: "14px", fontWeight: "400" }}>
                                "Here's your comprehensive projects & performance overview."
                            </p>
                        </div>
                        {/* <div className="d-flex align-items-center gap-2">
                            {confirmationPendingCount > 0 && (
                                <Link
                                    to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=confirmation-pending---projects`}
                                    className="text-decoration-none"
                                >
                                    <div className="pending-badge">
                                        <div className="badge-text">
                                            <span className='alert-pill'></span>
                                            <span className='count'>{confirmationPendingCount} Pending Confirmations</span>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div> */}
                    </div>
                </div>
            </div>
            <div className={`custom_alert ${status?.status === 'staff' ? 'row' : ''}`}>
                {status?.status === 'staff' && (
                    <>
                        <div className="col-md-3">
                            <Link
                                to={`/department/${selectedDepartment?.toLowerCase()}${selectedDepartment == 'development' ? "?filter_name=" + status?.user_name?.toLowerCase() + "-projects" : ""}`}
                                className="text-decoration-none"
                            >
                                <div className="custom-card orange">
                                    <div className="icon-box orange">
                                        <FaTasks size={20} />
                                    </div>

                                    <h6 className="card-title-mini">Total Tasks</h6>

                                    <h2 className="card-value-large text-orange ff-outfit">
                                        {renderCountValue(totalProjects)}
                                    </h2>

                                    {/* <div className="card-accent-border accent-orange"></div> */}
                                </div>
                            </Link>
                        </div>
                        {cards.map((card, index) => (
                            <div className="col-md-3" key={index}>
                                <Link
                                    to={`/department/${(selectedDepartment || status?.department?.[0] || "").toLowerCase()
                                        }?filter_name=${status.user_name.toLowerCase()}-${card.filter}`}
                                    className="text-decoration-none"
                                >
                                    <div className={`custom-card ${card.colorClass}`}>
                                        <div className={`icon-box ${card.colorClass}`}>{card.icon}</div>

                                        <h6 className="card-title-mini">{card.title}</h6>

                                        <h2 className={`card-value-large ff-outfit ${"text-" + card.colorClass}`}>
                                            {renderCountValue(card.count)}
                                        </h2>

                                        {/* <div className={`card-accent-border ${card.accentClass}`}></div> */}
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </>
                )}
                {status?.status === 'admin' && (
                    <>
                        <h3 className="section-heading">Project Overview</h3>
                        <div className="row">
                            <StatCard
                                icon={GrProjects}
                                title="Total Tasks"
                                value={totalProjects}
                                colorClass="orange"
                                accentClass="accent-orange"
                                link={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`}
                            />
                            <StatCard
                                icon={FaTasks}
                                title="Total Projects"
                                value={result}
                                colorClass="sv-blue"
                                accentClass="accent-sv-blue"
                                link={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`}
                            />

                            {projectOverviewFilters.map((filter) => {
                                const IconComponent = filter.filterName.toLowerCase().includes("completed") ? FaCheckCircle : (filter.filterName.toLowerCase().includes("active") ? GiRadioactive : getIconFromFilterName(filter.filterName));
                                console.log("filter.filterName.toLowerCase()", filter.filterName.toLowerCase());
                                const name = filter.filterName.toLowerCase();
                                const colorClass =
                                    name.includes("aditya")
                                        ? "sc-teal"
                                        : name.includes("nikhil")
                                            ? "purple"
                                            : name.includes("completed")
                                                ? "cv-green"
                                                : (name.includes("active") || name.includes("confirmation"))
                                                    ? "red"
                                                    : "orange"; const accentClass = `accent-${colorClass}`;

                                return (
                                    <StatCard
                                        key={filter._id}
                                        icon={IconComponent}
                                        title={filter.filterName}
                                        value={countMatchingRows(filter.filterData)}
                                        colorClass={colorClass}
                                        accentClass={accentClass}
                                        link={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${formatFilterName(filter.filterName)}`}
                                    />
                                );
                            })}
                        </div>

                        {teamPerformanceFilters.length > 0 && (
                            <>
                                <h3 className="section-heading">Team Performance</h3>
                                <div className="row">
                                    {teamPerformanceFilters.map((filter) => {
                                        const isConfirmation = filter.filterName.toLowerCase().includes("confirmation");
                                        const IconComponent = isConfirmation ? FaExclamationTriangle : getIconFromFilterName(filter.filterName);

                                        // Pick a color based on some logic or mapping
                                        let colorClass = "blue";
                                        if (isConfirmation) colorClass = "red";
                                        else if (filter.filterName.toLowerCase().includes("nikhil")) colorClass = "yellow";
                                        else if (filter.filterName.toLowerCase().includes("aditya")) colorClass = "cyan";
                                        console.log("filter.filterName.toLowerCase", filter.filterName.toLowerCase);
                                        const accentClass = `accent-${colorClass}`;

                                        return (
                                            <StatCard
                                                key={filter._id}
                                                icon={IconComponent}
                                                title={filter.filterName}
                                                value={countMatchingRows(filter.filterData)}
                                                colorClass={colorClass}
                                                accentClass={accentClass}
                                                link={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${formatFilterName(filter.filterName)}`}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
export default DepartmentFilters;