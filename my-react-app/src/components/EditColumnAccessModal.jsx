import React, { useState, useEffect } from "react";
import "./Form.css";

const EditColumnAccessModal = ({
  isOpen,
  onClose,
  onSave,
  column,
  showSortable,
  availableUsers = [],
}) => {
  const [access, setAccess] = useState([]);
  const [columnHeading, setColumnHeading] = useState("");
  const [sorting, setSorting] = useState(false);


  const handleSortingChange = (e) => {
    setSorting(e.target.checked);
  };
  
  useEffect(() => {
    if (column) {
      const ids = Array.isArray(column.access)
        ? column.access.map((id) => String(id))
        : [];
      setAccess(ids);
      setColumnHeading(column.column_heading || column.name || "");
      setSorting(!!column.sorting); // ✅ IMPORTANT

    }
  }, [column]);

  const handleAccessToggle = (userId) => {
    const userIdStr = String(userId);
    setAccess((prev) => {
      if (prev.some((id) => String(id) === userIdStr)) {
        return prev.filter((id) => String(id) !== userIdStr);
      }
      return [...prev, userIdStr];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave && column) {
      onSave(column.name, { access, sorting, column_heading: columnHeading.trim() });
    }
    onClose?.();
  };

  if (!isOpen || !column) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <div className="form-container">
          <div className="form-header">
            <h2>Edit Column Access</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Column Name</label>
              <input
                type="text"
                className="form-input text-dark"
                value={columnHeading}
                onChange={(e) => setColumnHeading(e.target.value)}
                placeholder="e.g. Status, Department"
                required
              />
            </div>

            {showSortable && (
  <div className="form-check form-check-inline">
    <input
      className="form-check-input"
      type="checkbox"
      id="sorting"
      name="sorting"
      checked={sorting}          // ✅ FIX
      onChange={handleSortingChange}
    />
    <label className="form-check-label" htmlFor="sorting">
      Sorting and filter options
    </label>
  </div>
)}


            <div className="form-group">
              <label>Access</label>
              <p className="small text-muted mb-2">
                Users who can edit or delete this column (Admin always has
                access)
              </p>
              <div
                className="access-users-list"
                style={{
                  maxHeight: "180px",
                  overflowY: "auto",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  padding: "10px",
                }}
              >
                {availableUsers.length === 0 ? (
                  <span className="text-muted small">No users available</span>
                ) : (
                  availableUsers.map((user) => (
                    <div
                      key={user._id}
                      className="form-check"
                      style={{ marginBottom: "6px" }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`edit-access-${column.name}-${user._id}`}
                        checked={access.some((id) => String(id) === String(user._id))}
                        onChange={() => handleAccessToggle(user._id)}
                      />
                      <label
                        className="form-check-label text-dark"
                        htmlFor={`edit-access-${column.name}-${user._id}`}
                        style={{ fontSize: "14px" }}
                      >
                        {user.user_name || user.email}{" "}
                        {user.status === "admin" && "(Admin)"}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditColumnAccessModal;
