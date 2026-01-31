import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Table from "./Table";
import AddEntryModal from "./AddEntryModal";
import Form from "./Form";
import ToggleButtonIcon from "./toggle";
import SaveFilterModal from "./SaveFilterModal";
import FilterSidebar from "./FilterSidebar";
import { API_URL } from "../../proxy";
import { FaTrash, FaTimes } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import ColorPickerModal from "./ColorPickerModal";
import { FaPalette } from "react-icons/fa";

function TableColumns() {
  // Create a ref for FilterSidebar
  const filterSidebarRef = useRef(null);

  // Column states
  const [columnsDef, setColumnsDef] = useState([]);

  // Data states (row)
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedColorCol, setSelectedColorCol] = useState(null);

  const [loading, setLoading] = useState(false);
  // Column delete states
  const [isDelete, setIsDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    accessor: "",
    label: "",
    isDynamic: false,
  });

  // Sorting and filtering states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = useState(false);

  // Audit modal state
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    columnName: "",
    auditData: [],
    loading: false,
  });

  // hover delete row icon
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

  // Get data user
  const [status, setStatus] = useState(() => {
    // Get the item from localStorage
    const savedData = localStorage.getItem("user");

    // Parse it or return null if it doesn't exist
    return savedData ? JSON.parse(savedData) : null;
  });
  // Handle column delete
  // Helper for text contrast
  const getContrastYIQ = (hexcolor) => {
    if (!hexcolor || typeof hexcolor !== 'string') return 'black';
    const hex = hexcolor.replace("#", "");
    if (hex.length !== 3 && hex.length !== 6) return 'black';
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substr(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substr(2, 2), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  };

  const handleColumnEditClick = () => {
    setIsDelete(!isDelete);
  };

  // Helper for overdue calculation
  const calculateOverdue = (dateStr) => {
    if (!dateStr)
      return {
        text: "No Date",
        className: "overdue-block deadline-green text-center",
      };

    let year, month, day;
    if (dateStr.includes("-")) {
      // Assume YYYY-MM-DD (standard date input)
      [year, month, day] = dateStr.split("-");
    } else if (dateStr.includes("/")) {
      // Assume DD/MM/YYYY
      [day, month, year] = dateStr.split("/");
    } else {
      return {
        text: dateStr,
        className: "overdue-block deadline-green text-center",
      };
    }

    if (!day || !month || !year) {
      return {
        text: dateStr,
        className: "overdue-block deadline-green text-center",
      };
    }

    const targetDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Overdue by ${Math.abs(diffDays)} days`,
        className: "overdue-block bg-danger p-1 rounded text-white text-center",
      };
    } else if (diffDays === 0) {
      return {
        text: `Deadline Today`,
        className: "overdue-block bg-warning p-1 rounded text-dark text-center",
      };
    } else {
      return {
        text: `Deadline in ${diffDays} days`,
        className:
          "overdue-block bg-success p-1 rounded text-white text-center",
      };
    }
  };

  // Handle filter
  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setIsFilterOpen(false);
  }, []);

  // Save filter
  const handleSaveFilter = async (filterName, filterData, allowedUsers) => {
    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user._id) {
        console.error("User data missing:", user);
        alert("User information not found. Please log in again.");
        return;
      }

      console.log("Saving filter with data:", {
        userId: user._id,
        filterName,
        filterData,
        allowedUsers,
      });

      const response = await fetch(`${API_URL}/api/filters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          filterName,
          filterData,
          allowedUsers,
        }),
      });

      console.log("Filter save response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Filter save error response:", errorData);
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const savedData = await response.json();
      console.log("Filter saved successfully:", savedData);

      // Add the new filter to the sidebar immediately
      if (filterSidebarRef.current) {
        filterSidebarRef.current.addNewFilterToList(savedData);
      }

      setIsSaveFilterModalOpen(false);
      // alert("Filter saved successfully!");
    } catch (err) {
      console.error("Error saving filter:", err);
      alert(`Failed to save filter: ${err.message}`);
    }
  };

  // Apply saved filter
  const handleFilterSelect = (filterData) => {
    setFilters(filterData);
  };

  // Delete saved filter
  const handleDeleteFilter = async (filterId, e) => {
    if (e) e.stopPropagation();

    try {
      const response = await fetch(`${API_URL}/api/filters/${filterId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete filter");
      }

      // Update the sidebar to remove the deleted filter
      if (
        filterSidebarRef.current &&
        filterSidebarRef.current.removeFilterFromList
      ) {
        filterSidebarRef.current.removeFilterFromList(filterId);
      }

      // alert("Filter deleted successfully!");
    } catch (err) {
      console.error("Error deleting filter:", err);
      alert(`Failed to delete filter: ${err.message}`);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data];

    // Apply filters
    Object.keys(filters).forEach((key) => {
      const filterValue = filters[key];
      if (filterValue === undefined || filterValue === null) return;
      // Multi-select (array): row matches if its value is in the selected list
      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) return;
        processedData = processedData.filter((row) => {
          const cellValue = String(row[key] ?? "").trim();
          return filterValue.some(
            (fv) => String(fv ?? "").trim().toLowerCase() === cellValue.toLowerCase()
          );
        });
      } else {
        const filterStr = String(filterValue).toLowerCase();
        if (!filterStr) return;
        processedData = processedData.filter((row) => {
          const cellValue = String(row[key] || "").toLowerCase();
          return cellValue.includes(filterStr);
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return processedData;
  }, [data, filters, sortConfig]);

  // Close multi-select dropdown when clicking outside
  useEffect(() => {
    if (!openFilterDropdown) return;
    const close = (e) => {
      if (!e.target.closest(".filter-input-wrapper-multiselect")) {
        setOpenFilterDropdown(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openFilterDropdown]);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async ({ showSpinner } = { showSpinner: true }) => {
      try {
        if (showSpinner && isMounted) setLoading(true);

        const [columnsRes, devRes] = await Promise.all([
          fetch(`${API_URL}/api/columns`),
          fetch(`${API_URL}/api/development`),
        ]);

        if (!columnsRes.ok) throw new Error("Failed to fetch columns");
        if (!devRes.ok) throw new Error("Failed to fetch development data");

        const [cols, dev] = await Promise.all([
          columnsRes.json(),
          devRes.json(),
        ]);

        if (!isMounted) return;
        setColumnsDef(cols);
        setData(dev);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        if (showSpinner && isMounted) setLoading(false);
      }
    };

    // initial load
    fetchAll({ showSpinner: true });

    // auto-refresh so 24h backend changes appear without manual refresh
    const refreshInterval = setInterval(() => {
      fetchAll({ showSpinner: false });
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  /* ---------------- UPDATE CELL ---------------- */
  const handleChange = (rowId, field, value) => {
    // Update local UI state immediately
    setData((prev) =>
      prev.map((row) => (row._id === rowId ? { ...row, [field]: value } : row)),
    );

    // Find the row we are going to send to backend
    const rowToUpdate = data.find((r) => r._id === rowId);
    if (rowToUpdate) {
      // Read currently logged-in user from localStorage (same as used for `status`)
      let changedByUserName = "Unknown";
      let changedByUserId = null; // we will store email here, per requirement
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          // Display name
          changedByUserName = parsed.user_name || parsed.email || "Unknown";
          // Store email as the identifier (not ObjectId)
          changedByUserId = parsed.email || null;
        }
      } catch (e) {
        // ignore JSON parse errors and fall back to "Unknown"
      }

      fetch(`${API_URL}/api/development/${rowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rowToUpdate,
          [field]: value,
          changedByUserName,
          changedByUserId,
        }),
      });
    }
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Prevent dragging the "#" column (index 0) or dragging into its position
    if (source.index === 0 || destination.index === 0) return;
    if (source.index === destination.index) return;

    const items = Array.from(columnsDef);
    // source.index 1 corresponds to columnsDef[0]
    const [reorderedItem] = items.splice(source.index - 1, 1);
    items.splice(destination.index - 1, 0, reorderedItem);

    // Optimistic update
    setColumnsDef(items);

    const columnOrders = items.map((col, idx) => ({
      name: col.name,
      order: idx,
    }));

    try {
      const res = await fetch(`${API_URL}/api/columns/reorder/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnOrders }),
      });
      if (!res.ok) throw new Error("Failed to save column order");
    } catch (err) {
      console.error("Error saving column order:", err);
    }
  };

  const handleSaveOptions = async ({ multipleValue, optionColors }) => {
    if (!selectedColorCol) return;

    try {
      const res = await fetch(`${API_URL}/api/columns/${selectedColorCol.name}/options`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multipleValue, optionColors }),
      });

      if (!res.ok) throw new Error("Failed to save column options");

      setColumnsDef((prev) =>
        prev.map((col) =>
          col.name === selectedColorCol.name
            ? { ...col, multipleValue, optionColors }
            : col
        )
      );
    } catch (err) {
      console.error("Options save failed:", err);
      alert("Error saving options: " + err.message);
    }
  };


  const handleDeleteClick = (col) => {
    setDeleteConfirmation({
      isOpen: true,
      accessor: col.name,
      label: col.column_heading,
      isDynamic: true,
    });
  };

  const deleteRow = async (rowId, e) => {
    if (e) e.stopPropagation();

    const rowIdStr = String(rowId);
    const itemToDelete = data.find((row) => String(row._id) === rowIdStr);

    if (!itemToDelete) return;

    // Optimistic update
    const previousData = [...data];
    setData((prev) => prev.filter((row) => String(row._id) !== rowIdStr));

    console.log(data);
    console.log(rowId);
    try {
      const response = await fetch(
        `${API_URL}/api/development/deactivate/${rowId}`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        console.error("Failed to deactivate row in database");
        setData(data);
      }
    } catch (error) {
      console.error("Network error:", error);
      setData(data);
    }
  };

  const confirmDelete = async () => {
    const { accessor } = deleteConfirmation;
    try {
      const res = await fetch(`${API_URL}/api/columns/deactivate/${accessor}`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Failed to deactivate column");

      setColumnsDef((prev) => prev.filter((col) => col.name !== accessor));
      setDeleteConfirmation({
        isOpen: false,
        accessor: "",
        label: "",
        isDynamic: false,
      });
    } catch (err) {
      console.error("Deactivation failed:", err);
      alert("Error: " + err.message);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      accessor: "",
      label: "",
      isDynamic: false,
    });
  };

  /* ---------------- ADD ROW ---------------- */
  const addRow = async (newRowData) => {
    // Clear sorting and filters to ensure new row is visible at the top
    setSortConfig({ key: null, direction: "asc" });
    setFilters({});

    try {
      const newRow = { ...newRowData };
      columnsDef.forEach((col) => {
        if (!newRow.hasOwnProperty(col.name)) {
          newRow[col.name] = "";
        }
      });

      const res = await fetch(`${API_URL}/api/development`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRow),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add row");
      }

      const saved = await res.json();
      // Add new row to the top of the list
      setData((prev) => [saved, ...prev]);
      setIsModalOpen(false); // Close modal after saving

    } catch (err) {
      console.error("Error adding row:", err);
      alert("Error adding row: " + err.message);
    }
  };

  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user`);
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  const [columnAccess, setColumnAccess] = useState([]);

  const handleColumnAccess = async (columnName) => {
    // try {
    //     const response = await fetch(`${aPI_URL}/api/user/column-access`, {
    //         method: "PATCH",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ columnName }),
    //     });
    //     if (response.ok) {
    //         const data = await response.json();
    //         console.log(data.message);
    //         alert(`Access for "${columnName}" granted to all staff`);
    //     } else {
    //         console.error("Failed to update column access");
    //     }
    // } catch (err) {
    //     console.error("Error updating column access:", err);
    // }
  };

  // Define allowed columns for staff
  const valuesToMatch = useMemo(() => {
    if (!status?.column_access) return [];
    return status.column_access
      .split(",")
      .map((item) => item.trim().toLowerCase());
  }, [status]);

  // Check if user can edit this column
  const canEdit = (columnName) => {
    if (!status) return false;
    if (status.status === "admin") return true;
    if (status.status === "staff") {
      return valuesToMatch.includes(columnName.toLowerCase());
    }
    return false;
  };

  /* ---------------- RENAME COLUMN ---------------- */
  const handleRename = async (oldName, newName) => {
    if (!newName || oldName === newName) return;
    const trimmedNewName = newName.trim();
    if (!trimmedNewName || oldName === trimmedNewName) return;

    try {
      const res = await fetch(`${API_URL}/api/columns/${oldName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newHeading: trimmedNewName }),
      });

      if (!res.ok) throw new Error("Failed to rename column heading");

      setColumnsDef((prev) =>
        prev.map((col) =>
          col.name === oldName
            ? { ...col, column_heading: trimmedNewName }
            : col,
        ),
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
          <div className="d-flex flex-column gap-2 align-items-center"></div>
        ),
        accessor: "index",
        render: (row, rowIndex) =>
          columnsDef.length > 1 ? (
            <div
              className="row_index"
              onMouseEnter={() => setHoveredRowIndex(rowIndex)}
              onMouseLeave={() => setHoveredRowIndex(null)}
            >
              {status.status === "admin" ? (
                hoveredRowIndex === rowIndex ? (
                  <button
                    onClick={(e) => deleteRow(row._id, e)}
                    className=" btn btn-link text-danger p-0"
                    type="button"
                  >
                    <FaTrash className="delete-icon" size={14} />
                  </button>
                ) : (
                  <span>{rowIndex + 1}</span>
                )
              ) : (
                <span>{rowIndex + 1}</span>
              )}
            </div>
          ) : null,
      },
      ...columnsDef.map((col) => ({
        header: (
          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <input
                  defaultValue={col.column_heading}
                  className="header-edit-input flex-grow-1 text-dark"
                  {...(status.status === "admin"
                    ? {
                      onBlur: (e) => handleRename(col.name, e.target.value),
                      onKeyDown: (e) => e.key === "Enter" && e.target.blur(),
                    }
                    : { readOnly: true })}
                />
                {/* {status.status === 'admin' && (
                                    // <button type="button" onClick={() => handleColumnAccess(col.name)}>
                                    //     Toggle
                                    // </button>
                                )} */}
                {col.sorting && (
                  <button
                    className="btn btn-link p-0 text-dark"
                    onClick={() => requestSort(col.name)}
                    title={`Sort by ${col.column_heading}`}
                  >
                    {sortConfig.key === col.name
                      ? sortConfig.direction === "asc"
                        ? "↑"
                        : "↓"
                      : "↕"}
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
              {isDelete && col.column_type === "select" && (
                <button
                  className="btn btn-link text-primary p-0"
                  onClick={() => {
                    setSelectedColorCol(col);
                    setIsColorModalOpen(true);
                  }}
                  title="Edit Option Colors"
                >
                  <FaPalette className="color-icon" size={14} />
                </button>
              )}
            </div>
            {isFilterOpen && col.sorting && (
              <div className="filter-row-input">
                <div className="filter-input-wrapper filter-input-wrapper-multiselect">
                  {col.column_type === "select" ? (
                    <>
                      <button
                        type="button"
                        className="form-control form-control-sm text-dark text-start d-flex align-items-center justify-content-between filter-multiselect-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFilterDropdown((prev) =>
                            prev === col.name ? null : col.name
                          );
                        }}
                        aria-expanded={openFilterDropdown === col.name}
                        aria-haspopup="listbox"
                      >
                        <span className="text-truncate">
                          {Array.isArray(filters[col.name]) &&
                            filters[col.name].length > 0
                            ? `${filters[col.name].length} selected`
                            : "All"}
                        </span>
                        {/* <span
                          className="dropdown-arrow"
                          style={{
                            transform:
                              openFilterDropdown === col.name
                                ? "rotate(180deg)"
                                : "none",
                          }}
                        >
                          ▼
                        </span> */}
                      </button>
                      {openFilterDropdown === col.name && (
                        <div
                          className="filter-multiselect-dropdown"
                          role="listbox"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {(col.multipleValue || []).map((opt) => {
                            const selected = (
                              Array.isArray(filters[col.name])
                                ? filters[col.name]
                                : []
                            ).includes(opt);
                            return (
                              <label
                                key={opt}
                                className="filter-multiselect-option d-flex align-items-center gap-2 py-1 px-2 small"
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => {
                                    const current = Array.isArray(
                                      filters[col.name]
                                    )
                                      ? filters[col.name]
                                      : [];
                                    const next = current.includes(opt)
                                      ? current.filter((v) => v !== opt)
                                      : [...current, opt];
                                    handleFilterChange(col.name, next);
                                  }}
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <input
                      type={
                        col.column_type === "date"
                          ? "date"
                          : col.column_type === "number"
                            ? "number"
                            : "text"
                      }
                      className="form-control form-control-sm text-dark"
                      placeholder={`Filter ${col.column_heading}...`}
                      value={filters[col.name] || ""}
                      onChange={(e) =>
                        handleFilterChange(col.name, e.target.value)
                      }
                    />
                  )}
                  {((col.column_type === "select" &&
                    Array.isArray(filters[col.name]) &&
                    filters[col.name].length > 0) ||
                    (col.column_type !== "select" && filters[col.name])) && (
                      <button
                        type="button"
                        className="filter-clear-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange(
                            col.name,
                            col.column_type === "select" ? [] : ""
                          );
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
        getCellProps: (row) => {
          if (col.column_type === "select") {
            const value = (row[col.name] || "").toString().trim();
            const optionColors = col.optionColors || {};

            let optionColor = null;
            if (optionColors[value]) {
              optionColor = optionColors[value];
            } else if (optionColors.get && optionColors.get(value)) {
              optionColor = optionColors.get(value);
            } else {
              const target = value.toLowerCase();
              const keys = Object.keys(optionColors);
              const match = keys.find(k => k.trim().toLowerCase() === target);
              if (match) optionColor = optionColors[match];
            }

            if (optionColor) {
              const textColor = getContrastYIQ(optionColor);
              return {
                style: {
                  '--cell-bg': optionColor,
                  '--cell-color': textColor,
                  backgroundColor: optionColor,
                  color: textColor,
                  padding: '0 8px'
                },
                className: 'has-option-color'
              };
            }
          }
          return {};
        },
        render: (row) => {
          const value = row[col.name] || "";

          // Special handling for Overdue column

          if (
            col.name === "overdue" ||
            col.column_heading.toLowerCase() === "overdue"
          ) {
            const endDateValue = row["end_date"] || row["endDate"] || "";
            const overdueInfo = calculateOverdue(endDateValue);
            return (
              <div className={overdueInfo.className}>{overdueInfo.text}</div>
            );
          }

          // Special handling for Condition columns (date difference calculation)
          if (col.column_type === "condition") {
            const endDate = row[col.conditionColumn2];

            if (!endDate) {
              return <span className="text-muted">-</span>;
            }

            try {
              const today = new Date();
              const end = new Date(endDate);

              // remove time part for accurate day diff
              today.setHours(0, 0, 0, 0);
              end.setHours(0, 0, 0, 0);

              if (isNaN(end.getTime())) {
                return <span className="text-muted">Invalid date</span>;
              }

              const diffTime = end - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const dayClass =
                diffDays > 0
                  ? "days-positive" // future
                  : diffDays < 0
                    ? "days-negative" // overdue
                    : "days-zero"; // today

              return (
                <span className={dayClass}>{Math.abs(diffDays)} days</span>
              );
            } catch (err) {
              return <span className="text-muted">Error</span>;
            }
          }

          if (col.column_type === "select") {
            const trimmedValue = value.toString().trim();
            const optionColors = col.optionColors || {};

            let optionColor = null;
            if (optionColors[trimmedValue]) {
              optionColor = optionColors[trimmedValue];
            } else if (optionColors.get && optionColors.get(trimmedValue)) {
              optionColor = optionColors.get(trimmedValue);
            } else {
              const target = trimmedValue.toLowerCase();
              const keys = Object.keys(optionColors);
              const match = keys.find(k => k.trim().toLowerCase() === target);
              if (match) optionColor = optionColors[match];
            }

            return (
              <div className="d-flex align-items-center gap-1">
                <select
                  value={value}
                  className={`bg-transparent border-0 w-100 ${optionColor ? '' : 'text-dark'}`}
                  style={{
                    color: optionColor ? getContrastYIQ(optionColor) : 'inherit',
                    fontWeight: optionColor ? '600' : 'normal',
                    cursor: 'pointer'
                  }}
                  onChange={(e) =>
                    handleChange(row._id, col.name, e.target.value)
                  }
                  disabled={!canEdit(col.name)}
                >
                  <option value="" style={{ backgroundColor: 'white', color: 'black' }}>Select</option>
                  {(col.multipleValue || []).map((opt) => {
                    const trimmedOpt = opt.toString().trim();
                    let optColor = null;
                    if (optionColors[trimmedOpt]) {
                      optColor = optionColors[trimmedOpt];
                    } else if (optionColors.get && optionColors.get(trimmedOpt)) {
                      optColor = optionColors.get(trimmedOpt);
                    } else {
                      const target = trimmedOpt.toLowerCase();
                      const keys = Object.keys(optionColors);
                      const match = keys.find(k => k.trim().toLowerCase() === target);
                      if (match) optColor = optionColors[match];
                    }
                    return (
                      <option
                        key={opt}
                        value={opt}
                      >
                        {opt}
                      </option>
                    );
                  })}
                </select>
                {col.hasDefaultValue && status?.status === "admin" && (
                  <button
                    type="button"
                    className="btn btn-link p-0 small"
                    title="View change history"
                    onClick={async (e) => {
                      e.stopPropagation();
                      setAuditModal({
                        isOpen: true,
                        columnName: col.column_heading,
                        auditData: [],
                        loading: true,
                      });
                      try {
                        const res = await fetch(
                          `${API_URL}/api/development/${row._id}/audit/${col.name}`,
                        );
                        const history = await res.json();
                        setAuditModal({
                          isOpen: true,
                          columnName: col.column_heading,
                          auditData: history,
                          loading: false,
                        });
                      } catch (err) {
                        console.error("Failed to load audit history", err);
                        setAuditModal({
                          isOpen: true,
                          columnName: col.column_heading,
                          auditData: [],
                          loading: false,
                        });
                      }
                    }}
                  >
                    <BsInfoCircleFill />

                  </button>
                )}
              </div>
            );
          }

          return (
            <input
              type={
                col.column_type === "date"
                  ? "date"
                  : col.column_type === "number"
                    ? "number"
                    : "text"
              }
              value={value}
              className="bg-transparent border-0 w-100 text-dark"
              onChange={(e) => handleChange(row._id, col.name, e.target.value)}
              disabled={!canEdit(col.name)}
            />
          );
        },
      })),
    ];
    return baseColumns;
  }, [
    columnsDef,
    data,
    isDelete,
    isFilterOpen,
    openFilterDropdown,
    filters,
    sortConfig,
    activeSuggestionField,
    clearFilters,
    hoveredRowIndex,
    status,
    valuesToMatch,
  ]);

  return (
    <section className="">
      <div className="d-flex align-items-center gap-2 justify-content-end mb-4">
        <button
          onClick={handleFilterClick}
          className={`btn ${isFilterOpen ? "btn-dark" : "btn-outline-dark"}`}
          title="Toggle Filters"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            style={{ width: "16px", height: "16px" }}
            xmlnsXlink="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15 10.5A3.502 3.502 0 0 0 18.355 8H21a1 1 0 1 0 0-2h-2.645a3.502 3.502 0 0 0-6.71 0H3a1 1 0 0 0 0 2h8.645A3.502 3.502 0 0 0 15 10.5zM3 16a1 1 0 1 0 0 2h2.145a3.502 3.502 0 0 0 6.71 0H21a1 1 0 1 0 0-2h-9.145a3.502 3.502 0 0 0-6.71 0H3z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </button>
        {status?.status === "admin" ? (
          <button
            onClick={handleColumnEditClick}
            className={`btn ${isDelete ? "btn-dark" : "btn-outline-dark"}`}
            title="Toggle Edit Mode"
          >
            <svg
              fill="currentColor"
              width="16"
              height="16"
              viewBox="0 0 528.899 528.899"
            >
              <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path>
            </svg>
          </button>
        ) : null}
        {status?.status === "admin" ? (
          <button className="btn btn-outline-dark" onClick={() => addRow()}>
            Create Row
          </button>
        ) : null}
        {status?.status === "admin" ? (
          <button
            className="btn btn-outline-dark"
            onClick={() => setIsColumnModalOpen(true)}
          >
            Create Column
          </button>
        ) : null}
        {/* {isDelete && (
                    <button
                        onClick={() => setIsDelete(false)}
                        className="btn btn-outline-danger"
                        title="Cancel Edit Mode"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaTimes size={16} />
                    </button>
                )} */}
      </div>

      <div className="row">
        <FilterSidebar
          ref={filterSidebarRef}
          filters={filters}
          isFilterOpen={isFilterOpen}
          status={status}
          handleFilterChange={handleFilterChange}
          handleChange={handleChange}
          onFilterSelect={handleFilterSelect}
          currentFilters={filters}
          userId={status?._id}
          clearFilters={clearFilters}
          setIsSaveFilterModalOpen={setIsSaveFilterModalOpen}
          handleDeleteFilter={handleDeleteFilter}
        />

        <div className="col-md-10 col-sm-8 main-tb">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="small">Loading ...</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredAndSortedData}
              onDragEnd={handleOnDragEnd}
            />
          )}
        </div>
      </div>
      <Form
        showColumnHeading={true}
        showDataType={true}
        showSortable={true}
        isPopupOpen={isColumnModalOpen}
        onPopupClose={() => setIsColumnModalOpen(false)}
        availableColumns={columnsDef}
        onPopupSave={async (newColumn) => {
          try {
            const res = await fetch(`${API_URL}/api/columns`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newColumn),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Failed to save column");
            }

            const saved = await res.json();
            setColumnsDef((prev) => [...prev, saved]);
            console.log("saved", saved);
            console.log("columnsDef", columnsDef);
          } catch (err) {
            console.error("Error saving column:", err);
            alert("Error saving column: " + err.message);
          }
        }}
      />

      {deleteConfirmation.isOpen && (
        <div
          className="delete-confirmation-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="delete-confirmation-modal"
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h4>Delete Column</h4>
            <p>
              Are you sure you want to delete the column "
              <strong>{deleteConfirmation.label}</strong>"?
            </p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button className="btn btn-danger me-2" onClick={confirmDelete}>
                Yes
              </button>
              <button className="btn btn-secondary" onClick={cancelDelete}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {auditModal.isOpen && (
        <div
          className="delete-confirmation-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() =>
            setAuditModal({ isOpen: false, columnName: "", auditData: [], loading: false })
          }
        >
          <div
            className="delete-confirmation-modal"
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Change History - {auditModal.columnName}</h4>
              <button
                className="btn btn-link p-0"
                onClick={() =>
                  setAuditModal({
                    isOpen: false,
                    columnName: "",
                    auditData: [],
                    loading: false,
                  })
                }
              >
                <FaTimes size={20} />
              </button>
            </div>
            {auditModal.loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : auditModal.auditData.length === 0 ? (
              <p className="text-muted text-center py-4">
                No changes recorded for this field.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Time</th>
                      <th>Old Value</th>
                      <th>New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditModal.auditData.map((audit, idx) => (
                      <tr key={idx}>
                        <td>{audit.changedByUserName || "Unknown"}</td>
                        <td>
                          {new Date(audit.changedAt).toLocaleString()}
                        </td>
                        <td>{audit.oldValue ?? "-"}</td>
                        <td>{audit.newValue ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setAuditModal({
                    isOpen: false,
                    columnName: "",
                    auditData: [],
                    loading: false,
                  })
                }
              >
                Close
              </button>
            </div> */}
          </div>
        </div>
      )}

      <ColorPickerModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        onSave={handleSaveOptions}
        columnHeading={selectedColorCol?.column_heading}
        options={selectedColorCol?.multipleValue || []}
        existingColors={selectedColorCol?.optionColors}
      />

      <SaveFilterModal
        isOpen={isSaveFilterModalOpen}
        onClose={() => setIsSaveFilterModalOpen(false)}
        onSave={handleSaveFilter}
        filters={filters}
        userStatus={status}
      />
    </section>
  );
}

export default TableColumns;
