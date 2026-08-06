import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LiaEditSolid, LiaFilterSolid, LiaSortUpSolid, LiaSortDownSolid, LiaUniversalAccessSolid, LiaSortSolid, LiaTrashRestoreAltSolid } from "react-icons/lia";
import Table from "./Table";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AddEntryModal from "./AddEntryModal";
import Form from "./Form";
import AnalyticsModal from "./AnalyticsModal";
import ExcelToJson from "./Excel";
import { IoCloseSharp } from "react-icons/io5";
import { RiLogoutCircleRLine } from "react-icons/ri";

import ToggleButtonIcon from "./toggle";
import SaveFilterModal from "./SaveFilterModal";
import FilterSidebar from "./FilterSidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EditColumnAccessModal from "./EditColumnAccessModal";
import { API_URL } from "../../proxy";
import { FaTimes, FaEdit } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import ColorPickerModal from "./ColorPickerModal";
import CustomSelectDropdown from "./CustomSelectDropdown";
import { IoMailUnreadSharp } from "react-icons/io5";

function TableColumns({ columnCollection, dataCollection, departmentKey, dataEndpoint, dataColumns }) {
  const filterSidebarRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const filtersRef = useRef(null);

  const [popupContent, setPopupContent] = useState('');

  const navigate = useNavigate();

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // SHow more filters
  const handleShowMore = () => {
    if (filtersRef.current) {
      filtersRef.current.scrollBy({
        left: 300, // Adjust scroll distance
        behavior: "smooth",
      });
    }
  };

  const handleShowLess = () => {
    filtersRef.current?.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  };

  const [isAtEnd, setIsAtEnd] = useState(false);

  const handleScroll = () => {
    const el = filtersRef.current;
    if (!el) return;

    setIsAtEnd(
      el.scrollLeft + el.clientWidth >= el.scrollWidth - 5
    );
  };

  // Drag‑and‑drop state for filter ordering (admin only)
  const [filterOrder, setFilterOrder] = useState([]);

  useEffect(() => {
    if (status?.status === 'admin') {
      const stored = localStorage.getItem('filterOrder');
      if (stored) setFilterOrder(JSON.parse(stored));
    }
  }, []);

  // Keep order in sync when savedFilters change (e.g., new filter added)


  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = reorder(filterOrder, result.source.index, result.destination.index);
    setFilterOrder(newOrder);
    localStorage.setItem('filterOrder', JSON.stringify(newOrder));
  };
  // end

  // Add Row
  const [isRowModel, setIsRowModel] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Locked fields
  const [lockedFields, setLockedFields] = useState([]);

  // Analytics Modal
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  // Upload file Mode;
  const [isUploadModelOpen, setIsUploadModelOpen] = useState(false);

  // Data FILTERED COUNT..
  const [filterCount, setFilterCount] = useState([]);

  const [showClearFilterButton, setShowClearFilterButton] = useState(false);

  // Set tasks of the mainproject
  const [tasks, setTasks] = useState([]);

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

  const [deleteRowConfirmation, setDeleteRowConfirmation] = useState({
    isOpen: false,
    rowId: null,
    label: "",
  });

  const [resetConfirmation, setResetConfirmation] = useState({
    isOpen: false,
  });

  const [editAccessModal, setEditAccessModal] = useState({
    isOpen: false,
    column: null,
  });

  // Sorting and filtering states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = useState(false);
  const [filterToEdit, setFilterToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [savedFilters, setSavedFilters] = useState([]);
  const [activeFilterId, setActiveFilterId] = useState(null);
  const [isFilterEditMode, setIsFilterEditMode] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteFilterConfirmation, setDeleteFilterConfirmation] = useState({
    isOpen: false,
    filterId: null,
    filterName: "",
  });

  // Keep order in sync when savedFilters change (e.g., new filter added)
  useEffect(() => {
    if (savedFilters.length) {
      const ids = savedFilters.map(f => f._id);
      setFilterOrder(prev => {
        const ordered = prev.filter(id => ids.includes(id));
        const missing = ids.filter(id => !ordered.includes(id));
        return [...ordered, ...missing];
      });
    }
  }, [savedFilters]);
  // Audit modal state
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    columnName: "",
    auditData: [],
    loading: false,
    createdInfo: null,
  });

  const [linkModal, setLinkModal] = useState({
    isOpen: false,
    rowId: null,
    colName: "",
    label: "",
    link: "",
  });

  const [mainProjectModal, setMainProjectModal] = useState({
    isOpen: false,
    rowId: null,
    colName: "",
    label: "",
    link: "",
  });

  const [loadingUpdater, setLoadingUpdater] = useState(false);
  const [resetDisabled, setResetDisabled] = useState(false);

  const [isResetLocked, setIsResetLocked] = useState(false);
  // const updateColumnDefaultValue = async () => {
  //   try {
  //     setLoadingUpdater(true);

  //     const response = await fetch(
  //       `${API_URL}/api/run-default-updater`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           collectionName: dataCollection,
  //         }),
  //       }
  //     );

  //     const data = await response.json();
  //     if (data.success) {
  //       // alert("✅ Default values updated successfully");
  //       setIsResetLocked(true); // Lock immediately in UI
  //       // Refresh the table data
  //       await fetchAll({ showSpinner: false });
  //     } else {
  //       alert("❌ Update failed");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("❌ Server error");
  //   } finally {
  //     setLoadingUpdater(false);
  //   }
  // };


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

  const getMainprojects = async (projectName) => {
    navigate(`/tasks?project=${encodeURIComponent(projectName)}`);
  };

  // Helper for overdue calculation
  const calculateOverdue = (dateStr, row, columnsDef) => {
    // Check if any column with "status" in its name or heading is set to "completed"
    if (row && columnsDef) {
      const statusCol = columnsDef.find(c =>
        c.column_heading.toLowerCase().includes("status") ||
        c.name.toLowerCase().includes("status")
      );
      if (statusCol) {
        const statusValue = String(row[statusCol.name] || "").trim().toLowerCase();
        if (statusValue === "completed") {
          return {
            text: "Completed",
            className: "overdue-block bg-success p-1 rounded text-white text-center",
          };
        }
      }
    }

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
    setShowClearFilterButton(true);
  };

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setShowClearFilterButton(false);
    setActiveFilterId(null);
    setIsFilterOpen(false);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Helper function to count active filters in a filter configuration
  const countActiveFilters = (filterData) => {
    if (!filterData) return 0;
    let count = 0;
    Object.keys(filterData).forEach(key => {
      const value = filterData[key];
      if (Array.isArray(value) && value.length > 0) {
        count++;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Date range object
        if (value.start || value.end) {
          count++;
        }
      } else if (value) {
        // String or number
        count++;
      }
    });
    return count;
  };

  // Helper function to count rows that match a filter
  const countMatchingRows = (filterData) => {
    if (!filterData || !data) return 0;

    let matchingCount = 0;
    data.forEach(row => {
      let rowMatches = true;

      Object.keys(filterData).forEach(key => {
        const filterValue = filterData[key];
        if (filterValue === undefined || filterValue === null) return;

        // Handle Date Range (object with start/end)
        if (typeof filterValue === "object" && !Array.isArray(filterValue)) {
          const { start, end } = filterValue;
          if (!start && !end) return;

          const cellValue = row[key];
          if (!cellValue) {
            rowMatches = false;
            return;
          }

          let rowDate;
          if (String(cellValue).includes("-")) {
            rowDate = new Date(cellValue);
          } else if (String(cellValue).includes("/")) {
            const [d, m, y] = String(cellValue).split("/");
            rowDate = new Date(`${y}-${m}-${d}`);
          } else {
            rowDate = new Date(cellValue);
          }

          if (isNaN(rowDate.getTime())) {
            rowMatches = false;
            return;
          }

          rowDate.setHours(0, 0, 0, 0);

          if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            if (!(rowDate >= startDate && rowDate <= endDate)) rowMatches = false;
          } else if (start) {
            const startDate = new Date(start);
            startDate.setHours(0, 0, 0, 0);
            if (!(rowDate >= startDate)) rowMatches = false;
          } else if (end) {
            const endDate = new Date(end);
            endDate.setHours(0, 0, 0, 0);
            if (!(rowDate <= endDate)) rowMatches = false;
          }
          return;
        }

        // Multi-select (array)
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0) return;
          const cellValue = String(row[key] ?? "").trim().toLowerCase();
          const matches = filterValue.some((fv) => {
            const fvLower = String(fv ?? "").trim().toLowerCase();
            return cellValue === fvLower || cellValue.startsWith(fvLower + " ");
          });
          if (!matches) rowMatches = false;
        } else {
          // String or number
          const filterStr = String(filterValue).toLowerCase();
          if (!filterStr) return;
          const cellValue = String(row[key] || "").toLowerCase();
          if (!cellValue.includes(filterStr)) rowMatches = false;
        }
      });

      if (rowMatches) matchingCount++;
    });

    return matchingCount;
  };

  // Save filter
  const handleSaveFilter = async (filterName, filterData, allowedUsers, filterId = null, showInAnalytics, showInDepartment = false) => {
    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user._id) {
        console.error("User data missing:", user);
        alert("User information not found. Please log in again.");
        return;
      }

      if (filterId) {
        // Update existing filter
        const response = await fetch(`${API_URL}/api/filters/${filterId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filterName,
            filterData,
            allowedUsers,
            department: departmentKey,
            showInAnalytics,
            showInDepartment,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        const updatedData = await response.json();

        // Update local state immediately
        setSavedFilters(prev => prev.map(f => f._id === filterId ? updatedData : f));

        // Update the sidebar list (simplest to just force a refresh or update the specific item)
        if (filterSidebarRef.current) {
          setRefreshTrigger(prev => prev + 1);
        }
      } else {
        // Create new filter
        const response = await fetch(`${API_URL}/api/filters`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            filterName,
            filterData,
            department: departmentKey,
            allowedUsers,
            showInAnalytics,
            showInDepartment,
          }),
        });

        // console.log("Filter save response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Filter save error response:", errorData);
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        const savedData = await response.json();

        if (savedData) {
          setSavedFilters(prev => [savedData, ...prev]);
          // Auto-apply if it's a new filter
          handleFilterSelect(savedData);
        }
      }

      setIsSaveFilterModalOpen(false);
      setFilterToEdit(null);
      // alert("Filter saved successfully!");
    } catch (err) {
      console.error("Error saving filter:", err);
      alert(`Failed to save filter: ${err.message}`);
    }
  };

  const handleFilterSelect = (filter) => {
    if (activeFilterId === filter._id) {
      clearFilters();
      return;
    }

    setShowClearFilterButton(true);

    if (filter && filter.filterData) {
      setFilters(filter.filterData);
      setActiveFilterId(filter._id);

      // ✅ ONLY set filter name in URL
      const slugify = (text) =>
        text
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")      // spaces → -
          .replace(/[^a-z0-9-]/g, ""); // remove special chars

      const params = new URLSearchParams();
      params.set("filter_name", slugify(filter.filterName));

      setSearchParams(params, { replace: true });
    }
  };


  // Delete saved filter
  const handleDeleteFilter = (filterId, filterName, e) => {
    if (e) e.stopPropagation();
    setDeleteFilterConfirmation({
      isOpen: true,
      filterId,
      filterName,
    });
  };

  const confirmDeleteFilter = async () => {
    const { filterId } = deleteFilterConfirmation;
    if (!filterId) return;

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

      setSavedFilters((prev) => prev.filter((f) => f._id !== filterId));
      setDeleteFilterConfirmation({ isOpen: false, filterId: null, filterName: "" });
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

      // Handle Date Range (object with start/end)
      if (typeof filterValue === "object" && !Array.isArray(filterValue)) {
        const { start, end } = filterValue;
        if (!start && !end) return;

        processedData = processedData.filter((row) => {
          const cellValue = row[key];
          if (!cellValue) return false;

          // Row date parsing (handle YYYY-MM-DD and DD/MM/YYYY)
          let rowDate;
          if (String(cellValue).includes("-")) {
            rowDate = new Date(cellValue);
          } else if (String(cellValue).includes("/")) {
            const [d, m, y] = String(cellValue).split("/");
            rowDate = new Date(`${y}-${m}-${d}`);
          } else {
            rowDate = new Date(cellValue);
          }

          if (isNaN(rowDate.getTime())) return false;

          rowDate.setHours(0, 0, 0, 0);

          if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            return rowDate >= startDate && rowDate <= endDate;
          } else if (start) {
            const startDate = new Date(start);
            startDate.setHours(0, 0, 0, 0);
            return rowDate >= startDate;
          } else if (end) {
            const endDate = new Date(end);
            endDate.setHours(0, 0, 0, 0);
            return rowDate <= endDate;
          }
          return true;
        });
        return;
      }

      // Multi-select (array): row matches if its value is in the selected list
      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) return;
        processedData = processedData.filter((row) => {
          const cellValue = String(row[key] ?? "").trim().toLowerCase();
          return filterValue.some((fv) => {
            const fvLower = String(fv ?? "").trim().toLowerCase();
            return cellValue === fvLower || cellValue.startsWith(fvLower + " ");
          });
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
    setFilterCount(processedData.length);

    // Apply sorting
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        const col = columnsDef.find((c) => c.name === sortConfig.key);
        if (col && col.column_type === "monthYear") {
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          const getVal = (val) => {
            const parts = String(val).split(" ");
            if (parts.length < 2) return 0;
            const monthIdx = months.indexOf(parts[0]);
            const year = parseInt(parts[1]);
            return year * 100 + monthIdx;
          };
          const scoreA = getVal(aValue);
          const scoreB = getVal(bValue);
          return sortConfig.direction === "asc"
            ? scoreA - scoreB
            : scoreB - scoreA;
        }

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

  const fetchAll = useCallback(async ({ showSpinner } = { showSpinner: true }) => {
    try {
      if (showSpinner && isMounted.current) setLoading(true);

      const [columnsRes, devRes] = await Promise.all([
        fetch(`${API_URL}${dataColumns}`),
        fetch(`${API_URL}${dataEndpoint}`),
      ]);

      if (!columnsRes.ok) throw new Error("Failed to fetch columns");
      if (!devRes.ok) throw new Error("Failed to fetch development data");

      const [cols, dev] = await Promise.all([
        columnsRes.json(),
        devRes.json(),
      ]);

      if (!isMounted.current) return;
      setColumnsDef(cols);
      setData(dev);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      if (showSpinner && isMounted.current) setLoading(false);
    }
  }, [API_URL, dataColumns, dataEndpoint]);

  const mainProjectId = columnsDef?.find(c => c.showInMainProject)?.name;
  const taskNameId = columnsDef?.find(col => col.isMatched === true)?.name;

  useEffect(() => {
    // initial load
    fetchAll({ showSpinner: true });

    // auto-refresh so 24h backend changes appear without manual refresh
    const refreshInterval = setInterval(() => {
      fetchAll({ showSpinner: false });
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchAll]);

  const fetchSavedFilters = useCallback(async () => {
    if (!status?._id) return;
    try {
      const url = `${API_URL}/api/filters?userId=${status._id}${departmentKey ? `&department=${departmentKey}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch filters');
      const data = await response.json();
      setSavedFilters(data);
    } catch (err) {
      console.error('Failed to load saved filters:', err);
    }
  }, [status?._id]);

  useEffect(() => {
    fetchSavedFilters();
  }, [fetchSavedFilters, refreshTrigger]);

  // Apply saved filter from URL when page loads
  useEffect(() => {
    const filterId = searchParams.get("filter");
    const filterNameSlug = searchParams.get("filter_name");

    if ((!filterId && !filterNameSlug) || savedFilters.length === 0) return;

    let saved = null;

    const slugify = (text) =>
      text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    if (filterId) {
      saved = savedFilters.find((f) => f._id === filterId);
    } else if (filterNameSlug) {
      saved = savedFilters.find((f) => slugify(f.filterName) === filterNameSlug);
    }

    if (saved && saved.filterData) {
      setFilters(saved.filterData);
      setActiveFilterId(saved._id);
      setShowClearFilterButton(true);
    }
  }, [searchParams, savedFilters]);
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const updateTimeoutRef = useRef({});

  const handleBlur = async (rowId, field, value) => {
    if (field !== mainProjectId) return;
    // console.log("field", field);
    // console.log("mainProjectId", mainProjectId);

    if (!value || value.trim() === "") return;

    const projectName = data.find(r => r._id === rowId)?.[mainProjectId];
    const taskName = data.find(r => r._id === rowId)?.[taskNameId];
    try {
      const res = await fetch(`${API_URL}/api/mainProject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: rowId,
          projectName: projectName,
          taskName: taskName,
          taskDepartment: dataCollection
        }),
      });

      if (res.ok) {
        const responseData = await res.json();
        const mainProjectList = responseData.data;
        if (mainProjectList && mainProjectList.length > 0) {
          const mainProjectEntry = mainProjectList[0];
          const newMainProjectId = mainProjectEntry._id;

          const tasksToUpdate = mainProjectEntry.tasks || [];

          // Use PUT to update all tasks of this newly created entry (since PATCH /:id might not exist)
          for (const task of tasksToUpdate) {
            fetch(`${API_URL}/api/data/${task.rowId}?collectionName=${dataCollection}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mainProjectId: newMainProjectId }),
            });
          }

          // Update local state to reflect the new mainProjectId for all related tasks
          setData(prevData => {
            const updatedData = [...prevData];
            tasksToUpdate.forEach(task => {
              const rowIndex = updatedData.findIndex(r => r._id === task.rowId);
              if (rowIndex > -1) {
                updatedData[rowIndex] = { ...updatedData[rowIndex], mainProjectId: newMainProjectId };
              }
            });
            return updatedData;
          });
        }
      }
    } catch (err) {
      console.error("MainProject sync failed", err);
    }
  }

  /* ---------------- UPDATE CELL ---------------- */
  const handleChange = (rowId, field, value) => {
    // Update local UI state immediately
    setData((prev) =>
      prev.map((row) => (row._id === rowId ? { ...row, [field]: value } : row)),
    );

    const timeoutKey = `${rowId}-${field}`;
    if (updateTimeoutRef.current[timeoutKey]) {
      clearTimeout(updateTimeoutRef.current[timeoutKey]);
    }

    updateTimeoutRef.current[timeoutKey] = setTimeout(() => {
      let changedByUserName = "Unknown";
      let changedByUserId = null;
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          changedByUserName = parsed.user_name || parsed.email || "Unknown";
          changedByUserId = parsed.email || null;
        }
      } catch (e) { }
      setData(prevData => {
        const latestRow = prevData.find(r => r._id === rowId);
        if (latestRow) {
          fetch(`${API_URL}/api/data/${rowId}?collectionName=${dataCollection}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...latestRow,
              changedByUserName,
              changedByUserId,
            }),
          }).then(response => {
            if (response.ok) {
              window.dispatchEvent(new CustomEvent('dataUpdated'));
            }
          });
        }
        return prevData;
      });

      delete updateTimeoutRef.current[timeoutKey];
    }, 1000); // 1 second debounce
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Prevent dragging the "#" column (index 0) or dragging into its position
    if (source.index === 0 || destination.index === 0) return;
    if (source.index === destination.index) return;

    const items = Array.from(columnsDef);
    // Keep original for reverting on failure
    const originalItems = Array.from(columnsDef);

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
      const res = await fetch(`${API_URL}/api/columns/reorder/update?collectionName=${columnCollection}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnOrders }),
      });

      if (!res.ok) {
        throw new Error("Failed to save column order");
      }

      const result = await res.json();
      // console.log("Column order saved successfully:", result);
    } catch (err) {
      console.error("Error saving column order:", err);
      // Revert to original state on failure
      setColumnsDef(originalItems);
      alert("Failed to save column order. Changes have been reverted.");
    }
  };

  const handleSaveOptions = async ({ multipleValue, optionColors, optionTextColors }) => {
    if (!selectedColorCol) return;

    try {
      const res = await fetch(`${API_URL}/api/columns/${selectedColorCol.name}/options?collectionName=${columnCollection}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multipleValue, optionColors, optionTextColors }),
      });

      if (!res.ok) throw new Error("Failed to save column options");

      setColumnsDef((prev) =>
        prev.map((col) =>
          col.name === selectedColorCol.name
            ? { ...col, multipleValue, optionColors, optionTextColors }
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

    try {
      const response = await fetch(
        `${API_URL}/api/data/deactivate/${rowId}?collectionName=${dataCollection}`,
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

  const confirmDeleteRow = async () => {
    const { rowId } = deleteRowConfirmation;
    if (rowId) {
      await deleteRow(rowId);
      setDeleteRowConfirmation({ isOpen: false, rowId: null, label: "" });
    }
  };

  const cancelDeleteRow = () => {
    setDeleteRowConfirmation({ isOpen: false, rowId: null, label: "" });
  };

  const handleSaveColumnAccess = async (columnName, { access, viewAccess, column_heading, sorting, equalPrefix, morePrefix, lessPrefix, showInfo, sticky, showYear, isMatched, rowpopup_column, showInMainProject }) => {
    try {
      const body = { access, viewAccess, sorting, equalPrefix, morePrefix, lessPrefix, showInfo, sticky, showYear, isMatched, rowpopup_column, showInMainProject };
      if (column_heading !== undefined) body.column_heading = column_heading;
      const res = await fetch(
        `${API_URL}/api/columns/${columnName}/access?collectionName=${columnCollection}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      // console.log("url for testing", `${API_URL}/api/columns/${columnName}/access?collectionName=${columnCollection}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update column");
      }
      const updated = await res.json();
      setColumnsDef((prev) =>
        prev.map((col) =>
          col.name === columnName
            ? {
              ...col,
              access: updated.access,
              viewAccess: updated.viewAccess,
              sorting: updated.sorting,
              equalPrefix: updated.equalPrefix,
              morePrefix: updated.morePrefix,
              lessPrefix: updated.lessPrefix,
              showInfo: updated.showInfo,
              sticky: updated.sticky,
              rowpopup_column: updated.rowpopup_column,
              showInMainProject: updated.showInMainProject,
              showYear: updated.showYear,
              isMatched: updated.isMatched,
              ...(updated.column_heading && { column_heading: updated.column_heading }),
            }
            : col
        )
      );
      setEditAccessModal({ isOpen: false, column: null });
    } catch (err) {
      console.error("Error updating column:", err);
      alert("Error: " + err.message);
    }
  };

  const confirmDelete = async () => {
    const { accessor } = deleteConfirmation;
    try {
      const res = await fetch(`${API_URL}/api/columns/deactivate/${accessor}?collectionName=${columnCollection}`, {
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
    setIsRowModel(true);
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

  // Define allowed columns for staff
  const valuesToMatch = useMemo(() => {
    if (!status?.column_access) return [];
    return status.column_access
      .split(",")
      .map((item) => item.trim().toLowerCase());
  }, [status]);

  // Check if user can edit this column
  const canEdit = (columnName, column) => {
    if (!status) return false;
    if (status.status === "admin") return true;
    if (status.status === "staff") {
      // If column has explicit access list, check if user is in it
      const col = column || columnsDef.find((c) => c.name === columnName);
      if (col?.access && Array.isArray(col.access) && col.access.length > 0) {
        const userIdStr = String(status._id);
        return col.access.some((id) => String(id) === userIdStr);
      }
      // Fallback: legacy column_access on user (comma-separated column names)
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
      const res = await fetch(`${API_URL}/api/columns/${oldName}?collectionName=${columnCollection}`, {
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

  const handleShowRowInfo = async (row) => {
    setAuditModal({
      isOpen: true,
      columnName: "Row Details",
      auditData: [],
      loading: true,
      createdInfo: {
        name: row.createdByUserName || "Mandasa Admin",
        time: row.createdAt
      }
    });

    try {
      const res = await fetch(`${API_URL}/api/audit`);
      if (!res.ok) throw new Error("Failed to fetch audit history");
      const data = await res.json();
      setAuditModal(prev => ({
        ...prev,
        auditData: data,
        loading: false
      }));
    } catch (err) {
      console.error("Failed to fetch row audit:", err);
      setAuditModal(prev => ({ ...prev, loading: false }));
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteRowConfirmation({
                        isOpen: true,
                        rowId: row._id,
                        label: row.project || row.client || "this row",
                      });
                    }}
                    className=" btn btn-link text-danger p-0"
                    type="button"
                  >
                    <LiaTrashRestoreAltSolid className="delete-icon" />
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
      ...columnsDef.filter(col => {
        // Hide Info column from non-admins
        if (status?.status !== 'admin' && (col.name === 'row_info' || col.column_heading === 'Info')) {
          return false;
        }

        // Hide columns from users who are in the viewAccess restriction list
        // Admin can always see all columns
        if (status?.status !== 'admin' && Array.isArray(col.viewAccess) && col.viewAccess.length > 0) {
          const currentUserId = String(status?._id || '');
          if (col.viewAccess.some(id => String(id) === currentUserId)) {
            return false; // Hide this column from current user
          }
        }

        return true;
      }).map((col) => ({
        header: (
          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <input
                  key={`col-header-${col.name}-${col.column_heading}`}
                  defaultValue={col.column_heading}
                  className="header-edit-input flex-grow-1 text-dark"
                  {...(status.status === "admin"
                    ? {
                      onBlur: (e) => handleRename(col.name, e.target.value),
                      onKeyDown: (e) => e.key === "Enter" && e.target.blur(),
                    }
                    : { readOnly: true })}
                />
                {col.sorting && (
                  <button
                    className="btn btn-link p-0 text-dark"
                    onClick={() => requestSort(col.name)}
                    title={`Sort by ${col.column_heading}`}
                  >
                    {sortConfig.key === col.name
                      ? sortConfig.direction === "asc"
                        ? (<LiaSortSolid />)
                        : (<LiaSortSolid />)
                      : (<LiaSortSolid />
                      )}
                  </button>
                )}
                {status.status === "admin" && (
                  <button
                    className="btn btn-link p-0 text-dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditAccessModal({ isOpen: true, column: col });
                    }}
                    title="Edit column access"
                  >
                    <LiaUniversalAccessSolid />
                  </button>
                )}
              </div>
              {isDelete && (
                <button
                  className="btn btn-link text-danger p-0"
                  onClick={() => handleDeleteClick(col)}
                  title="Deactivate Column"
                >
                  <LiaTrashRestoreAltSolid className="delete-icon" />
                </button>
              )}
              {/* EDIT COLORS OPTION */}
              {/* {isDelete && col.column_type === "select" && (
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
              )} */}
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
                  ) : col.column_type === "date" ? (
                    <div className="d-flex flex-row gap-1">
                      <div className="d-flex flex-column">
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#666' }}>From:</span>
                        <input
                          type="date"
                          className="form-control form-control-sm text-dark p-1"
                          style={{ fontSize: '10px' }}
                          value={filters[col.name]?.start || ""}
                          onChange={(e) =>
                            handleFilterChange(col.name, {
                              ...filters[col.name],
                              start: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="d-flex flex-column">
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#666' }}>To:</span>
                        <input
                          type="date"
                          className="form-control form-control-sm text-dark p-1"
                          style={{ fontSize: '10px' }}
                          value={filters[col.name]?.end || ""}
                          onChange={(e) =>
                            handleFilterChange(col.name, {
                              ...filters[col.name],
                              end: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type={col.column_type === "number" ? "number" : "text"}
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
                    (col.column_type === "date" && (filters[col.name]?.start || filters[col.name]?.end)) ||
                    (col.column_type !== "select" && col.column_type !== "date" && filters[col.name])) && (
                      <button
                        type="button"
                        className="filter-clear-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange(
                            col.name,
                            col.column_type === "select" ? [] : col.column_type === "date" ? {} : ""
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
        sticky: col.sticky,
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
              const optionTextColors = col.optionTextColors || {};
              let textColor = getContrastYIQ(optionColor);
              // Use custom text color if provided
              if (optionTextColors[value]) {
                textColor = optionTextColors[value];
              } else if (optionTextColors.get && optionTextColors.get(value)) {
                textColor = optionTextColors.get(value);
              } else {
                const target = value.toLowerCase();
                const keys = Object.keys(optionTextColors);
                const match = keys.find(k => k.trim().toLowerCase() === target);
                if (match) textColor = optionTextColors[match];
              }
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
            const overdueInfo = calculateOverdue(endDateValue, row, columnsDef);
            return (
              <div className="d-flex align-items-center gap-1">
                <div className={overdueInfo.className}>{overdueInfo.text}</div>
                {status.status === "admin" &&
                  (col.showInfo || (col.hasDefaultValue)) && (
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
                            `${API_URL}/api/data/${row._id}/audit/${col.name}?collectionName=${dataCollection}`,
                          );
                          if (!res.ok) throw new Error("Failed to fetch history");
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
                      <BsInfoCircleFill style={{ color: "#2563eb" }} />
                    </button>
                  )}
              </div>
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

              const statusCol = columnsDef.find(c =>
                c.column_heading.toLowerCase().includes("status") ||
                c.name.toLowerCase().includes("status")
              );
              const statusValue = statusCol ? String(row[statusCol.name] || "").trim().toLowerCase() : "";

              let dayClass =
                diffDays > 0
                  ? "days-positive" // future
                  : diffDays < 0
                    ? "days-negative" // overdue
                    : "days-zero"; // today

              let displayText = "";

              // Check for completed status in condition column too

              if (statusValue === "completed") {
                displayText = "Completed";
                dayClass = "days-completed";
              } else if (statusValue === "archived") {
                displayText = "Archived";
                dayClass = "days-completed";
              } else if (diffDays === 0) {
                displayText = col.equalPrefix || "Deadline Today";
              } else if (diffDays > 0) {
                const prefix = col.morePrefix || "Deadline in";
                displayText = `${prefix} ${Math.abs(diffDays)} days`;
              } else {
                const prefix = col.lessPrefix || "Overdue by";
                displayText = `${prefix} ${Math.abs(diffDays)} days`;
              }

              return (
                <div className="d-flex align-items-center gap-1">
                  <span className={dayClass}>{displayText}</span>
                  {status.status === "admin" &&
                    (col.showInfo || (col.hasDefaultValue)) && (
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
                              `${API_URL}/api/data/${row._id}/audit/${col.name}?collectionName=${dataCollection}`,
                            );
                            if (!res.ok) throw new Error("Failed to fetch history");
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
                        <BsInfoCircleFill style={{ color: "#2563eb" }} />
                      </button>
                    )}
                </div>
              );
            } catch (err) {
              return <span className="text-muted">Error</span>;
            }
          }

          if (col.column_type === "monthYear") {
            const rowValue = value || "";
            let selectedDate = null;
            if (rowValue) {
              const dateStr = `1 ${rowValue}`; // e.g. "1 January 2026"
              const parsed = new Date(dateStr);
              if (!isNaN(parsed.getTime())) {
                selectedDate = parsed;
                // setSelectedDate(parsed);
              }
            }

            return (
              <div className="d-flex align-items-center gap-1" style={{ minWidth: "140px" }}>
                {<DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    if (date) {
                      const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];
                      const month = monthNames[date.getMonth()];
                      const year = date.getFullYear();
                      const newValue = `${month} ${year}`;
                      handleChange(row._id, col.name, newValue);
                    } else {
                      handleChange(row._id, col.name, "");
                    }
                  }}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  className="form-control form-control-sm border-0 shadow-none bg-transparent p-0"
                  wrapperClassName="w-100"
                  placeholderText="Select Month Year"
                  disabled={!canEdit(col.name, col)}
                />}

                {status.status === "admin" &&
                  (col.showInfo || col.hasDefaultValue) && (
                    <button
                      type="button"
                      className="btn btn-link p-0 small ms-1"
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
                            `${API_URL}/api/data/${row._id}/audit/${col.name}?collectionName=${dataCollection}`,
                          );
                          if (!res.ok)
                            throw new Error("Failed to fetch history");
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
                      <BsInfoCircleFill style={{ color: "#2563eb" }} />
                    </button>
                  )}
              </div>
            );
          }

          if (col.column_type === "link") {
            let linkData = { label: "", link: "" };
            try {
              if (value && typeof value === "string") {
                if (value.startsWith("{")) {
                  linkData = JSON.parse(value);
                } else {
                  linkData = { label: value, link: value };
                }
              } else if (value && typeof value === "object") {
                linkData = value;
              }
            } catch (e) {
              linkData = { label: value, link: value };
            }

            const isEmpty = !linkData.label && !linkData.link;

            return (
              <div style={{ position: "relative" }} className="d-flex align-items-center justify-content-between w-100 gap-2 px-2">
                {isEmpty ? (
                  <span
                    className="text-muted cursor-pointer flex-grow-1"
                    style={{ fontSize: "12px", fontStyle: "italic" }}
                    disabled={status.status === "admin" ? false : true}
                  // onClick={() =>
                  //   setLinkModal({
                  //     isOpen: true,
                  //     rowId: row._id,
                  //     colName: col.name,
                  //     label: "",
                  //     link: "",
                  //   })
                  // }
                  >
                    Add Link
                  </span>
                ) : (
                  <button
                    type="button"
                    // disabled={status.status === "admin" ? false : true}
                    className="btn btn-link p-0 text-primary text-truncate flex-grow-1 text-start"
                    style={{ fontSize: "13px", textDecoration: "none", maxWidth: "calc(100% - 20px)" }}

                    onClick={() => {
                      if (linkData.link) {
                        const url =
                          linkData.link.startsWith("http") ||
                            linkData.link.startsWith("//")
                            ? linkData.link
                            : `https://${linkData.link}`;
                        window.open(url, "_blank");
                      }
                    }}
                  >
                    {linkData.label || linkData.link}
                  </button>
                )}
                {canEdit(col.name, col) && (
                  <button
                    className="btn btn-link p-0 text-muted lmebtn__ct"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLinkModal({
                        isOpen: true,
                        rowId: row._id,
                        colName: col.name,
                        label: linkData.label || "",
                        link: linkData.link || "",
                      });
                    }}
                  >
                    <LiaEditSolid />
                  </button>
                )}
              </div>
            );
          }
          if (col.column_type === "select") {
            const rowValue = value || "";
            let displayMonth = rowValue;
            let displayYear = new Date().getFullYear();

            if (col.showYear && rowValue) {
              const parts = String(rowValue).split(" ");
              if (parts.length > 1) {
                displayMonth = parts[0];
                displayYear = parts[1];
              }
            }

            const isMatched = col.isMatched;

            const trimmedValue = displayMonth.toString().trim();
            const optionColors = col.optionColors || {};
            const optionTextColors = col.optionTextColors || {};

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

            let textColor = getContrastYIQ(optionColor);
            if (optionColor) {
              if (optionTextColors[trimmedValue]) {
                textColor = optionTextColors[trimmedValue];
              } else if (optionTextColors.get && optionTextColors.get(trimmedValue)) {
                textColor = optionTextColors.get(trimmedValue);
              } else {
                const target = trimmedValue.toLowerCase();
                const keys = Object.keys(optionTextColors);
                const match = keys.find(k => k.trim().toLowerCase() === target);
                if (match) textColor = optionTextColors[match];
              }
            }

            return (
              <div className="d-flex align-items-center gap-1">
                <CustomSelectDropdown
                  value={displayMonth}
                  options={col.multipleValue || []}
                  onChange={(newMonth) => {
                    const newValue = col.showYear ? `${newMonth} ${displayYear}` : newMonth;
                    handleChange(row._id, col.name, newValue);
                  }}
                  disabled={!canEdit(col.name, col)}
                  optionColors={optionColors}
                  optionTextColors={optionTextColors}
                  getContrastYIQ={getContrastYIQ}
                  onEditColors={() => {
                    setSelectedColorCol(col);
                    setIsColorModalOpen(true);
                  }}
                  showEditButton={status?.status === "admin"}
                />
                {col.showYear && (
                  <input
                    type="number"
                    value={displayYear}
                    onChange={(e) => {
                      const newYear = e.target.value;
                      const newValue = `${displayMonth} ${newYear}`;
                      handleChange(row._id, col.name, newValue);
                    }}
                    className="form-control form-control-sm bg-transparent border shadow-none text-dark"
                    style={{ width: '65px', fontSize: '13px', padding: '2px 4px' }}
                    disabled={!canEdit(col.name, col)}
                  />
                )}
                {status.status === "admin" &&
                  (col.showInfo || (col.hasDefaultValue)) && (
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
                            `${API_URL}/api/data/${row._id}/audit/${col.name}?collectionName=${dataCollection}`,
                          );
                          if (!res.ok) throw new Error("Failed to fetch history");
                          const history = await res.json();
                          // console.log("history", history);

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
                      <BsInfoCircleFill style={{ color: "#2563eb" }} />
                    </button>
                  )}
              </div>
            );
          }

          return (
            <div className="d-flex align-items-center gap-1">
              {col.name === mainProjectId ? (
                <>
                  <input
                    type={
                      col.column_type === "date"
                        ? "date"
                        : col.column_type === "number"
                          ? "number"
                          : "text"
                    }
                    value={value}
                    data-column={col.name}
                    data-row={row._id}
                    className="bg-transparent border-0 w-100 text-dark"
                    onChange={(e) => handleChange(row._id, col.name, e.target.value)}
                    onBlur={(e) => {
                      setLockedFields(prev => ({ ...prev, [`${row._id}_${col.name}_locked`]: true }));
                      handleBlur(row._id, col.name, e.target.value);
                    }}
                    onFocus={() => {
                      if (!value || value.trim() === "") {
                        setLockedFields(prev => ({ ...prev, [`${row._id}_${col.name}_typing`]: true }));
                      }
                    }}
                    disabled={
                      !canEdit(col.name, col) ||
                      lockedFields[`${row._id}_${col.name}_locked`] ||
                      (value !== "" && !lockedFields[`${row._id}_${col.name}_typing`])
                    }
                  />
                  {/* <button
                    type="button"
                    className="btn project___mainproject"
                    title={`Main project ${value}`}
                    onClick={() => getMainprojects(value)}
                  >
                    <RiLogoutCircleRLine />
                  </button> */}
                  <button
                    type="button"
                    className="btn project___mainproject"
                    title={`Edit main project ${value}`}
                    onClick={() =>
                      setMainProjectModal({
                        isOpen: true,
                        rowId: row._id,
                        colName: col.name,
                        label: value || ""
                      })
                    }
                  >
                    <LiaEditSolid />
                  </button>
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
                  value={value}
                  data-column={col.name}
                  data-row={row._id}
                  className="bg-transparent border-0 w-100 text-dark"
                  onChange={(e) => handleChange(row._id, col.name, e.target.value)}
                  disabled={!canEdit(col.name, col)}
                />
              )
              }
              {
                status.status === "admin" &&
                (col.showInfo || (col.hasDefaultValue)) && (
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
                          `${API_URL}/api/data/${row._id}/audit/${col.name}?collectionName=${dataCollection}`,
                        );
                        // console.log("res", res);
                        if (!res.ok) throw new Error("Failed to fetch history");
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
                    <BsInfoCircleFill style={{ color: "#2563eb" }} />
                  </button>
                )
              }
            </div >
          );
        },
      })),
      ...(status?.status === "admin"
        ? [
          {
            header: (
              <div
                className="d-flex flex-column gap-2 align-items-center"
                style={{ minWidth: "auto" }}
              >
                <span>Info</span>
              </div>
            ),
            accessor: "row_info_column",
            render: (row) => (
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-link p-0 text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowRowInfo(row);
                  }}
                  title="View Row Details & History"
                >
                  <BsInfoCircleFill size={16} />
                </button>
              </div>
            ),
          },
        ]
        : []),
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

  const visibleFilters = savedFilters.filter(f => !f.showInAnalytics);


  return (
    <div className="container pt-5">
      <div className="icons__new d-flex align-items-center gap-2 justify-content-end mb-4">
        {status?.status !== 'staff' ? (
          <button
            onClick={handleFilterClick}
            className={`btn ${isFilterOpen ? "btn-dark" : "btn-outline-dark"} d-inline-flex align-items-center`}
            title="Toggle Filters"
            style={{ height: "40px" }}
          >
            <LiaFilterSolid />
          </button>
        ) : null}
        {status?.status === "admin" ? (
          <button
            onClick={handleColumnEditClick}
            className={`btn d-inline-flex align-items-center ${isDelete ? "btn-dark" : "btn-outline-dark"}`}
            title="Toggle Edit Mode"
            style={{ height: "40px" }}
          >
            <LiaEditSolid />
          </button>
        ) : null}
        {status?.status === "admin" && savedFilters.length > 0 && (
          <button
            className={`btn d-inline-flex align-items-center ${isFilterEditMode ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setIsFilterEditMode(prev => !prev)}
            title={isFilterEditMode ? "Exit edit mode" : "Edit filter order"}
            style={{ height: "40px" }}
          >
            <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M9.5 8C10.3284 8 11 7.32843 11 6.5C11 5.67157 10.3284 5 9.5 5C8.67157 5 8 5.67157 8 6.5C8 7.32843 8.67157 8 9.5 8ZM9.5 14C10.3284 14 11 13.3284 11 12.5C11 11.6716 10.3284 11 9.5 11C8.67157 11 8 11.6716 8 12.5C8 13.3284 8.67157 14 9.5 14ZM11 18.5C11 19.3284 10.3284 20 9.5 20C8.67157 20 8 19.3284 8 18.5C8 17.6716 8.67157 17 9.5 17C10.3284 17 11 17.6716 11 18.5ZM15.5 8C16.3284 8 17 7.32843 17 6.5C17 5.67157 16.3284 5 15.5 5C14.6716 5 14 5.67157 14 6.5C14 7.32843 14.6716 8 15.5 8ZM17 12.5C17 13.3284 16.3284 14 15.5 14C14.6716 14 14 13.3284 14 12.5C14 11.6716 14.6716 11 15.5 11C16.3284 11 17 11.6716 17 12.5ZM15.5 20C16.3284 20 17 19.3284 17 18.5C17 17.6716 16.3284 17 15.5 17C14.6716 17 14 17.6716 14 18.5C14 19.3284 14.6716 20 15.5 20Z" fill="#121923"></path> </g></svg>
          </button>
        )}

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
        {/* {status?.user_name === 'Mandasa Technologies' && !isResetLocked && (
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => setResetConfirmation({ isOpen: true })}
            disabled={loadingUpdater}
          >
            {loadingUpdater ? "Updating..." : "Reset"}
          </button>
        )} */}
        {/* <div>
          {status?.status === 'admin' && (
            <button
              type="button"
              className="btn btn-outline-danger"
              disabled={resetDisabled}
              onClick={() => setResetConfirmation({ isOpen: true })}
            >
              Reset
            </button>
          )}
        </div> */}
        {status?.status === "admin" ? (
          <button
            className="btn btn-outline-dark"
            onClick={() => setIsAnalyticsModalOpen(true)}
          >
            Analytics
          </button>
        )
          : null}

        {status?.status === "admin" ? (
          <button
            className="btn btn-outline-dark"
            onClick={() => setIsUploadModelOpen(true)}
          >
            Upload file
          </button>
        )
          : null}
        {isUploadModelOpen &&
          (
            <ExcelToJson isUploadModelOpen={isUploadModelOpen} setIsUploadModelOpen={setIsUploadModelOpen} columns={columnsDef} columnCollection={columnCollection} dataCollection={dataCollection}
              data={filteredAndSortedData} setData={setData} dataEndpoint={dataEndpoint} API_URL={API_URL} />
          )}
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

      <div className="">
        <div className="">
          <div className="saved-filters-row w-100 mb-3">
            <div className="row flex-nowrap w-100 align-items-center">
              <div ref={filtersRef}
                onScroll={handleScroll} className={`${status?.status === 'staff' ? "col-9" : "col-8" } filters-list-horizontal align-items-center`}>
                {status?.status === 'staff' ? (
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
                ) : null}
                {savedFilters.length > 0 ? (
                  isFilterEditMode && status.status === "admin" ?  (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="filters" direction="horizontal">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="filters-drag-container filters-list-horizontal align-items-center"
                          >
                            {filterOrder.map((id, index) => {
                              const filter = savedFilters.find(f => f._id === id);
                              if (!filter) return null;
                              return (
                                <Draggable key={filter._id} draggableId={filter._id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`filter-item ${activeFilterId === filter._id ? 'active' : ''}`}
                                      onClick={() => { if (!isFilterEditMode) handleFilterSelect(filter); }}
                                      title="Click to toggle (apply/deactivate)"
                                    >
                                      <span className="filter-name">
                                        {filter.filterName}{" "}
                                        <span className="">({countMatchingRows(filter.filterData)})</span>
                                      </span>
                                      {status.status === "admin" && (
                                        <div className="filter-actions-group">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setFilterToEdit(filter); setIsSaveFilterModalOpen(true); }}
                                            className="edit-filter-btn"
                                          >
                                            <LiaEditSolid />
                                          </button>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteFilter(filter._id, filter.filterName, e); }}
                                            className="delete-filter-btn text-danger"
                                          >
                                            <LiaTrashRestoreAltSolid />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <div
                      className="filters-drag-container filters-list-horizontal align-items-center"
                    >
                      {filterOrder.map((id) => {
                        const filter = savedFilters.find(f => f._id === id);
                        if (!filter) return null;
                        return (
                          <div
                            key={filter._id}
                            className={`filter-item ${activeFilterId === filter._id ? 'active' : ''}`}
                            onClick={() => handleFilterSelect(filter)}
                            title="Click to toggle (apply/deactivate)"
                          >
                            <span className="filter-name">
                              {filter.filterName}{" "}
                              <span className="">({countMatchingRows(filter.filterData)})</span>
                            </span>
                            {status.status === "admin" && (
                              <div className="filter-actions-group">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setFilterToEdit(filter); setIsSaveFilterModalOpen(true); }}
                                  className="edit-filter-btn"
                                >
                                  <LiaEditSolid />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteFilter(filter._id, filter.filterName, e); }}
                                  className="delete-filter-btn text-danger"
                                >
                                  <LiaTrashRestoreAltSolid />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : null}
              </div>
              {visibleFilters.length > 4 && (
                <div className="col-1">
                  {!isAtEnd ? (
                    <button className="link_button" onClick={handleShowMore}>Show More +</button>
                  ) : (
                    <button className="link_button" onClick={handleShowLess}>Show Less</button>
                  )}
                </div>
              )}
              <div className={`filters-actions col-3 d-flex gap-2 justify-content-end align-items-center`}>
                {status?.status === 'admin' && isFilterOpen && (
                  <button
                    onClick={() => setIsSaveFilterModalOpen(true)}
                    className="btn save_as btn-sm"
                    title="Save current filter configuration"
                  >
                    Save As
                  </button>
                )}
                {showClearFilterButton && (
                  <button
                    onClick={clearFilters}
                    className="btn clear_all btn-sm"
                    title="Clear all active filters"
                  >
                    Clear All
                  </button>
                )}
                <span className="filter-count" style={{ fontSize: '14px' }}><b>{filterCount} Projects</b></span>
              </div>
            </div>
          </div>
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
      <EditColumnAccessModal
        isOpen={editAccessModal.isOpen}
        onClose={() => setEditAccessModal({ isOpen: false, column: null })}
        column={editAccessModal.column}
        showSortable={true}
        availableUsers={userData}
        onSave={handleSaveColumnAccess}
      />

      <Form
        showColumnHeading={true}
        showDataType={true}
        showSortable={true}
        isPopupOpen={isColumnModalOpen}
        onPopupClose={() => setIsColumnModalOpen(false)}
        availableColumns={columnsDef}
        availableUsers={userData}
        onPopupSave={async (newColumn) => {
          try {
            const res = await fetch(`${API_URL}${dataColumns}`, {
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
            // console.log("saved", saved);
            // console.log("columnsDef", columnsDef);
          } catch (err) {
            console.error("Error saving column:", err);
            alert("Error saving column: " + err.message);
          }
        }}
      />

      {
        deleteConfirmation.isOpen && (
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
        )
      }

      {
        deleteRowConfirmation.isOpen && (
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
              <h4>Delete Row</h4>
              <p>
                Are you sure you want to delete{" "}
                {deleteRowConfirmation.label ? (
                  <>
                    "<strong>{deleteRowConfirmation.label}</strong>"?
                  </>
                ) : (
                  "this row?"
                )}
              </p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-danger me-2" onClick={confirmDeleteRow}>
                  Yes
                </button>
                <button className="btn btn-secondary" onClick={cancelDeleteRow}>
                  No
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        deleteFilterConfirmation.isOpen && (
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
              <h4>Delete Filter</h4>
              <p>
                Are you sure you want to delete the filter "
                <strong>{deleteFilterConfirmation.filterName}</strong>"?
              </p>
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button className="btn btn-danger me-2" onClick={confirmDeleteFilter}>
                  Yes
                </button>
                <button className="btn btn-secondary" onClick={() => setDeleteFilterConfirmation({ isOpen: false, filterId: null, filterName: "" })}>
                  No
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Audit History Modal */}
      {
        auditModal.isOpen && (
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
              className="delete-confirmation-modal info_popup_custom"
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
                <h4 className="mb-0">{auditModal.columnName}</h4>
                <button
                  className="btn btn-link p-0"
                  onClick={() =>
                    setAuditModal({
                      isOpen: false,
                      columnName: "",
                      auditData: [],
                      loading: false,
                      createdInfo: null
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
              ) : (
                <div className="d-flex flex-column gap-3">
                  {auditModal.createdInfo && (
                    <div className="d-flex align-items-center gap-2 justify-content-between p-3 bg-light rounded border">
                      {/* <h6 className="mb-2 fw-bold">Creation Details</h6> */}
                      <div className="d-flex gap-2">
                        <span className="fs-14 letter-spacing_ct">Created By:</span>
                        <span className="fw-bold fs-14">{auditModal.createdInfo.name}</span>
                      </div>
                      <div className="d-flex gap-2">
                        <span className="fs-14 letter-spacing_ct">Created At:</span>
                        <span className="fw-bold fs-14">{auditModal.createdInfo.time ? new Date(auditModal.createdInfo.time).toLocaleString() : "Unknown"}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h6 className="mb-3 fw-bold">Change History</h6>
                    {auditModal.auditData.length === 0 ? (
                      <p className="text-muted text-center py-2 border rounded">
                        No changes recorded.
                      </p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Time</th>
                              <th>New Value</th>
                              <th>Old Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditModal.auditData.map((audit, idx) => (
                              <tr key={idx}>
                                <td>{audit.changedByUserName || "Unknown"}</td>
                                <td>{new Date(audit.changedAt).toLocaleString()}</td>
                                <td>
                                  {audit.newValue === "" ? (
                                    <em className="text-muted">Empty</em>
                                  ) : (
                                    audit.newValue ?? "-"
                                  )}
                                </td>
                                <td>
                                  {audit.oldValue === "" ? (
                                    <em className="text-muted">Empty</em>
                                  ) : (
                                    audit.oldValue ?? "-"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      // <div className="d-flex flex-column gap-2">
                      //   {auditModal.auditData.map((audit, idx) => (
                      //     <div key={idx} className="custom__button">
                      //       <span>{audit.changedByUserName || "Unknown"} has changed {audit.oldValue === "" ? (
                      //         <em className="text-muted">Empty</em>
                      //       ) : (
                      //         audit.oldValue ?? "-"
                      //       )} to {audit.newValue === "" ? (
                      //         <em className="text-muted">Empty</em>
                      //       ) : (
                      //         audit.newValue ?? "-"
                      //       )} at {new Date(audit.changedAt).toLocaleString()}
                      //       </span>
                      //     </div>
                      //   ))}
                      // </div>
                    )}
                  </div>
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
        )
      }

      <ColorPickerModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        onSave={handleSaveOptions}
        columnHeading={selectedColorCol?.column_heading}
        options={selectedColorCol?.multipleValue || []}
        existingColors={selectedColorCol?.optionColors}
        existingTextColors={selectedColorCol?.optionTextColors}
      />

      <AddEntryModal selectedDate={selectedDate} canEdit={canEdit} isRowModel={isRowModel} columnsDef={columnsDef} data={data}
        onSave={async (newRowData) => {
          setSortConfig({ key: null, direction: "asc" });
          setFilters({});

          try {
            const newRow = { ...newRowData };

            // Calculate derived defaults (Month, Status, Start Date)
            const monthNames = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currentMonthIndex = new Date().getMonth();
            const currentMonthName = monthNames[currentMonthIndex];
            const todayDate = new Date().toISOString().split('T')[0];

            columnsDef.forEach((col) => {
              if (!newRow.hasOwnProperty(col.name)) {
                // Check for specific columns by heading to set dynamic defaults
                const heading = (col.column_heading || "").toLowerCase().trim();

                if (heading === "status") {
                  newRow[col.name] = "Not started";
                } else if (heading === "start date") {
                  newRow[col.name] = todayDate;
                } else if (col.column_type === "monthYear") {
                  const currentYear = new Date().getFullYear();
                  const monthNamesFull = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ];
                  const currentMonthFull = monthNamesFull[new Date().getMonth()];
                  newRow[col.name] = `${currentMonthFull} ${currentYear}`;
                } else if (heading === "month") {
                  const currentYear = new Date().getFullYear();
                  newRow[col.name] = col.showYear ? `${currentMonthName} ${currentYear}` : currentMonthName;
                } else {
                  // Use the column's configured default value if available
                  newRow[col.name] = (col.hasDefaultValue && col.defaultValue) ? col.defaultValue : "";
                }
              }
            });

            let createdByUserName = "Unknown";
            let createdByUserId = null;
            try {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                const parsed = JSON.parse(storedUser);
                createdByUserName = parsed.user_name || parsed.email || "Unknown";
                createdByUserId = parsed.email || null;
              }
            } catch (e) {
              // ignore
            }

            const res = await fetch(`${API_URL}${dataEndpoint}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...newRow,
                createdByUserId,
                createdByUserName
              }),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Failed to add row");
            }
            const saved = await res.json();

            // console.log("New row data", newRow);
            const projectName = newRow[mainProjectId];
            const taskName = newRow[taskNameId];
            // console.log("projectName", projectName);
            if (projectName) {
              const mpRes = await fetch(`${API_URL}/api/mainProject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  projectId: saved._id,        // row id
                  projectName: projectName,    // matched value
                  taskName: taskName,        // optional
                  taskDepartment: dataCollection
                }),
              });

              if (mpRes.ok) {
                const responseData = await mpRes.json();
                const mainProjectList = responseData.data;
                if (mainProjectList && mainProjectList.length > 0) {
                  const newMainProjectId = mainProjectList[0]._id;
                  saved.mainProjectId = newMainProjectId;

                  // Update the row with its new mainProjectId
                  await fetch(`${API_URL}/api/data/${saved._id}?collectionName=${dataCollection}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mainProjectId: newMainProjectId }),
                  });
                }
              }
            }
            // Add new row to the top of the list
            setData((prev) => [saved, ...prev]);
            setIsRowModel(false); // Close modal after saving
            setShowPopup(true);
            setPopupContent("Project added");
            setTimeout(() => setShowPopup(false), 10000);
          } catch (err) {
            console.error("Error adding row:", err);
            alert("Error adding row: " + err.message);
          }
        }} onClose={() => setIsRowModel(false)} />

      <SaveFilterModal
        isOpen={isSaveFilterModalOpen}
        onClose={() => {
          setIsSaveFilterModalOpen(false);
          setFilterToEdit(null);
        }}
        onSave={handleSaveFilter}
        filters={filters}
        userStatus={status}
        editFilter={filterToEdit}
      />
      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        filters={savedFilters}
        onApplyFilter={handleFilterSelect}
        onEdit={(filter) => {
          setFilterToEdit(filter);
          setIsSaveFilterModalOpen(true);
        }}
        onDelete={handleDeleteFilter}
        userStatus={status}
      />

      {/* {
        resetConfirmation.isOpen && (
          <div
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
              zIndex: 1060,
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
              <h5 className="mb-3">Confirm Reset</h5>
              <p className="mb-4">
                Are you sure you want to reset columns to their default values?
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  className="btn btn-outline-secondary" style={{ background: "transparent", color: "black" }}
                  onClick={() => setResetConfirmation({ isOpen: false })}
                >
                  No
                </button>
                <button
                  className="btn btn-secondary" style={{ background: "red", color: "white" }}
                  disabled={loadingUpdater}
                  onClick={() => {
                    setResetConfirmation({ isOpen: false });
                    updateColumnDefaultValue();
                  }}
                >
                  {loadingUpdater ? "Updating..." : "Yes"}
                </button>
              </div>
            </div>
          </div>
        )
      } */}
      {/* Main task edit popup */}
      {
        mainProjectModal.isOpen && (
          <div
            className="modal-overlay"
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
              zIndex: 1100,
            }}
            onClick={() => setMainProjectModal((prev) => ({ ...prev, isOpen: false }))}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "12px",
                width: "400px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Edit Label</h5>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setMainProjectModal((prev) => ({ ...prev, isOpen: false }))}
                ><IoCloseSharp /></button>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Project Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={mainProjectModal.label}
                  onChange={(e) =>
                    setMainProjectModal((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-light px-4"
                  onClick={() => setMainProjectModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={async () => {
                    const newName = mainProjectModal.label?.trim();
                    if (!newName) return;
                    // console.log("roelid", mainProjectModal.rowId);
                    try {
                      const res = await fetch(`${API_URL}/api/mainProject/update-by-row/${mainProjectModal.rowId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ projectName: newName })
                      });

                      if (res.ok) {
                        const dataRes = await res.json();
                        const tasks = dataRes.project?.tasks || [];
                        setData(prev => {
                          const updated = [...prev];
                          tasks.forEach(t => {
                            const idx = updated.findIndex(r => r._id === String(t.rowId));
                            if (idx > -1) {
                              updated[idx] = { ...updated[idx], [mainProjectModal.colName]: newName };
                              fetch(`${API_URL}/api/data/${t.rowId}?collectionName=${dataCollection}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ [mainProjectModal.colName]: newName })
                              });
                            }
                          });
                          return updated;
                        });
                      }
                    } catch (e) {
                      console.error("Project rename failed", e);
                    }
                    setShowPopup(true);
                    setPopupContent("Project name has been renamed");
                    setTimeout(() => setShowPopup(false), 10000);
                    setMainProjectModal(prev => ({ ...prev, isOpen: false }));
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Link Edit Modal */}
      {
        linkModal.isOpen && (
          <div
            className="modal-overlay"
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
              zIndex: 1100,
            }}
            onClick={() => setLinkModal((prev) => ({ ...prev, isOpen: false }))}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "12px",
                width: "400px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">Edit Link</h5>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setLinkModal((prev) => ({ ...prev, isOpen: false }))}
                ><IoCloseSharp /></button>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Label</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter label (e.g. Website)"
                  value={linkModal.label}
                  onChange={(e) =>
                    setLinkModal((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Link URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter URL (e.g. google.com)"
                  value={linkModal.link}
                  onChange={(e) =>
                    setLinkModal((prev) => ({ ...prev, link: e.target.value }))
                  }
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-light px-4"
                  onClick={() => setLinkModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={() => {
                    const payload = JSON.stringify({
                      label: linkModal.label.trim(),
                      link: linkModal.link.trim(),
                    });
                    handleChange(linkModal.rowId, linkModal.colName, payload);
                    setLinkModal((prev) => ({ ...prev, isOpen: false }));
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )
      }
      {
        showPopup && (
          <div className="sticky-bar" id="bar"> <span>{popupContent}</span> <button onClick={(e) => { setShowPopup(false) }}>✕</button> </div>
        )
      }

    </div>

  );
}

export default TableColumns;