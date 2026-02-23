import React, { useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import "./AddEntryModal.css";

const AddEntryModal = ({
    isRowModel,
    onClose,
    onSave,
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
    const getColByName = (heading) => {
        return columnsDef.find(col =>
            (col.column_heading || "").toLowerCase().trim() === heading.toLowerCase().trim()
        );
    };

    const projectCol = getColByName("Project");
    const startDateCol = getColByName("Start Date");
    const dailyCheckCol = getColByName("Daily Check");
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

        // Clone the latest row data if available
        let latestRow = data.length > 0 ? { ...data[0] } : {};

        // Remove system fields that shouldn't be copied
        delete latestRow._id;
        delete latestRow.createdAt;
        delete latestRow.updatedAt;
        delete latestRow.__v;

        // Clear all select-type column values so user must pick the correct option
        columnsDef.forEach(col => {
            if (col.column_type === "select" || col.column_type === "date") {
                latestRow[col.name] = "";
            }
        });

        // Apply overrides for text fields
        if (projectCol) latestRow[projectCol.name] = "";
        if (startDateCol) latestRow[startDateCol.name] = todayDate;
        if (dailyCheckCol) latestRow[dailyCheckCol.name] = "No";

        setFormData(latestRow);
    }, [isRowModel, projectCol, groupCol, startDateCol, data]);

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

            // Preserve current project name selection
            updatedForm[projectCol.name] = projName;

            setFormData(updatedForm);
        }

        setShowSuggestions(false);
    };

    // ----------------------------
    // SUBMIT HANDLER
    // ----------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple Validation
        const newErrors = {};
        if (projectCol && !formData[projectCol.name]) newErrors[projectCol.name] = "Project Name is required";
        if (startDateCol && !formData[startDateCol.name]) newErrors[startDateCol.name] = "Start Date is required";
        if (endDateCol && !formData[endDateCol.name]) newErrors[endDateCol.name] = "End Date is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

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
                        <div className="row">
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
                        </div>
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
