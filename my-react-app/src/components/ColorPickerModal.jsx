import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import "./ColorPickerModal.css";

function ColorPickerModal({ isOpen, onClose, onSave, columnHeading, options, existingColors }) {
    const [localOptions, setLocalOptions] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // stores index of option to delete

    useEffect(() => {
        if (isOpen) {
            const merged = (options || []).map(opt => ({
                text: opt,
                color: (existingColors && existingColors[opt]) || "#ffffff"
            }));
            setLocalOptions(merged);
            setShowDeleteConfirm(null);
        }
    }, [isOpen, options, existingColors]);

    const handleLabelChange = (index, newText) => {
        const updated = [...localOptions];
        updated[index].text = newText;
        setLocalOptions(updated);
    };

    const handleColorChange = (index, newColor) => {
        const updated = [...localOptions];
        updated[index].color = newColor;
        setLocalOptions(updated);
    };

    const handleAddOption = () => {
        setLocalOptions([...localOptions, { text: "", color: "#ffffff" }]);
    };

    const confirmDelete = (index) => {
        setShowDeleteConfirm(index);
    };

    const handleDelete = () => {
        if (showDeleteConfirm !== null) {
            const updated = localOptions.filter((_, i) => i !== showDeleteConfirm);
            setLocalOptions(updated);
            setShowDeleteConfirm(null);
        }
    };

    const handleSave = () => {
        const multipleValue = localOptions.map(o => o.text.trim()).filter(Boolean);
        const optionColors = {};
        localOptions.forEach(o => {
            if (o.text.trim()) {
                optionColors[o.text.trim()] = o.color;
            }
        });
        onSave({ multipleValue, optionColors });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay side-panel-overlay" onClick={onClose}>
            <div className="modal-content side-panel" onClick={e => e.stopPropagation()}>
                <div className="side-panel-header">
                    <h2>Column Options</h2>
                    <button className="btn btn-link p-0 text-muted" onClick={onClose}>
                        <FaTimes size={22} />
                    </button>
                </div>

                <div className="side-panel-body">
                    <div className="column-info-tag">
                        Editing: <strong>{columnHeading}</strong>
                    </div>

                    <div className="options-stack mb-4">
                        {localOptions.map((opt, index) => (
                            <div key={index} className="option-edit-card">
                                <div className="color-input-wrapper">
                                    <input
                                        type="color"
                                        value={opt.color}
                                        onChange={(e) => handleColorChange(index, e.target.value)}
                                        title="Assign Color"
                                    />
                                </div>
                                <input
                                    type="text"
                                    className="form-control option-label-input"
                                    placeholder="Option name..."
                                    value={opt.text}
                                    onChange={(e) => handleLabelChange(index, e.target.value)}
                                />
                                <button
                                    className="btn btn-link delete-btn-minimal"
                                    onClick={() => confirmDelete(index)}
                                    title="Remove Option"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn add-option-trigger"
                            onClick={handleAddOption}
                        >
                            <FaPlus className="me-2" size={14} /> Add New Option
                        </button>
                    </div>
                </div>

                <div className="side-panel-footer">
                    <button
                        className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={handleSave}
                        style={{ borderRadius: '10px', fontWeight: '600' }}
                    >
                        <FaSave /> Save Options
                    </button>
                    <button
                        className="btn btn-outline-secondary flex-grow-1 py-2"
                        onClick={onClose}
                        style={{ borderRadius: '10px', fontWeight: '600' }}
                    >
                        Cancel
                    </button>
                </div>

                {/* Internal Delete Confirmation Overlay */}
                {showDeleteConfirm !== null && (
                    <div className="delete-confirm-overlay">
                        <div className="confirm-dialog">
                            <p>Remove this option? This change will be saved when you click "Save Options".</p>
                            <div className="d-flex gap-3 justify-content-center">
                                <button className="btn btn-danger px-4 py-2" onClick={handleDelete} style={{ borderRadius: '8px' }}>Remove</button>
                                <button className="btn btn-light px-4 py-2" onClick={() => setShowDeleteConfirm(null)} style={{ borderRadius: '8px' }}>Keep</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ColorPickerModal;
