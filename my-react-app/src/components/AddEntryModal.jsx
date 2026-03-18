import React, { useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AddEntryModal.css";


const AddEntryModal = ({
    isRowModel,
    onClose,
    onSave,
    canEdit,
    selectedDate,
    dateStr,
    columnsDef = [],
    data = []
}) => {
    // ----------------------------
    // INITIAL FORM STATE
    // ----------------------------
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // ----------------------------
    // HELPER: FIND COLUMN BY HEADING
    // ----------------------------
    const getColByName = (column_heading) => {
        return columnsDef.find(col =>
            (col.column_heading || "").toLowerCase().trim() === column_heading.toLowerCase().trim()
        );
    };
    const getRowPopupColumns = () => {
        return (columnsDef || []).filter(col =>
            (col.rowpopup_column || "") === true
        );
    };

    const rowPopupColumns = getRowPopupColumns();
    console.log("rowPopupColumns", rowPopupColumns);

    const projectCol = getColByName("Project");
    const startDateCol = getColByName("Start Date");
    const dailyCheckCol = getColByName("Daily Check");
    const statusCol = getColByName("Status");
    const endDateCol = getColByName("End Date");
    const categoryCol = getColByName("Category");
    const salesDiscussionCol = getColByName("Sales Discussion");
    const teamLeaderCol = getColByName("Team Lead");
    const pmCol = getColByName("Project Manager");
    const groupCol = getColByName("Group");

    useEffect(() => {
        if (!isRowModel) {
            setFormData({});
            setErrors({});
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const todayDate = new Date().toISOString().split('T')[0];

        let initialRow = {};

        // Initialize all columns as empty
        columnsDef.forEach(col => {
            initialRow[col.name] = "";
        });

        // Apply overrides for specific fields
        if (projectCol) initialRow[projectCol.name] = "";
        if (statusCol) initialRow[statusCol.name] = "Not started";
        if (startDateCol) initialRow[startDateCol.name] = todayDate;
        if (dailyCheckCol) initialRow[dailyCheckCol.name] = "No";

        setFormData(initialRow);
    }, [isRowModel, projectCol, groupCol, statusCol, startDateCol, data, columnsDef]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        if (projectCol && name === projectCol.name) {

            // Show loader
            setIsLoading(true);
            setShowSuggestions(false);

            setTimeout(() => {

                if (value.trim()) {

                    const uniqueProjects = [
                        ...new Set(
                            data.map(row => row[projectCol.name]).filter(Boolean)
                        )
                    ];

                    const filtered = uniqueProjects.filter(p =>
                        p.toLowerCase().includes(value.toLowerCase())
                    );

                    setSuggestions(filtered.slice(0, 10));
                    setShowSuggestions(true);

                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);

                    // Reset dates when project name is cleared
                    setFormData(prev => ({
                        ...prev,
                        ...(dailyCheckCol ? { [dailyCheckCol.name]: "No" } : {}),
                        ...(startDateCol ? { [startDateCol.name]: new Date().toISOString().split('T')[0] } : {}),
                        ...(endDateCol ? { [endDateCol.name]: "" } : {})
                    }));
                }

                // Hide loader
                setIsLoading(false);

            }, 500); // <-- your requested delay
        }
    };

    // ----------------------------
    // SUGGESTION HANDLER
    // ----------------------------
    const handleSelectSuggestion = (projName) => {
        const latestForProjectRow = data.find(row => row[projectCol.name] === projName);

        if (latestForProjectRow && projectCol) {
            // Clone the matched row
            const updatedForm = { ...latestForProjectRow };

            // Remove system fields
            delete updatedForm._id;
            delete updatedForm.createdAt;
            delete updatedForm.updatedAt;
            delete updatedForm.__v;

            // Clear all select-type column values so user must pick the correct option
            columnsDef.forEach(col => {
                if (col.column_type === "select") {
                    updatedForm[col.name] = "";
                }
            });
            const todayDate = new Date().toISOString().split('T')[0];

            // Preserve current project name selection
            updatedForm[projectCol.name] = projName;
            updatedForm[startDateCol.name] = todayDate;
            updatedForm[endDateCol.name] = "";
            updatedForm[dailyCheckCol.name] = "No";
            updatedForm[statusCol.name] = "Not started";

            setFormData(updatedForm);
        }

        setShowSuggestions(false);
    };

    // ----------------------------
    // SUBMIT HANDLER
    // ----------------------------
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave?.(formData);
        onClose?.();
    };

    if (!isRowModel) return null;

    return (
        <div className="modal-overlay" onClick={() => setShowSuggestions(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="form-container" style={{ padding: '0px' }}>
                    <button type="button" className="close-btn" onClick={onClose}><IoCloseSharp /></button>
                    <div className="form-header"><h2 className="modal-title">Create New Project</h2></div>

                    <form onSubmit={handleSubmit} className="modal-scroll-form">
                        {Array.from({ length: Math.ceil(rowPopupColumns.length / 2) }, (_, rowIndex) => {
                            const cols = rowPopupColumns.slice(rowIndex * 2, rowIndex * 2 + 2);

                            return (
                                <div className="row" key={rowIndex}>
                                    {cols.map((col, index) => (
                                        <div className="col-6" key={index}>
                                            <div className="form-group" style={{ position: 'relative' }}>
                                                <label className="modal-label">
                                                    {col.column_heading} {col.is_required ? "*" : ""}
                                                </label>

                                                {col.column_type === 'text' && (
                                                    <input
                                                        type="text"
                                                        name={col.name}
                                                        value={formData[col.name] || ""}
                                                        onChange={handleChange}
                                                        className="modal-input"
                                                        placeholder={`Enter ${col.column_heading}`}
                                                    />
                                                )}

                                                {col.column_type === 'date' && (
                                                    <input
                                                        type="date"
                                                        name={col.name}
                                                        value={formData[col.name] || ""}
                                                        onChange={handleChange}
                                                        className="modal-input"
                                                    />
                                                )}

                                                {col.column_type === 'select' && (
                                                    <select
                                                        name={col.name}
                                                        value={formData[col.name] || ""}
                                                        onChange={handleChange}
                                                        className="modal-input"
                                                    >
                                                        <option value="">Select {col.column_heading}</option>
                                                        {((col.options || col.multipleValue) || []).map((option, i) => (
                                                            <option key={i} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {col.column_type === 'monthYear' && (
                                                    <DatePicker
                                                        selected={formData[col.name] ? new Date(formData[col.name]) : null}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                const monthNames = [
                                                                    "January", "February", "March", "April", "May", "June",
                                                                    "July", "August", "September", "October", "November", "December"
                                                                ];

                                                                const newValue = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    [col.name]: newValue
                                                                }));
                                                            } else {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    [col.name]: ""
                                                                }));
                                                            }
                                                        }}
                                                        dateFormat="MMMM yyyy"
                                                        showMonthYearPicker
                                                        className="form-control"
                                                        placeholderText="Select Month Year"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                        {/* <div className="row">
                            {projectCol && (
                                <div className="col-6">
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label className="modal-label">Project Name *</label>
                                        <input
                                            type="text"
                                            name={projectCol.name}
                                            value={formData[projectCol.name] || ""}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            className={`form-input text-dark ${errors[projectCol.name] ? 'error' : ''}`}
                                            placeholder="Enter project name"
                                        />
                                        {isLoading ? (
                                            <div className="loader">
                                                <div className="loader-wheel"></div>
                                            </div>) : null
                                        }
                                        {showSuggestions && suggestions.length > 0 && (
                                            <ul className="suggestions-dropdown">
                                                {suggestions.map((p, idx) => (
                                                    <li key={idx} onClick={() => handleSelectSuggestion(p)}>
                                                        {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {errors[projectCol.name] && <span className="error-text">{errors[projectCol.name]}</span>}
                                    </div>
                                </div>
                            )}
                            {groupCol && (
                                <div className="col-6 form-group" style={{ marginBottom: '12px' }}>
                                    <label className="modal-label">Group</label>
                                    <select
                                        name={groupCol.name}
                                        value={formData[groupCol.name] || ""}
                                        onChange={handleChange}
                                        className={`form-select text-dark ${errors[groupCol.name] ? 'error' : ''}`}
                                    >
                                        <option value="">Select group</option>
                                        {(groupCol.multipleValue || []).map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    {errors[groupCol.name] && <span className="error-text">{errors[groupCol.name]}</span>}
                                </div>
                            )}
                        </div>
                        <div className="row">
                            {startDateCol && (
                                <div className="col-6 form-group" style={{ marginBottom: '12px' }}>
                                    <label className="modal-label">Start Date *</label>
                                    <input
                                        type="date"
                                        name={startDateCol.name}
                                        value={formData[startDateCol.name] || ""}
                                        onChange={handleChange}
                                        className={`form-input ${errors[startDateCol.name] ? 'error' : ''}`}
                                    />
                                    {errors[startDateCol.name] && <span className="error-text">{errors[startDateCol.name]}</span>}
                                </div>
                            )}
                            {endDateCol && (
                                <div className="col-6 form-group" style={{ marginBottom: '12px' }}>
                                    <label className="modal-label">End Date *</label>
                                    <input
                                        type="date"
                                        name={endDateCol.name}
                                        value={formData[endDateCol.name] || ""}
                                        onChange={handleChange}
                                        className={`form-input ${errors[endDateCol.name] ? 'error' : ''}`}
                                    />
                                    {errors[endDateCol.name] && <span className="error-text">{errors[endDateCol.name]}</span>}
                                </div>
                            )}
                        </div>
                        <div className="row">
                            {categoryCol && (
                                <div className="col-6 form-group" style={{ marginBottom: '12px' }}>
                                    <label className="modal-label">Category</label>
                                    <select
                                        name={categoryCol.name}
                                        value={formData[categoryCol.name] || ""}
                                        onChange={handleChange}
                                        className={`form-select text-dark ${errors[categoryCol.name] ? 'error' : ''}`}
                                    >
                                        <option value="">Select Category</option>
                                        {(categoryCol.multipleValue || []).map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    {errors[categoryCol.name] && <span className="error-text">{errors[categoryCol.name]}</span>}
                                </div>
                            )}

                            {pmCol && (
                                <div className="col-6 form-group" style={{ marginBottom: '12px' }}>
                                    <label className="modal-label">Project Manager</label>
                                    <select
                                        name={pmCol.name}
                                        value={formData[pmCol.name] || ""}
                                        onChange={handleChange}
                                        className={`form-select text-dark ${errors[pmCol.name] ? 'error' : ''}`}
                                    >
                                        <option value="">Select Project Manager</option>
                                        {(pmCol.multipleValue || []).map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    {errors[pmCol.name] && <span className="error-text">{errors[pmCol.name]}</span>}
                                </div>
                            )}
                        </div>
                        <div className="row">
                            {teamLeaderCol && (
                                <div className="col-6 form-group" style={{ marginBottom: '12px' }}>
                                    <label className="modal-label">Team Lead</label>
                                    <select
                                        name={teamLeaderCol.name}
                                        value={formData[teamLeaderCol.name] || ""}
                                        onChange={handleChange}
                                        className={`form-select text-dark ${errors[teamLeaderCol.name] ? 'error' : ''}`}
                                    >
                                        <option value="">Select team lead</option>
                                        {(teamLeaderCol.multipleValue || []).map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    {errors[teamLeaderCol.name] && <span className="error-text">{errors[teamLeaderCol.name]}</span>}
                                </div>
                            )}

                            {salesDiscussionCol && (
                                <div className="col-6 form-group" style={{ marginBottom: '12px' }}>
                                    <label className="modal-label">Sales discussion on</label>
                                    <select
                                        name={salesDiscussionCol.name}
                                        value={formData[salesDiscussionCol.name] || ""}
                                        onChange={handleChange}
                                        className={`form-select text-dark ${errors[salesDiscussionCol.name] ? 'error' : ''}`}
                                    >
                                        <option value="">Select Sales discussion</option>
                                        {(salesDiscussionCol.multipleValue || []).map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    {errors[salesDiscussionCol.name] && <span className="error-text">{errors[salesDiscussionCol.name]}</span>}
                                </div>
                            )}
                        </div> */}
                        <div className="modal-actions" style={{ paddingTop: "0px", marginTop: "16px" }}>
                            {/* <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button> */}
                            <button type="submit" className="submit-btn">
                                Save Project
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddEntryModal;
