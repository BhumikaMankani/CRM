import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle
} from 'react';
import { FaTrash, FaFilter } from 'react-icons/fa';
import { API_URL } from '../../proxy';
import './FilterSidebar.css';

const FilterSidebar = forwardRef(
    (
        {
            onFilterSelect,
            status,
            isFilterOpen,
            currentFilters,
            userId,
            refreshTrigger,
            clearFilters,
            handleDeleteFilter,
            filters,
            setIsSaveFilterModalOpen
        },
        ref
    ) => {
        const [savedFilters, setSavedFilters] = useState([]);
        const [isOpen, setIsOpen] = useState(true);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [deleteConfirm, setDeleteConfirm] = useState({
            isOpen: false,
            filterId: null,
            filterName: ''
        });

        useEffect(() => {
            if (userId) {
                fetchSavedFilters();
            }
        }, [refreshTrigger, userId]);

        const fetchSavedFilters = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(
                    `${API_URL}/api/filters?userId=${userId}`
                );
                if (!response.ok) throw new Error('Failed to fetch filters');

                const data = await response.json();
                setSavedFilters(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load saved filters');
            } finally {
                setLoading(false);
            }
        };

        const addNewFilterToList = (newFilter) => {
            setSavedFilters((prev) => [newFilter, ...prev]);
        };

        const removeFilterFromList = (filterId) => {
            setSavedFilters((prev) =>
                prev.filter((f) => f._id !== filterId)
            );
        };

        useImperativeHandle(ref, () => ({
            addNewFilterToList,
            removeFilterFromList
        }));

        const hasActiveFilters = Object.values(filters).some((v) => {
            if (Array.isArray(v)) return v.length > 0;
            if (typeof v === 'object' && v !== null)
                return Object.values(v).some(Boolean);
            return !!v;
        });

        return (
            <>
                {/* Sidebar */}
                <div
                    className={`filter-sidebar ${isOpen ? 'open' : 'closed'
                        } col-md-2 col-sm-4 pt-3 pb-3`}
                >
                    {/* Header */}
                    <div
                        className={`sidebar-header ${status.status === 'staff'
                                ? 'd-flex align-items-center justify-content-between mb-2'
                                : ''
                            }`}
                    >
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <h5 className="m-0">
                                <FaFilter className="me-2" />
                                Filters
                            </h5>

                            {!isFilterOpen && hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="btn btn-outline-secondary btn-sm"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {isFilterOpen && hasActiveFilters && (
                            <div
                                className={`d-flex gap-2 ${status.status === 'staff' ? '' : 'mt-2'
                                    }`}
                            >
                                {status.status === 'admin' && (
                                    <button
                                        onClick={() =>
                                            setIsSaveFilterModalOpen(true)
                                        }
                                        className="btn btn-success btn-sm"
                                    >
                                        Save as
                                    </button>
                                )}

                                <button
                                    onClick={clearFilters}
                                    className="btn btn-outline-secondary btn-sm"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="sidebar-content">
                        {error && (
                            <div className="alert alert-danger small">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <p className="small">
                                    Loading filters...
                                </p>
                            </div>
                        ) : savedFilters.length > 0 ? (
                            <div className="filters-list">
                                {savedFilters.map((filter) => (
                                    <div
                                        key={filter._id}
                                        className={`filter-item ${JSON.stringify(currentFilters) ===
                                                JSON.stringify(filter.filterData)
                                                ? 'active'
                                                : ''
                                            }`}
                                        onClick={() =>
                                            onFilterSelect(filter.filterData)
                                        }
                                    >
                                        <div className="filter-item-content">
                                            <div className="filter-name">
                                                {filter.filterName}
                                            </div>
                                        </div>

                                        {status.status === 'admin' && (
                                            <button
                                                className="delete-filter-btn"
                                                title="Delete filter"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm({
                                                        isOpen: true,
                                                        filterId: filter._id,
                                                        filterName: filter.filterName
                                                    });
                                                }}
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
                                    No saved filters yet. Apply filters
                                    and click “Save as”.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm.isOpen && (
                    <div className="delete-confirmation-overlay">
                        <div className="delete-confirmation-modal">
                            <h4>Delete Filter</h4>
                            <p>
                                Are you sure you want to delete "
                                <strong>
                                    {deleteConfirm.filterName}
                                </strong>
                                "?
                            </p>

                            <div className="d-flex justify-content-center gap-2 mt-3">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        handleDeleteFilter(
                                            deleteConfirm.filterId
                                        );
                                        setDeleteConfirm({
                                            isOpen: false,
                                            filterId: null,
                                            filterName: ''
                                        });
                                    }}
                                >
                                    Yes
                                </button>

                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setDeleteConfirm({
                                            isOpen: false,
                                            filterId: null,
                                            filterName: ''
                                        })
                                    }
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
);

FilterSidebar.displayName = 'FilterSidebar';
export default FilterSidebar;
