import { useEffect, useState, useMemo, useCallback } from "react";
import Table from "./Table";
import AddEntryModal from "./AddEntryModal";
import Form from "./Form";
import { FaTrash, FaTimes } from "react-icons/fa";

function TableColumns() {

    // Column states
    const [columnsDef, setColumnsDef] = useState([]);

    // Data states (row)
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    // Column delete states
    const [isDelete, setIsDelete] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, accessor: '', label: '', isDynamic: false });

    // Sorting and filtering states
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [activeSuggestionField, setActiveSuggestionField] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Handle column delete
    const handleColumnEditClick = () => {
        setIsDelete(!isDelete);
    };

    // Handle filter
    const handleFilterClick = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
        setIsFilterOpen(false);
    }, []);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedData = useMemo(() => {
        let processedData = [...data];

        // Apply filters
        Object.keys(filters).forEach(key => {
            const filterValue = filters[key]?.toLowerCase();
            if (filterValue) {
                processedData = processedData.filter(row => {
                    const cellValue = String(row[key] || "").toLowerCase();
                    return cellValue.includes(filterValue);
                });
            }
        });

        // Apply sorting
        if (sortConfig.key) {
            processedData.sort((a, b) => {
                const aValue = a[sortConfig.key] || "";
                const bValue = b[sortConfig.key] || "";

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return processedData;
    }, [data, filters, sortConfig]);
    useEffect(() => {
        fetch("/api/columns")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch columns");
                return res.json();
            })
            .then(setColumnsDef)
            .catch(err => console.error("Error loading columns:", err));

        fetch("/api/development")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch development data");
                return res.json();
            })
            .then(setData)
            .catch(err => console.error("Error loading data:", err));
    }, []);

    /* ---------------- UPDATE CELL ---------------- */
    const handleChange = (rowIndex, field, value) => {
        const updated = [...data];
        updated[rowIndex][field] = value;
        setData(updated);

        fetch(`/api/development/${updated[rowIndex]._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated[rowIndex])
        });
    };

    const handleDeleteClick = (col) => {
        setDeleteConfirmation({
            isOpen: true,
            accessor: col.name,
            label: col.column_heading,
            isDynamic: true
        });
    };

    const confirmDelete = async () => {
        const { accessor } = deleteConfirmation;
        try {
            const res = await fetch(`/api/columns/deactivate/${accessor}`, {
                method: "PATCH"
            });

            if (!res.ok) throw new Error("Failed to deactivate column");

            setColumnsDef(prev => prev.filter(col => col.name !== accessor));
            setDeleteConfirmation({ isOpen: false, accessor: '', label: '', isDynamic: false });
        } catch (err) {
            console.error("Deactivation failed:", err);
            alert("Error: " + err.message);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, accessor: '', label: '', isDynamic: false });
    };

    /* ---------------- ADD ROW ---------------- */
    const addRow = async () => {
        try {
            const newRow = {};
            columnsDef.forEach(col => {
                newRow[col.name] = "";
            });

            const res = await fetch("/api/development", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRow)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to add row");
            }

            const saved = await res.json();
            setData(prev => [...prev, saved]);
        } catch (err) {
            console.error("Error adding row:", err);
            alert("Error adding row: " + err.message);
        }
    };

    /* ---------------- RENAME COLUMN ---------------- */
    const handleRename = async (oldName, newName) => {
        if (!newName || oldName === newName) return;
        const trimmedNewName = newName.trim();
        if (!trimmedNewName || oldName === trimmedNewName) return;

        try {
            const res = await fetch(`/api/columns/${oldName}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newHeading: trimmedNewName })
            });

            if (!res.ok) throw new Error("Failed to rename column heading");

            setColumnsDef(prev =>
                prev.map(col =>
                    col.name === oldName ? { ...col, column_heading: trimmedNewName } : col
                )
            );
        } catch (err) {
            console.error("Column rename failed:", err);
            alert("Rename failed: " + err.message);
        }
    };

    /* ---------------- DYNAMIC COLUMNS ---------------- */
    const columns = useMemo(() => {
        const baseColumns = [
            {
                header: (
                    <div className="d-flex flex-column gap-2 align-items-center">
                    </div>
                ),
                accessor: "index",
                render: (_, rowIndex) => <span>{rowIndex + 1}</span>
            },
            ...columnsDef.map(col => ({
                header: (
                    <div className="d-flex flex-column gap-2">
                        <div className="d-flex align-items-center justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-2 flex-grow-1">
                                <input
                                    defaultValue={col.column_heading}
                                    className="header-edit-input flex-grow-1 text-dark"
                                    onBlur={(e) => handleRename(col.name, e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                                />
                                {col.sorting && (
                                    <button
                                        className="btn btn-link p-0 text-dark"
                                        onClick={() => requestSort(col.name)}
                                        title={`Sort by ${col.column_heading}`}
                                    >
                                        {sortConfig.key === col.name ? (
                                            sortConfig.direction === 'asc' ? '↑' : '↓'
                                        ) : '↕'}
                                    </button>
                                )}
                            </div>
                            {isDelete && (
                                <button
                                    className="btn btn-link text-danger p-0"
                                    onClick={() => handleDeleteClick(col)}
                                    title="Deactivate Column"
                                >
                                    <FaTrash className="delete-icon" size={14} />
                                </button>
                            )}
                        </div>
                        {isFilterOpen && col.sorting && (
                            <div className="filter-row-input">
                                <div className="filter-input-wrapper">
                                    {col.column_type === 'select' ? (
                                        <select
                                            className="form-control form-control-sm text-dark"
                                            value={filters[col.name] || ""}
                                            onChange={(e) => handleFilterChange(col.name, e.target.value)}
                                        >
                                            <option value="">All</option>
                                            {(col.multipleValue || []).map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={col.column_type === 'date' ? 'date' : col.column_type === 'number' ? 'number' : 'text'}
                                            className="form-control form-control-sm text-dark"
                                            placeholder={`Filter ${col.column_heading}...`}
                                            value={filters[col.name] || ""}
                                            onChange={(e) => handleFilterChange(col.name, e.target.value)}
                                        />
                                    )}
                                    {filters[col.name] && (
                                        <button
                                            type="button"
                                            className="filter-clear-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFilterChange(col.name, "");
                                            }}
                                            title="Clear filter"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ),
                accessor: col.name,
                render: (row, rowIndex) => {
                    const value = row[col.name] || "";

                    if (col.column_type === "select") {
                        return (
                            <select
                                value={value}
                                className="bg-transparent border-0 w-100 text-dark"
                                onChange={(e) =>
                                    handleChange(rowIndex, col.name, e.target.value)
                                }
                            >
                                <option value="">Select</option>
                                {(col.multipleValue || []).map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        );
                    }

                    return (
                        <input
                            type={col.column_type === 'date' ? 'date' : col.column_type === 'number' ? 'number' : 'text'}
                            value={value}
                            className="bg-transparent border-0 w-100 text-dark"
                            onChange={(e) =>
                                handleChange(rowIndex, col.name, e.target.value)
                            }
                        />
                    );
                }
            }))
        ];
        return baseColumns;
    }, [columnsDef, data, isDelete, isFilterOpen, filters, sortConfig, activeSuggestionField, clearFilters]);

    return (
        <section className="ftco-section">
            <div className='heading_info'>
                <h1>Projects List</h1>
                <div className='d-flex align-items-center gap-2'>
                    <button
                        className="btn btn-outline-dark"
                        onClick={() => addRow()}
                    >
                        Add Row
                    </button>
                    <button
                        className="btn btn-outline-dark"
                        onClick={() => setIsColumnModalOpen(true)}
                    >
                        Add Column
                    </button>
                    {isDelete && (
                        <button
                            onClick={() => setIsDelete(false)}
                            className="btn btn-outline-danger"
                            title="Cancel Edit Mode"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <FaTimes size={16} />
                        </button>
                    )}
                    <button onClick={handleColumnEditClick} className={`btn ${isDelete ? 'btn-dark' : 'btn-outline-dark'}`} title="Toggle Edit Mode">
                        <svg fill="currentColor" width="16" height="16" viewBox="0 0 528.899 528.899"><path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path></svg>
                    </button>
                    <button onClick={handleFilterClick} className={`btn ${isFilterOpen ? 'btn-dark' : 'btn-outline-dark'}`} title="Toggle Filters">
                        <svg viewBox="0 0 24 24" fill="none" xmlnsXlink="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fillRule="evenodd" clipRule="evenodd" d="M15 10.5A3.502 3.502 0 0 0 18.355 8H21a1 1 0 1 0 0-2h-2.645a3.502 3.502 0 0 0-6.71 0H3a1 1 0 0 0 0 2h8.645A3.502 3.502 0 0 0 15 10.5zM3 16a1 1 0 1 0 0 2h2.145a3.502 3.502 0 0 0 6.71 0H21a1 1 0 1 0 0-2h-9.145a3.502 3.502 0 0 0-6.71 0H3z" fill="#000000"></path></g></svg>
                    </button>
                    {Object.values(filters).some(v => v) && (
                        <button
                            onClick={clearFilters}
                            className="btn btn-outline-secondary"
                            title="Clear All Filters"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Clear All</span>
                        </button>
                    )}
                </div>
            </div>
            <Table columns={columns} data={filteredAndSortedData} />

            <Form
                showColumnHeading={true} showDataType={true} showSortable={true}
                isPopupOpen={isColumnModalOpen}
                onPopupClose={() => setIsColumnModalOpen(false)}
                onPopupSave={async (newColumn) => {
                    try {
                        const res = await fetch("/api/columns", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(newColumn)
                        });

                        if (!res.ok) {
                            const errorData = await res.json();
                            throw new Error(errorData.error || "Failed to save column");
                        }

                        const saved = await res.json();
                        setColumnsDef(prev => [...prev, saved]);
                    } catch (err) {
                        console.error("Error saving column:", err);
                        alert("Error saving column: " + err.message);
                    }
                }}
            />

            {deleteConfirmation.isOpen && (
                <div className="delete-confirmation-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="delete-confirmation-modal" style={{
                        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                        textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                        <h4>Delete Column</h4>
                        <p>Are you sure you want to delete the column "<strong>{deleteConfirmation.label}</strong>"?</p>
                        <div className="d-flex justify-content-center gap-2 mt-3">
                            <button className="btn btn-danger me-2" onClick={confirmDelete}>Yes</button>
                            <button className="btn btn-secondary" onClick={cancelDelete}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default TableColumns;