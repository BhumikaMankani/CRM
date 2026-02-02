import React, {
    useState,
    forwardRef
} from 'react';
import { FaFilter } from 'react-icons/fa';
import './FilterSidebar.css';

const FilterSidebar = forwardRef(
    (
        {
            status,
            isFilterOpen,
            clearFilters,
            setIsSaveFilterModalOpen,
            filters
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = useState(true);

        const hasActiveFilters = Object.values(filters).some((v) => {
            if (Array.isArray(v)) return v.length > 0;
            if (typeof v === 'object' && v !== null)
                return Object.values(v).some(Boolean);
            return !!v;
        });

        return (
            <div className={`filter-sidebar ${isOpen ? 'open' : 'closed'} col-md-2 col-sm-4 pt-3 pb-3`}>
                <div className="sidebar-header">
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <h5 className="m-0">
                            <FaFilter className="me-2" />
                            Filters
                        </h5>
                    </div>

                    {isFilterOpen && hasActiveFilters && (
                        <div className="d-flex flex-column gap-2 mt-3">
                            {status.status === 'admin' && (
                                <button
                                    onClick={() => setIsSaveFilterModalOpen(true)}
                                    className="btn btn-success btn-sm w-100"
                                >
                                    Save as
                                </button>
                            )}

                            <button
                                onClick={clearFilters}
                                className="btn btn-outline-secondary btn-sm w-100"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

FilterSidebar.displayName = 'FilterSidebar';
export default FilterSidebar;
