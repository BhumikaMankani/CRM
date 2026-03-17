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
  const [viewAccess, setViewAccess] = useState([]);
  const [columnHeading, setColumnHeading] = useState("");
  const [sorting, setSorting] = useState(false);
  const [equalPrefix, setEqualPrefix] = useState("");
  const [morePrefix, setMorePrefix] = useState("");
  const [lessPrefix, setLessPrefix] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [showYear, setShowYear] = useState(false);
  const [rowpopup_column, setRowpopup_column] = useState(false);


  const handleSortingChange = (e) => {
    setSorting(e.target.checked);
  };


  useEffect(() => {
    if (column) {
      const ids = Array.isArray(column.access)
        ? column.access.map((id) => String(id))
        : [];
      const viewIds = Array.isArray(column.viewAccess)
        ? column.viewAccess.map((id) => String(id))
        : [];
      setAccess(ids);
      setViewAccess(viewIds);
      setColumnHeading(column.column_heading || column.name || "");
      setSorting(!!column.sorting);
      setEqualPrefix(column.equalPrefix || "");
      setMorePrefix(column.morePrefix || "");
      setLessPrefix(column.lessPrefix || "");
      setShowInfo(!!column.showInfo);
      setSticky(!!column.sticky);
      setRowpopup_column(!!column.rowpopup_column);
      setShowYear(!!column.showYear);
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

  const handleViewAccessToggle = (userId) => {
    const userIdStr = String(userId);
    setViewAccess((prev) => {
      if (prev.some((id) => String(id) === userIdStr)) {
        return prev.filter((id) => String(id) !== userIdStr);
      }
      return [...prev, userIdStr];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave && column) {
      onSave(column.name, {
        access,
        viewAccess,
        sorting,
        column_heading: columnHeading.trim(),
        equalPrefix: column.column_type === "condition" ? equalPrefix : undefined,
        morePrefix: column.column_type === "condition" ? morePrefix : undefined,
        lessPrefix: column.column_type === "condition" ? lessPrefix : undefined,
        showInfo,
        sticky,
        rowpopup_column,
        showYear,
      });
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
            <div style={{ marginTop: "10px" }}>
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

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showInfo"
                  name="showInfo"
                  checked={showInfo}
                  onChange={(e) => setShowInfo(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showInfo">
                  Show Info
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="sticky"
                  name="sticky"
                  checked={sticky}
                  onChange={(e) => setSticky(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="sticky">
                  Sticky Column
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showYear"
                  name="showYear"
                  checked={showYear}
                  onChange={(e) => setShowYear(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showYear">
                  Show Year
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rowpopup"
                  name="rowpopup_column"
                  checked={rowpopup_column}
                  onChange={(e) => setRowpopup_column(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rowpopup">
                  Show in row popup
                </label>
              </div>
            </div>
            {column.column_type === "condition" && (
              <div className="options-container" style={{ padding: "10px", border: "1px solid #dee2e6", borderRadius: "6px", marginBottom: "15px" }}>
                <p className="small text-muted mb-2">Condition Prefixes</p>
                <div className="form-group">
                  <label className="small">Prefix (if days equal 0)</label>
                  <input
                    type="text"
                    className="form-input text-dark"
                    value={equalPrefix}
                    onChange={(e) => setEqualPrefix(e.target.value)}
                    placeholder="e.g. Deadline Today"
                  />
                </div>
                <div className="form-group">
                  <label className="small">Prefix (if days &gt; 0)</label>
                  <input
                    type="text"
                    className="form-input text-dark"
                    value={morePrefix}
                    onChange={(e) => setMorePrefix(e.target.value)}
                    placeholder="e.g. Due in"
                  />
                </div>
                <div className="form-group">
                  <label className="small">Prefix (if days &lt; 0)</label>
                  <input
                    type="text"
                    className="form-input text-dark"
                    value={lessPrefix}
                    onChange={(e) => setLessPrefix(e.target.value)}
                    placeholder="e.g. Overdue by"
                  />
                </div>
              </div>
            )}

            <hr></hr>

            <div className="row">
              <div className="col-6 form-group" style={{ marginTop: "5px" }}>
                <label><b>Who can edit this column :</b></label>
                {/* <p className="small text-muted mb-2">
                  Staff members who can edit this column
                </p> */}
                <div
                  className="access-users-list"
                >
                  {availableUsers.length > 1 ? (
                    availableUsers.map((user) => user.status === 'staff' && (
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
                          {user.user_name}

                          {/* {user.status === "admin" && "(Admin)"} */}
                        </label>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
              <div className="col-6 form-group" style={{ marginTop: "5px" }}>
                <label><b>Who can't see this column :</b></label>
                {/* <p className="small text-muted mb-2">
                  Staff members who can't see this column
                </p> */}
                <div
                  className="access-users-list"
                >
                  {availableUsers.length > 1 ? (
                    availableUsers.map((user) => user.status === 'staff' && (
                      <div
                        key={user._id}
                        className="form-check"
                        style={{ marginBottom: "2px" }}
                      >
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`view-access-${column.name}-${user._id}`}
                          checked={viewAccess.some((id) => String(id) === String(user._id))}
                          onChange={() => handleViewAccessToggle(user._id)}
                        />
                        <label
                          className="form-check-label text-dark"
                          htmlFor={`view-access-${column.name}-${user._id}`}
                          style={{ fontSize: "14px" }}
                        >
                          {user.user_name}
                        </label>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Save
            </button>
          </form>
        </div >
      </div >
    </div >
  );
};

export default EditColumnAccessModal;
