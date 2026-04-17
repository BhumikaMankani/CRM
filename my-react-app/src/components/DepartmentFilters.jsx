import React from 'react';
import { MdDashboard, MdOutlineIncompleteCircle, MdOutlinePhoneForwarded } from 'react-icons/md';
import { IoPlayCircleOutline } from 'react-icons/io5';
import { FaRegCheckCircle } from 'react-icons/fa';
import { RxCrossCircled } from 'react-icons/rx';
import { CgDanger } from 'react-icons/cg';
import { RiChatFollowUpFill } from 'react-icons/ri';
import { MdOutlinePendingActions } from "react-icons/md";
import { Link } from 'react-router-dom';
import { FaTasks } from "react-icons/fa";

import { VscFolderActive } from "react-icons/vsc";

import { LiaBarsSolid } from "react-icons/lia";
import { useState } from 'react';

function DepartmentFilters({ selectedDepartment, setSelectedArchivedDepartments, isArchiveModalOpen, setIsArchiveModalOpen, isModalOpen, setIsModalOpen, isDepartment, isEditUserModalOpen, setIsEditUserModalOpen, selectedDepartmentDown, isDepartmentModalOpen, setIsDepartmentModalOpen, addUser, departments, status, totalProjects, totalTasks, activeProjectsCount, activeTasksByUser = {}, confirmationPendingCount, projectsByStatus, setSelectedDepartment }) {
    const adityaActive = activeTasksByUser?.Aditya || 0;
    const nikhilActive = activeTasksByUser?.Nikhil || 0;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    return (
        <div className="">
            <div className='custom_alert_first_row py-3 px-4 bg-white rounded mb-4'>
                <div className="col-md-12">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h2 className="mb-3"> <strong> Welcome back, {status.user_name}!</strong></h2>
                            <p>Here's what happening with your project's today</p>
                        </div>
                        <div className="staff__analytics d-flex align-items-center gap-2">
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
                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`} className="btn btn-primary btn-sm mt-2">View All Analytics</Link>
                            )}
                            {status?.status === 'admin' && (
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="custom_alert row">
                {/* Total Projects Card */}
                <div className="col-md-3">
                    <div className="card border-primary">
                        {status?.status === 'staff' ? (
                            <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=${status.user_name.toLowerCase()}-projects`} className="text-dark text-decoration-none">
                                <div className="card-body">
                                    <FaTasks />


                                    <h6 className="card-title text-transform-uppercase text-muted mb-2">Total Tasks</h6>
                                    <h2 className="mb-0 text-primary">{totalProjects}</h2>
                                </div>
                            </Link>
                        ) : (
                            <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`} className="text-dark text-decoration-none">
                                <div className="card-body">
                                    <MdDashboard />


                                    <h6 className="card-title text-transform-uppercase text-muted mb-2">Total Tasks</h6>
                                    <h2 className="mb-0 text-primary">{totalProjects}</h2>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>

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
                            <div className="card border-secondary">
                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}`} className="text-dark text-decoration-none">
                                    <div className="card-body">
                                        <FaTasks />
                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">Total Projects</h6>
                                        <h2 className="mb-0 text-secondary">{totalTasks || 0}</h2>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-danger">
                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=all-active-projects`} className="text-dark text-decoration-none">
                                    <div className="card-body">
                                        <VscFolderActive />
                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">All Active Tasks</h6>
                                        <h2 className="mb-0 text-danger">{activeProjectsCount || 0}</h2>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-success">
                                <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=all-completed-projects`} className="text-dark text-decoration-none">
                                    <div className="card-body">
                                        <FaRegCheckCircle />
                                        <h6 className="card-title text-transform-uppercase text-muted mb-2">Completed Projects</h6>
                                        <h2 className="mb-0 text-success">{projectsByStatus.completed || 0}</h2>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        {selectedDepartment == 'Development' && (
                            <div className="col-md-3">
                                <div className="card border-success">
                                    <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=aditya-active-projects`} className="text-dark text-decoration-none">
                                        <div className="card-body">
                                            <FaRegCheckCircle />
                                            <h6 selectedDepartment={selectedDepartment} className="card-title text-transform-uppercase text-muted mb-2">Aditya Active Tasks</h6>
                                            <h2 className="mb-0 text-success">{adityaActive}</h2>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}
                        {selectedDepartment == 'Development' && (
                            <div className="col-md-3">
                                <div className="card border-warning">
                                    <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=nikhil-active-projects`} className="text-dark text-decoration-none">
                                        <div className="card-body">
                                            <FaRegCheckCircle />
                                            <h6 className="card-title text-transform-uppercase text-muted mb-2">Nikhil Active Tasks</h6>
                                            <h2 className="mb-0 text-warning">{nikhilActive}</h2>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}
                        {selectedDepartment == 'Development' && (
                            <div className="col-md-3">
                                <div className="card border-info">
                                    <Link to={`/department/${(selectedDepartment?.toLowerCase() || status?.department?.[0] || '').toLowerCase()}?filter_name=confirmation-pending-tasks`} className="text-dark text-decoration-none">
                                        <div className="card-body">
                                            <MdOutlinePendingActions />
                                            <h6 className="card-title text-transform-uppercase text-muted mb-2">Confirmation Pending - Tasks</h6>
                                            <h2 className="mb-0 text-info">{confirmationPendingCount || 0}</h2>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
export default DepartmentFilters