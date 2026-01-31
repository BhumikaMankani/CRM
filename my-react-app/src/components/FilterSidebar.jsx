import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaTrash, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { API_URL } from '../../proxy';
import './FilterSidebar.css';

const FilterSidebar = forwardRef(({ onFilterSelect, handleColumnEditClick, isDelete, status, isFilterOpen, currentFilters, userId, refreshTrigger, setActiveSuggestionField, clearFilters, handleFilterChange, handleFilterClick, handleDeleteFilter, filters, setIsSaveFilterModalOpen }, ref) => {
    const [savedFilters, setSavedFilters] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userId) {
            fetchSavedFilters();
        }
    }, [refreshTrigger, userId]);

    const fetchSavedFilters = async () => {

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/filters?userId=${userId}`, {
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
            {/* Sidebar */}
            <div className={`filter-sidebar ${isOpen ? 'open' : 'closed'} col-md-2 col-sm-4 pt-3 pb-3`}>
                <div className={`sidebar-header ${status.status === 'staff' ? 'd-flex align-items-center justify-content-between mb-2' : ''}`}>
                    <div className={`d-flex align-items-center justify-content-between mb-2 ${status.status === 'staff' ? 'w-100' : ''}`}>
                        <h5 className="m-0">
                            <FaFilter className="me-2" />
                            Filters
                        </h5>

                        {!isFilterOpen &&
                            Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
                                <button
                                    onClick={clearFilters}
                                    className="btn btn-outline-secondary btn-sm w-max-content"
                                    title="Clear All Filters"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Clear All</span>
                                </button>
                            )
                        }
                    </div>

                    {isFilterOpen &&
                        Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
                            <div className={`gap-2 d-flex ${status.status === 'staff' ? '' : 'mt-2 mb-2'}`}>
                                {status.status === 'admin' &&
                                    <button
                                        onClick={() => setIsSaveFilterModalOpen(true)}
                                        className="btn btn-success btn-sm"
                                        title="Save Current Filters"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Save as</span>
                                    </button>
                                }

                                <button
                                    onClick={clearFilters}
                                    className="btn btn-outline-secondary btn-sm w-max-content"
                                    title="Clear All Filters"
                                    style={{ width: 'max-content', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                                            onClick={(e) => handleDeleteFilter(filter._id, e)}
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
            </div >
        </>
    );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
