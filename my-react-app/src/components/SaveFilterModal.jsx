import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers } from 'react-icons/fa';
import { API_URL } from '../../proxy';
import './SaveFilterModal.css';

const SaveFilterModal = ({ isOpen, onClose, onSave, filters, userStatus, editFilter }) => {
    const [filterName, setFilterName] = useState('');
    const [error, setError] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    useEffect(() => {
        if (isOpen && userStatus?.status === 'admin') {
            fetchStaff();
        }

        if (isOpen && editFilter) {
            setFilterName(editFilter.filterName || '');
            setSelectedStaff(editFilter.allowedUsers || []);
        } else if (isOpen) {
            setFilterName('');
            setSelectedStaff([]);
        }
    }, [isOpen, userStatus, editFilter]);

    const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
            const response = await fetch(`${API_URL}/api/user`);
            if (response.ok) {
                const data = await response.json();
                // Only show staff members, and exclude current admin if desired
                // But usually, admin might want to share with other admins too?
                // Let's show all staff except current user.
                const filtered = data.filter(u => u._id !== userStatus?._id);
                setStaffList(filtered);
            }
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleStaffToggle = (staffId) => {
        setSelectedStaff(prev =>
            prev.includes(staffId)
                ? prev.filter(id => id !== staffId)
                : [...prev, staffId]
        );
    };

    const handleSave = async () => {
        if (!filterName.trim()) {
            setError('Please enter a filter name');
            return;
        }

        if (Object.keys(filters).length === 0) {
            setError('No filters applied to save');
            return;
        }

        try {
            setError(''); // Clear error before saving
            await onSave(filterName, editFilter ? editFilter.filterData : filters, selectedStaff, editFilter?._id);
            setFilterName('');
            setSelectedStaff([]);
            setError('');
        } catch (err) {
            const errorMsg = err.message || 'Failed to save filter';
            setError(errorMsg);
            console.error('Error saving filter:', err);
        }
    };

    const handleClose = () => {
        setFilterName('');
        setSelectedStaff([]);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    const isAdmin = userStatus?.status === 'admin';

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="save-filter-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>{editFilter ? 'Edit Filter' : 'Save & Share Filter'}</h4>
                    <button className="close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="mb-4">
                        <label htmlFor="filterName" className="form-label fw-bold">
                            Filter Name
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="filterName"
                            value={filterName}
                            onChange={(e) => {
                                setFilterName(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., High Priority Tasks"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSave();
                                }
                            }}
                        />
                        {error && <div className="text-danger mt-2 small">{error}</div>}
                    </div>

                    {isAdmin && (
                        <div className="sharing-section mb-3">
                            <label className="form-label fw-bold d-flex align-items-center gap-2">
                                <FaUsers /> Share with Staff
                            </label>
                            <div className="staff-selection-box border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {loadingStaff ? (
                                    <p className="text-muted small mb-0">Loading staff members...</p>
                                ) : staffList.length > 0 ? (
                                    <div className="row g-2">
                                        {staffList.map(staff => (
                                            <div key={staff._id} className="col-12">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={`staff-${staff._id}`}
                                                        checked={selectedStaff.includes(staff._id)}
                                                        onChange={() => handleStaffToggle(staff._id)}
                                                    />
                                                    <label className="form-check-label small" htmlFor={`staff-${staff._id}`}>
                                                        {staff.user_name} ({staff.email})
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted small mb-0">No other staff members found.</p>
                                )}
                            </div>
                            <p className="text-muted smallest mt-2" style={{ fontSize: '0.75rem' }}>
                                Selected staff will be able to see and use this filter.
                            </p>
                        </div>
                    )}

                    <div className="filter-preview visually-hidden">
                        <h6 className="mb-2">Applied Filters:</h6>
                        <div className="filters-list">
                            {Object.entries(filters).map(([key, value]) => (
                                <div key={key} className="filter-tag">
                                    <strong>{key}:</strong>{' '}
                                    {(() => {
                                        if (Array.isArray(value)) return value.join(', ');
                                        if (typeof value === 'object' && value !== null) {
                                            const parts = [];
                                            if (value.start) parts.push(`From: ${value.start}`);
                                            if (value.end) parts.push(`To: ${value.end}`);
                                            return parts.join(' ');
                                        }
                                        return value;
                                    })()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary px-4"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary px-4"
                        onClick={handleSave}
                    >
                        {editFilter ? 'Update & Share' : 'Save & Share'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveFilterModal;
