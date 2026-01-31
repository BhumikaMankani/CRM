import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './SaveFilterModal.css';

const SaveFilterModal = ({ isOpen, onClose, onSave, filters }) => {
    const [filterName, setFilterName] = useState('');
    const [error, setError] = useState('');

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
            await onSave(filterName, filters);
            setFilterName('');
            setError('');
        } catch (err) {
            const errorMsg = err.message || 'Failed to save filter';
            setError(errorMsg);
            console.error('Error saving filter:', err);
        }
    };

    const handleClose = () => {
        setFilterName('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="save-filter-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>Save Filter</h4>
                    <button className="close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="mb-3">
                        <label htmlFor="filterName" className="form-label">
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

                    <div className="filter-preview visually-hidden">
                        <h6 className="mb-2">Applied Filters:</h6>
                        <div className="filters-list">
                            {Object.keys(filters).length > 0 ? (
                                Object.entries(filters).map(([key, value]) => (
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
                                ))
                            ) : (
                                <p className="text-muted small">No filters applied</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                    >
                        Save Filter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveFilterModal;
