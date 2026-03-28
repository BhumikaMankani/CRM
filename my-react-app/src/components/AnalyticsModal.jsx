import React, { useMemo } from 'react';
import { LiaFilterSolid } from "react-icons/lia";
import './AnalyticsModal.css';
import { LiaEditSolid, LiaTrashRestoreAltSolid } from "react-icons/lia";
import { IoCloseSharp } from 'react-icons/io5';


const AnalyticsModal = ({ isOpen, onClose, filters, onApplyFilter, onEdit, onDelete, userStatus }) => {
    const analyticsFilters = useMemo(() => {
        return filters.filter(f => f.showInAnalytics);
    }, [filters]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <div className="analytics-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="analytics-header">
                    <h4 className="d-flex align-items-center gap-2">
                        <LiaFilterSolid className="text-brand-orange" /> Analytics Filters
                    </h4>
                    <button className="close-btn" onClick={onClose}>
                        <IoCloseSharp />
                    </button>
                </div>

                <div className="analytics-body">
                    {analyticsFilters.length > 0 ? (
                        <div className="d-flex flex-column">
                            {analyticsFilters.map(filter => (
                                <div key={filter._id} className="analytics-filter-card">
                                    <button
                                        className="filter-btn-main"
                                        onClick={() => {
                                            onApplyFilter(filter);
                                            onClose();
                                        }}
                                    >
                                        <div className="filter-name-text text-truncate">{filter.filterName}</div>
                                        {/* <div className="filter-meta">
                                            {Object.keys(filter.filterData || {}).length} rules applied
                                        </div> */}
                                    </button>

                                    {userStatus?.status === 'admin' && (
                                        <div className="analytics-actions">
                                            <button
                                                className="action-btn-mini"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(filter);
                                                    onClose();
                                                }}
                                                title="Edit"
                                            >
                                                <LiaEditSolid />
                                            </button>
                                            <button
                                                className="action-btn-mini delete text-danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(filter._id, filter.filterName, e);
                                                }}
                                                title="Delete"
                                            >
                                                <LiaTrashRestoreAltSolid />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <LiaFilterSolid size={48} className="mb-3 opacity-25" />
                            <p className="mb-0">No analytics filters found.</p>
                            <small>Mark a filter as "Show in Analytics" when saving to see it here.</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsModal;
