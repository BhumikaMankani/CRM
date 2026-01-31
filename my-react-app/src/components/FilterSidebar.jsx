import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaTrash, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { API_URL } from '../../proxy';
import './FilterSidebar.css';

const FilterSidebar = forwardRef(({ onFilterSelect, handleColumnEditClick, isDelete, status, isFilterOpen, currentFilters, userId, refreshTrigger, setActiveSuggestionField, clearFilters, handleFilterChange, handleFilterClick, handleDeleteFilter, filters, setIsSaveFilterModalOpen }, ref) => {
    const [savedFilters, setSavedFilters] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, filterId: null, filterName: '' });


    useEffect(() => {
        fetchSavedFilters();
    }, [refreshTrigger]);

    const fetchSavedFilters = async () => {

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/filters`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch filters');

            const data = await response.json();
            setSavedFilters(data);
        } catch (err) {
            console.error('Error fetching filters:', err);
            setError('Failed to load saved filters');
        } finally {
            setLoading(false);
        }
    };

    // Add new filter to the list immediately
    const addNewFilterToList = (newFilter) => {
        setSavedFilters(prev => [newFilter, ...prev]);
    };

    // Remove deleted filter from the list
    const removeFilterFromList = (filterId) => {
        setSavedFilters(prev => prev.filter(filter => filter._id !== filterId));
    };

    // Expose the addNewFilterToList and removeFilterFromList functions via ref
    useImperativeHandle(ref, () => ({
        addNewFilterToList,
        removeFilterFromList
    }), []);

    return (
        <>
            {/* Toggle Button */}
            {/* <button
                className="sidebar-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button> */}

            {/* Sidebar */}
            <div className={`filter-sidebar ${isOpen ? 'open' : 'closed'} col-md-2 col-sm-4 pt-3 pb-3`}>
                <div className={`sidebar-header ${status.status !== 'admin' ? 'd-flex justify-content-between align-items-center' : ''}`}>
                    <div className='d-flex align-items-center justify-content-between'>
                        <h5>
                            <FaFilter className="me-2" />
                            Filters
                        </h5>
                    </div>
                    {Object.values(filters).some(v => {
                        if (Array.isArray(v)) return v.length > 0;
                        if (typeof v === 'object' && v !== null) return Object.values(v).some(val => val);
                        return !!v;
                    }) && (
                            <div className={`d-flex gap-2 ${status.status === 'staff' ? '' : 'mt-2'}`}>
                                {status.status === 'admin' &&
                                    <button
                                        onClick={() => setIsSaveFilterModalOpen(true)}
                                        className="btn btn-success"
                                        title="Save Current Filters"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Save as</span>
                                    </button>
                                }

                                <button
                                    onClick={clearFilters}
                                    className="btn btn-outline-secondary"
                                    title="Clear All Filters"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Clear All</span>
                                </button>
                            </div>
                        )}
                </div>

                <div className="sidebar-content">
                    {error && (
                        <div className="alert alert-danger small" role="alert">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p className="small">Loading filters...</p>
                        </div>
                    ) : savedFilters.length > 0 ? (
                        <div className="filters-list">
                            {savedFilters.map(filter => (
                                <div
                                    key={filter._id}
                                    className={`filter-item ${JSON.stringify(currentFilters) === JSON.stringify(filter.filterData)
                                            ? 'active'
                                            : ''
                                        }`}
                                    onClick={() => onFilterSelect(filter.filterData)}
                                >
                                    <div className="filter-item-content">
                                        <div className="filter-name">{filter.filterName}
                                        </div>
                                        {/* <div className="filter-meta">
                                            {Object.keys(filter.filterData).length} filter(s)
                                        </div> */}
                                    </div>
                                    {status.status === 'admin' && (
                                        <button
                                            className="delete-filter-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm({ isOpen: true, filterId: filter._id, filterName: filter.filterName });
                                            }}
                                            title="Delete filter"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="small text-muted">
                                No saved filters yet. Apply filters and click "Save as" to save them.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {deleteConfirm.isOpen && (
                <div
                    className="delete-confirmation-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="delete-confirmation-modal"
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            textAlign: "center",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        }}
                    >
                        <h4>Delete Filter</h4>
                        <p>
                            Are you sure you want to delete this filter?
                            {deleteConfirm.filterName && (
                                <> "<strong>{deleteConfirm.filterName}</strong>"</>
                            )}
                        </p>
                        <div className="d-flex justify-content-center gap-2 mt-3">
                            <button
                                className="btn btn-danger me-2"
                                onClick={() => {
                                    handleDeleteFilter(deleteConfirm.filterId);
                                    setDeleteConfirm({ isOpen: false, filterId: null, filterName: '' });
                                }}
                            >
                                Yes
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirm({ isOpen: false, filterId: null, filterName: '' })}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
