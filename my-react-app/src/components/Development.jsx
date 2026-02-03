// import { useEffect, useState, useMemo, useCallback, useRef } from "react";
// import Table from "./Table";
// import AddEntryModal from "./AddEntryModal";
// import Form from "./Form";
// import ToggleButtonIcon from "./toggle";
// import SaveFilterModal from "./SaveFilterModal";
// import FilterSidebar from "./FilterSidebar";
// import { API_URL } from "../../proxy";
// import { FaTrash, FaTimes } from "react-icons/fa";

// function TableColumns() {

//     // Create a ref for FilterSidebar
//     const filterSidebarRef = useRef(null);

//     // Column states
//     const [columnsDef, setColumnsDef] = useState([]);

//     // Data states (row)
//     const [data, setData] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

//     const [loading, setLoading] = useState(false);
//     // Column delete states
//     const [isDelete, setIsDelete] = useState(false);
//     const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, accessor: '', label: '', isDynamic: false });

//     // Sorting and filtering states
//     const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
//     const [filters, setFilters] = useState({});
//     const [activeSuggestionField, setActiveSuggestionField] = useState(null);
//     const [isFilterOpen, setIsFilterOpen] = useState(false);
//     const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = useState(false);

//     // hover delete row icon
//     const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

//     // Get data user
//     const [status, setStatus] = useState(() => {
//         // Get the item from localStorage
//         const savedData = localStorage.getItem('user');

//         // Parse it or return null if it doesn't exist
//         return savedData ? JSON.parse(savedData) : null;
//     });
//     // Handle column delete
//     const handleColumnEditClick = () => {
//         setIsDelete(!isDelete);
//     };

//     // Helper for overdue calculation
//     const calculateOverdue = (dateStr) => {
//         if (!dateStr) return { text: "No Date", className: "overdue-block deadline-green text-center" };

//         let year, month, day;
//         if (dateStr.includes('-')) {
//             // Assume YYYY-MM-DD (standard date input)
//             [year, month, day] = dateStr.split('-');
//         } else if (dateStr.includes('/')) {
//             // Assume DD/MM/YYYY
//             [day, month, year] = dateStr.split('/');
//         } else {
//             return { text: dateStr, className: "overdue-block deadline-green text-center" };
//         }

//         if (!day || !month || !year) {
//             return { text: dateStr, className: "overdue-block deadline-green text-center" };
//         }

//         const targetDate = new Date(`${year}-${month}-${day}`);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         targetDate.setHours(0, 0, 0, 0);

//         const diffTime = targetDate - today;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//         if (diffDays < 0) {
//             return {
//                 text: `Overdue by ${Math.abs(diffDays)} days`,
//                 className: "overdue-block bg-danger p-1 rounded text-white text-center"
//             };
//         } else if (diffDays === 0) {
//             return {
//                 text: `Deadline Today`,
//                 className: "overdue-block bg-warning p-1 rounded text-dark text-center"
//             };
//         } else {
//             return {
//                 text: `Deadline in ${diffDays} days`,
//                 className: "overdue-block bg-success p-1 rounded text-white text-center"
//             };
//         }
//     };

//     // Handle filter
//     const handleFilterClick = () => {
//         setIsFilterOpen(!isFilterOpen);
//     };

//     const handleFilterChange = useCallback((field, value) => {
//         setFilters(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     }, []);

//     const clearFilters = useCallback(() => {
//         setFilters({});
//         setIsFilterOpen(false);
//     }, []);

//     // Save filter
//     const handleSaveFilter = async (filterName, filterData) => {
//         try {
//             const userData = localStorage.getItem('user');
//             const user = userData ? JSON.parse(userData) : null;

//             if (!user || !user._id) {
//                 console.error('User data missing:', user);
//                 alert('User information not found. Please log in again.');
//                 return;
//             }

//             console.log('Saving filter with data:', { userId: user._id, filterName, filterData });

//             const response = await fetch(`${API_URL}/api/filters`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     userId: user._id,
//                     filterName,
//                     filterData
//                 })
//             });

//             console.log('Filter save response status:', response.status);

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 console.error('Filter save error response:', errorData);
//                 throw new Error(errorData.message || `HTTP Error: ${response.status}`);
//             }

//             const savedData = await response.json();
//             console.log('Filter saved successfully:', savedData);

//             // Add the new filter to the sidebar immediately
//             if (filterSidebarRef.current) {
//                 filterSidebarRef.current.addNewFilterToList(savedData);
//             }

//             setIsSaveFilterModalOpen(false);
//             alert('Filter saved successfully!');
//         } catch (err) {
//             console.error('Error saving filter:', err);
//             alert(`Failed to save filter: ${err.message}`);
//         }
//     };

//     // Apply saved filter
//     const handleFilterSelect = (filterData) => {
//         setFilters(filterData);
//         setIsFilterOpen(true);
//     };

//     // Delete saved filter
//     const handleDeleteFilter = async (filterId, e) => {
//         if (e) e.stopPropagation();

//         try {
//             const response = await fetch(`${API_URL}/api/filters/${filterId}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete filter');
//             }

//             // Update the sidebar to remove the deleted filter
//             if (filterSidebarRef.current && filterSidebarRef.current.removeFilterFromList) {
//                 filterSidebarRef.current.removeFilterFromList(filterId);
//             }

//             alert('Filter deleted successfully!');
//         } catch (err) {
//             console.error('Error deleting filter:', err);
//             alert(`Failed to delete filter: ${err.message}`);
//         }
//     };

//     const requestSort = (key) => {
//         let direction = 'asc';
//         if (sortConfig.key === key && sortConfig.direction === 'asc') {
//             direction = 'desc';
//         }
//         setSortConfig({ key, direction });
//     };

//     const filteredAndSortedData = useMemo(() => {
//         let processedData = [...data];

//         // Apply filters
//         Object.keys(filters).forEach(key => {
//             const filterValue = filters[key]?.toLowerCase();
//             if (filterValue) {
//                 processedData = processedData.filter(row => {
//                     const cellValue = String(row[key] || "").toLowerCase();
//                     return cellValue.includes(filterValue);
//                 });
//             }
//         });

//         // Apply sorting
//         if (sortConfig.key) {
//             processedData.sort((a, b) => {
//                 const aValue = a[sortConfig.key] || "";
//                 const bValue = b[sortConfig.key] || "";

//                 if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//                 if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//                 return 0;
//             });
//         }

//         return processedData;
//     }, [data, filters, sortConfig]);
//     useEffect(() => {
//         setLoading(true);
//         fetch(`${API_URL}/api/columns`)
//             .then(res => {
//                 if (!res.ok) throw new Error("Failed to fetch columns");
//                 return res.json();
//             })
//             .then(setColumnsDef)
//             .finally(() => setLoading(false))
//             .catch(err => console.error("Error loading columns:", err));

//         fetch(`${API_URL}/api/development`)
//             .then(res => {
//                 if (!res.ok) throw new Error("Failed to fetch development data");
//                 return res.json();
//             })
//             .then(setData)
//             .finally(() => setLoading(false))
//             .catch(err => console.error("Error loading data:", err));
//     }, []);

//     /* ---------------- UPDATE CELL ---------------- */
//     const handleChange = (rowId, field, value) => {
//         setData(prev => prev.map(row =>
//             row._id === rowId ? { ...row, [field]: value } : row
//         ));

//         const rowToUpdate = data.find(r => r._id === rowId);
//         if (rowToUpdate) {
//             fetch(`${API_URL}/api/development/${rowId}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ ...rowToUpdate, [field]: value })
//             });
//         }
//     };

//     const handleDeleteClick = (col) => {
//         setDeleteConfirmation({
//             isOpen: true,
//             accessor: col.name,
//             label: col.column_heading,
//             isDynamic: true
//         });
//     };

//     const deleteRow = async (rowId, e) => {
//         if (e) e.stopPropagation();

//         const rowIdStr = String(rowId);
//         const itemToDelete = data.find(row => String(row._id) === rowIdStr);

//         if (!itemToDelete) return;

//         // Optimistic update
//         const previousData = [...data];
//         setData(prev => prev.filter(row => String(row._id) !== rowIdStr));

//         console.log(data);
//         console.log(rowId);
//         try {
//             const response = await fetch(`${API_URL}/api/development/deactivate/${rowId}`, {
//                 method: "PATCH"
//             });

//             if (!response.ok) {
//                 console.error("Failed to deactivate row in database");
//                 setData(data);
//             }
//         } catch (error) {
//             console.error("Network error:", error);
//             setData(data);
//         }
//     }

//     const confirmDelete = async () => {
//         const { accessor } = deleteConfirmation;
//         try {
//             const res = await fetch(`${API_URL}/api/columns/deactivate/${accessor}`, {
//                 method: "PATCH"
//             });

//             if (!res.ok) throw new Error("Failed to deactivate column");

//             setColumnsDef(prev => prev.filter(col => col.name !== accessor));
//             setDeleteConfirmation({ isOpen: false, accessor: '', label: '', isDynamic: false });
//         } catch (err) {
//             console.error("Deactivation failed:", err);
//             alert("Error: " + err.message);
//         }
//     };

//     const cancelDelete = () => {
//         setDeleteConfirmation({ isOpen: false, accessor: '', label: '', isDynamic: false });
//     };

//     /* ---------------- ADD ROW ---------------- */
//     const addRow = async (newRowData) => {
//         // Clear sorting and filters to ensure new row is visible at bottom
//         setSortConfig({ key: null, direction: 'asc' });
//         setFilters({});

//         try {
//             const newRow = { ...newRowData };
//             columnsDef.forEach(col => {
//                 if (!newRow.hasOwnProperty(col.name)) {
//                     newRow[col.name] = "";
//                 }
//             });

//             const res = await fetch(`${API_URL}/api/development`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(newRow)
//             });

//             if (!res.ok) {
//                 const errorData = await res.json();
//                 throw new Error(errorData.error || "Failed to add row");
//             }

//             const saved = await res.json();
//             setData(prev => [...prev, saved]);
//             setIsModalOpen(false); // Close modal after saving

//             // Scroll to bottom
//             const tableWrap = document.querySelector('.table-wrap');
//             if (tableWrap) {
//                 tableWrap.scrollTop = tableWrap.scrollHeight;
//             }
//         } catch (err) {
//             console.error("Error adding row:", err);
//             alert("Error adding row: " + err.message);
//         }
//     };

//     const [userData, setUserData] = useState([]);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const response = await fetch(`${API_URL}/api/user`);
//                 const data = await response.json();
//                 setUserData(data);
//             } catch (err) {
//                 console.error("Failed to fetch users:", err);
//             }
//         };
//         fetchUsers();
//     }, []);

//     const [columnAccess, setColumnAccess] = useState([]);

//     const handleColumnAccess = async (columnName) => {
//         // try {
//         //     const response = await fetch(`${aPI_URL}/api/user/column-access`, {
//         //         method: "PATCH",
//         //         headers: {
//         //             "Content-Type": "application/json",
//         //         },
//         //         body: JSON.stringify({ columnName }),
//         //     });

//         //     if (response.ok) {
//         //         const data = await response.json();
//         //         console.log(data.message);
//         //         alert(`Access for "${columnName}" granted to all staff`);
//         //     } else {
//         //         console.error("Failed to update column access");
//         //     }
//         // } catch (err) {
//         //     console.error("Error updating column access:", err);
//         // }
//     }

//     // Define allowed columns for staff
//     const valuesToMatch = useMemo(() => {
//         if (!status?.column_access) return [];
//         return status.column_access.split(',').map(item => item.trim().toLowerCase());
//     }, [status]);

//     // Check if user can edit this column
//     const canEdit = (columnName) => {
//         if (!status) return false;
//         if (status.status === 'admin') return true;
//         if (status.status === 'staff') {
//             return valuesToMatch.includes(columnName.toLowerCase());
//         }
//         return false;
//     };

//     /* ---------------- RENAME COLUMN ---------------- */
//     const handleRename = async (oldName, newName) => {
//         if (!newName || oldName === newName) return;
//         const trimmedNewName = newName.trim();
//         if (!trimmedNewName || oldName === trimmedNewName) return;

//         try {
//             const res = await fetch(`${API_URL}/api/columns/${oldName}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ newHeading: trimmedNewName })
//             });

//             if (!res.ok) throw new Error("Failed to rename column heading");

//             setColumnsDef(prev =>
//                 prev.map(col =>
//                     col.name === oldName ? { ...col, column_heading: trimmedNewName } : col
//                 )
//             );
//         } catch (err) {
//             console.error("Column rename failed:", err);
//             alert("Rename failed: " + err.message);
//         }
//     };

//     /* ---------------- DYNAMIC COLUMNS ---------------- */
//     const columns = useMemo(() => {
//         const baseColumns = [
//             {
//                 header: (
//                     <div className="d-flex flex-column gap-2 align-items-center">
//                     </div>
//                 ),
//                 accessor: "index",
//                 render: (row, rowIndex) => (
//                     columnsDef.length > 1 ? (
//                         <div className="row_index" onMouseEnter={() => setHoveredRowIndex(rowIndex)}
//                             onMouseLeave={() => setHoveredRowIndex(null)}>
//                             {status.status === 'admin' ? (
//                                 hoveredRowIndex === rowIndex ? (
//                                     <button onClick={(e) => deleteRow(row._id, e)} className=" btn btn-link text-danger p-0" type="button">
//                                         <FaTrash className="delete-icon" size={14} />
//                                     </button>
//                                 ) : (
//                                     <span>{rowIndex + 1}</span>
//                                 )
//                             ) : (
//                                 <span>{rowIndex + 1}</span>
//                             )}
//                         </div>
//                     ) : null
//                 )
//             },
//             ...columnsDef.map(col => ({
//                 header: (
//                     <div className="d-flex flex-column gap-2">
//                         <div className="d-flex align-items-center justify-content-between gap-2">
//                             <div className="d-flex align-items-center gap-2 flex-grow-1">
//                                 <input
//                                     defaultValue={col.column_heading}
//                                     className="header-edit-input flex-grow-1 text-dark"
//                                     {...(status.status === 'admin' ? {
//                                         onBlur: (e) => handleRename(col.name, e.target.value),
//                                         onKeyDown: (e) => e.key === "Enter" && e.target.blur()
//                                     } : { readOnly: true })}
//                                 />
//                                 {/* {status.status === 'admin' && (
//                                     // <button type="button" onClick={() => handleColumnAccess(col.name)}>
//                                     //     Toggle
//                                     // </button>
//                                 )} */}
//                                 {col.sorting && (
//                                     <button
//                                         className="btn btn-link p-0 text-dark"
//                                         onClick={() => requestSort(col.name)}
//                                         title={`Sort by ${col.column_heading}`}
//                                     >
//                                         {sortConfig.key === col.name ? (
//                                             sortConfig.direction === 'asc' ? '↑' : '↓'
//                                         ) : '↕'}
//                                     </button>
//                                 )}
//                             </div>
//                             {isDelete && (
//                                 <button
//                                     className="btn btn-link text-danger p-0"
//                                     onClick={() => handleDeleteClick(col)}
//                                     title="Deactivate Column"
//                                 >
//                                     <FaTrash className="delete-icon" size={14} />
//                                 </button>
//                             )}
//                         </div>
//                         {isFilterOpen && col.sorting && (
//                             <div className="filter-row-input">
//                                 <div className="filter-input-wrapper">
//                                     {col.column_type === 'select' ? (
//                                         <select
//                                             className="form-control form-control-sm text-dark"
//                                             value={filters[col.name] || ""}
//                                             onChange={(e) => handleFilterChange(col.name, e.target.value)}
//                                         >
//                                             <option value="">All</option>
//                                             {(col.multipleValue || []).map(opt => (
//                                                 <option key={opt} value={opt}>{opt}</option>
//                                             ))}
//                                         </select>
//                                     ) : (
//                                         <input
//                                             type={col.column_type === 'date' ? 'date' : col.column_type === 'number' ? 'number' : 'text'}
//                                             className="form-control form-control-sm text-dark"
//                                             placeholder={`Filter ${col.column_heading}...`}
//                                             value={filters[col.name] || ""}
//                                             onChange={(e) => handleFilterChange(col.name, e.target.value)}
//                                         />
//                                     )}
//                                     {filters[col.name] && (
//                                         <button
//                                             type="button"
//                                             className="filter-clear-btn"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleFilterChange(col.name, "");
//                                             }}
//                                             title="Clear filter"
//                                         >
//                                             <FaTimes size={12} />
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         )
//                         }
//                     </div >
//                 ),
//                 accessor: col.name,
//                 render: (row) => {
//                     const value = row[col.name] || "";

//                     // Special handling for Overdue column

//                     if (col.name === 'overdue' || col.column_heading.toLowerCase() === 'overdue') {
//                         const endDateValue = row['end_date'] || row['endDate'] || "";
//                         const overdueInfo = calculateOverdue(endDateValue);
//                         return <div className={overdueInfo.className}>{overdueInfo.text}</div>;
//                     }

//                     if (col.column_type === "select") {
//                         return (
//                             <select
//                                 value={value}
//                                 className="bg-transparent border-0 w-100 text-dark"
//                                 onChange={(e) =>
//                                     handleChange(row._id, col.name, e.target.value)
//                                 }
//                                 disabled={!canEdit(col.name, col)}
//                             >
//                                 <option value="">Select</option>
//                                 {(col.multipleValue || []).map(opt => (
//                                     <option key={opt} value={opt}>{opt}</option>
//                                 ))}
//                             </select>
//                         );
//                     }

//                     return (
//                         <input
//                             type={col.column_type === 'date' ? 'date' : col.column_type === 'number' ? 'number' : 'text'}
//                             value={value}
//                             className="bg-transparent border-0 w-100 text-dark"
//                             onChange={(e) =>
//                                 handleChange(row._id, col.name, e.target.value)
//                             }
//                             disabled={!canEdit(col.name, col)}
//                         />
//                     );
//                 }
//             }))
//         ];
//         return baseColumns;
//     }, [columnsDef, data, isDelete, isFilterOpen, filters, sortConfig, activeSuggestionField, clearFilters, hoveredRowIndex, status, valuesToMatch]);

//     return (
//         <section className="">
//             <div className='d-flex align-items-center gap-2 justify-content-end mb-4'>
//                 <button
//                     onClick={handleFilterClick}
//                     className={`btn ${isFilterOpen ? 'btn-dark' : 'btn-outline-dark'}`}
//                     title="Toggle Filters"
//                 >
//                     <svg viewBox="0 0 24 24" fill="none" style={{width: '16px', height: '16px'}} xmlnsXlink="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fillRule="evenodd" clipRule="evenodd" d="M15 10.5A3.502 3.502 0 0 0 18.355 8H21a1 1 0 1 0 0-2h-2.645a3.502 3.502 0 0 0-6.71 0H3a1 1 0 0 0 0 2h8.645A3.502 3.502 0 0 0 15 10.5zM3 16a1 1 0 1 0 0 2h2.145a3.502 3.502 0 0 0 6.71 0H21a1 1 0 1 0 0-2h-9.145a3.502 3.502 0 0 0-6.71 0H3z" fill="currentColor"></path></g></svg>
//                 </button>
//                 {status?.status === 'admin' ? (
//                     <button
//                         onClick={handleColumnEditClick}
//                         className={`btn ${isDelete ? 'btn-dark' : 'btn-outline-dark'}`}
//                         title="Toggle Edit Mode"
//                     >
//                         <svg fill="currentColor" width="16" height="16" viewBox="0 0 528.899 528.899"><path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path></svg>
//                     </button>
//                 ) : null}
//                 {status?.status === 'admin' ? (
//                     <button
//                         className="btn btn-outline-dark"
//                         onClick={() => addRow()}
//                     >
//                         Create Row
//                     </button>
//                 ) : null}
//                 {status?.status === 'admin' ? (
//                     <button
//                         className="btn btn-outline-dark"
//                         onClick={() => setIsColumnModalOpen(true)}
//                     >
//                         Create Column
//                     </button>
//                 ) : null}
//                 {/* {isDelete && (
//                     <button
//                         onClick={() => setIsDelete(false)}
//                         className="btn btn-outline-danger"
//                         title="Cancel Edit Mode"
//                         style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                     >
//                         <FaTimes size={16} />
//                     </button>
//                 )} */}
//             </div>

// <div className="row">
//             <FilterSidebar
//                 ref={filterSidebarRef}
//                 filters={filters}
//                 isOpen={isFilterOpen}
//                 status={status}
//                 handleFilterChange={handleFilterChange}
//                 handleChange={handleChange}
//                 onFilterSelect={handleFilterSelect}
//                 currentFilters={filters}
//                 userId={status?._id}
//                 clearFilters={clearFilters}
//                 setIsSaveFilterModalOpen={setIsSaveFilterModalOpen}
//                 handleDeleteFilter={handleDeleteFilter}
//             />

//             <div className="col-md-10 col-sm-8">
//                 {loading ? (
//                         <div className="loading-spinner">
//                             <div className="spinner"></div>
//                             <p className="small">Loading ...</p>
//                         </div>
//                     ) :
//                 <Table columns={columns} data={filteredAndSortedData} />
//             }
//             </div>
// </div>
//             <Form
//                 showColumnHeading={true} showDataType={true} showSortable={true}
//                 isPopupOpen={isColumnModalOpen}
//                 onPopupClose={() => setIsColumnModalOpen(false)}
//                 onPopupSave={async (newColumn) => {
//                     try {
//                         const res = await fetch(`${API_URL}/api/columns`, {
//                             method: "POST",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify(newColumn)
//                         });

//                         if (!res.ok) {
//                             const errorData = await res.json();
//                             throw new Error(errorData.error || "Failed to save column");
//                         }

//                         const saved = await res.json();
//                         setColumnsDef(prev => [...prev, saved]);
//                         console.log("saved", saved);
//                         console.log("columnsDef", columnsDef);
//                     } catch (err) {
//                         console.error("Error saving column:", err);
//                         alert("Error saving column: " + err.message);
//                     }
//                 }}
//             />

//             {deleteConfirmation.isOpen && (
//                 <div className="delete-confirmation-overlay" style={{
//                     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//                     backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
//                     justifyContent: 'center', alignItems: 'center', zIndex: 1000
//                 }}>
//                     <div className="delete-confirmation-modal" style={{
//                         backgroundColor: 'white', padding: '20px', borderRadius: '8px',
//                         textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//                     }}>
//                         <h4>Delete Column</h4>
//                         <p>Are you sure you want to delete the column "<strong>{deleteConfirmation.label}</strong>"?</p>
//                         <div className="d-flex justify-content-center gap-2 mt-3">
//                             <button className="btn btn-danger me-2" onClick={confirmDelete}>Yes</button>
//                             <button className="btn btn-secondary" onClick={cancelDelete}>No</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <SaveFilterModal
//                 isOpen={isSaveFilterModalOpen}
//                 onClose={() => setIsSaveFilterModalOpen(false)}
//                 onSave={handleSaveFilter}
//                 filters={filters}
//             />
//         </section>
//     );
// }

// export default TableColumns;

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Table from "./Table";
import AddEntryModal from "./AddEntryModal";
import Form from "./Form";
import ToggleButtonIcon from "./toggle";
import SaveFilterModal from "./SaveFilterModal";
import FilterSidebar from "./FilterSidebar";
import EditColumnAccessModal from "./EditColumnAccessModal";
import { API_URL } from "../../proxy";
import { FaTrash, FaTimes, FaUserCog, FaEdit } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import ColorPickerModal from "./ColorPickerModal";
import { FaPalette } from "react-icons/fa";

function TableColumns() {
  // Create a ref for FilterSidebar
  const filterSidebarRef = useRef(null);

  // clear filter button
  const [showClearFilterButton, setShowClearFilterButton] = useState(false);

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
  const [deleteFilterConfirmation, setDeleteFilterConfirmation] = useState({
    isOpen: false,
    filterId: null,
    filterName: "",
  });

  // Audit modal state
  const [auditModal, setAuditModal] = useState({
    isOpen: false,
    columnName: "",
    auditData: [],
    loading: false,
    createdInfo: null,
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
  }, []);

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
          const cellValue = String(row[key] ?? "").trim();
          const matches = filterValue.some(
            (fv) => String(fv ?? "").trim().toLowerCase() === cellValue.toLowerCase()
          );
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
  const handleSaveFilter = async (filterName, filterData, allowedUsers, filterId = null) => {
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
        filterId
      });

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
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        const updatedData = await response.json();
        console.log("Filter updated successfully:", updatedData);

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

  // Apply saved filter
  const handleFilterSelect = (filter) => {
    if (activeFilterId === filter._id) {
      console.log("Deactivating filter:", filter.filterName);
      clearFilters();
      return;
    }
    console.log("Saved Filters:", filter.length);
    setShowClearFilterButton(true);


    console.log("Applying saved filter:", filter.filterName, filter.filterData);
    if (filter && filter.filterData) {
      setFilters(filter.filterData);
      setActiveFilterId(filter._id);
      // setIsFilterOpen(true);
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
          const cellValue = String(row[key] ?? "").trim();
          return filterValue.some(
            (fv) =>
              String(fv ?? "")
                .trim()
                .toLowerCase() === cellValue.toLowerCase()
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

  const fetchSavedFilters = useCallback(async () => {
    if (!status?._id) return;
    try {
      const response = await fetch(`${API_URL}/api/filters?userId=${status._id}`);
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
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const updateTimeoutRef = useRef({});

  /* ---------------- UPDATE CELL ---------------- */
  const handleChange = (rowId, field, value) => {
    // Update local UI state immediately
    setData((prev) =>
      prev.map((row) => (row._id === rowId ? { ...row, [field]: value } : row)),
    );

    // Clear existing timeout for this row-field combination if it exists
    const timeoutKey = `${rowId}-${field}`;
    if (updateTimeoutRef.current[timeoutKey]) {
      clearTimeout(updateTimeoutRef.current[timeoutKey]);
    }

    // Debounce the API call
    updateTimeoutRef.current[timeoutKey] = setTimeout(() => {
      // Find the row we are going to send to backend (get the latest from the current state if needed,
      // but simpler to just use what we have and the new value)
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

      // We need to get the full row content to ensure strict:false fields are preserved
      // but since the backend does $set: updateBody, we only need to send the changed fields
      // or the whole object if the backend expects it.
      // The current backend uses req.body and expects changedByUserId/Name.

      // Get the latest row from state to include any other concurrent changes
      setData(prevData => {
        const latestRow = prevData.find(r => r._id === rowId);
        if (latestRow) {
          fetch(`${API_URL}/api/development/${rowId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...latestRow,
              changedByUserName,
              changedByUserId,
            }),
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
      const res = await fetch(`${API_URL}/api/columns/reorder/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnOrders }),
      });

      if (!res.ok) {
        throw new Error("Failed to save column order");
      }

      const result = await res.json();
      console.log("Column order saved successfully:", result);
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
      const res = await fetch(`${API_URL}/api/columns/${selectedColorCol.name}/options`, {
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

  const handleSaveColumnAccess = async (columnName, { access, column_heading, sorting, equalPrefix, morePrefix, lessPrefix, showInfo, sticky }) => {
    try {
      const body = { access, sorting, equalPrefix, morePrefix, lessPrefix, showInfo, sticky };
      if (column_heading !== undefined) body.column_heading = column_heading;
      const res = await fetch(
        `${API_URL}/api/columns/${columnName}/access`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
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
              sorting: updated.sorting,
              equalPrefix: updated.equalPrefix,
              morePrefix: updated.morePrefix,
              lessPrefix: updated.lessPrefix,
              showInfo: updated.showInfo,
              sticky: updated.sticky,
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
          // Use the column's default value if it has one set, otherwise empty string
          newRow[col.name] = (col.hasDefaultValue && col.defaultValue) ? col.defaultValue : "";
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

      const res = await fetch(`${API_URL}/api/development`, {
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
      const res = await fetch(`${API_URL}/api/development/${row._id}/audit`);
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
      ...columnsDef.filter(col => {
        // Hide Info column from non-admins
        if (status?.status !== 'admin' && (col.name === 'row_info' || col.column_heading === 'Info')) {
          return false;
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
                {status.status === "admin" && (
                  <button
                    className="btn btn-link p-0 text-dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditAccessModal({ isOpen: true, column: col });
                    }}
                    title="Edit column access"
                  >
                    <FaUserCog size={14} />
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
            const overdueInfo = calculateOverdue(endDateValue);
            return (
              <div className="d-flex align-items-center gap-1">
                <div className={overdueInfo.className}>{overdueInfo.text}</div>
                {(col.showInfo || (col.hasDefaultValue && status?.status === "admin")) && (
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

              const dayClass =
                diffDays > 0
                  ? "days-positive" // future
                  : diffDays < 0
                    ? "days-negative" // overdue
                    : "days-zero"; // today

              let displayText = "";
              if (diffDays === 0) {
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
                  {(col.showInfo || (col.hasDefaultValue && status?.status === "admin")) && (
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

          if (col.column_type === "select") {
            const trimmedValue = value.toString().trim();
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
                <select
                  value={value}
                  className={`bg-transparent border-0 w-100 ${optionColor ? '' : 'text-dark'}`}
                  style={{
                    color: optionColor ? textColor : 'inherit',
                    fontWeight: optionColor ? '600' : 'normal',
                    cursor: 'pointer'
                  }}
                  onChange={(e) =>
                    handleChange(row._id, col.name, e.target.value)
                  }
                  disabled={!canEdit(col.name, col)}
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

                    let optTextColor = getContrastYIQ(optColor);
                    if (optColor) {
                      if (optionTextColors[trimmedOpt]) {
                        optTextColor = optionTextColors[trimmedOpt];
                      } else if (optionTextColors.get && optionTextColors.get(trimmedOpt)) {
                        optTextColor = optionTextColors.get(trimmedOpt);
                      } else {
                        const target = trimmedOpt.toLowerCase();
                        const keys = Object.keys(optionTextColors);
                        const match = keys.find(k => k.trim().toLowerCase() === target);
                        if (match) optTextColor = optionTextColors[match];
                      }
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
                {(col.showInfo || (col.hasDefaultValue && status?.status === "admin")) && (
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

          return (
            <div className="d-flex align-items-center gap-1">
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
                disabled={!canEdit(col.name, col)}
              />
              {(col.showInfo || (col.hasDefaultValue && status?.status === "admin")) && (
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

      <div className="">
        {/* <FilterSidebar
          ref={filterSidebarRef}
          status={status}
          isFilterOpen={isFilterOpen}
          clearFilters={clearFilters}
          setIsSaveFilterModalOpen={setIsSaveFilterModalOpen}
          filters={filters}
        /> */}

        <div className="">
          {/* Saved Filters List above the table */}
          {savedFilters.length > 0 && (
            <div className="saved-filters-row w-100 mb-3">
              <div className="row flex-nowrap w-100 align-items-center">
                <div className={`filters-list-horizontal col-10`}>
                  {savedFilters.map((filter) => (
                    <div
                      key={filter._id}
                      className={`filter-item ${activeFilterId === filter._id ? 'active' : ''}`}
                      onClick={() => handleFilterSelect(filter)}
                      title="Click to toggle (apply/deactivate)"
                    >
                      <span className="filter-name">{filter.filterName}                       <span className="">({countMatchingRows(filter.filterData)})</span>
                      </span>
                      {status.status === 'admin' && (
                        <div className="filter-actions-group">
                          <button onClick={(e) => { e.stopPropagation(); setFilterToEdit(filter); setIsSaveFilterModalOpen(true); }} className="edit-filter-btn"><FaEdit size={12} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteFilter(filter._id, filter.filterName, e); }} className="delete-filter-btn"><FaTrash size={12} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                  <div className="filters-actions col-2 d-flex gap-2 justify-content-end align-items-center">
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
                  </div>
              </div>
            </div>
          )}
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

      {deleteRowConfirmation.isOpen && (
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
      )}

      {deleteFilterConfirmation.isOpen && (
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
              <h4>{auditModal.columnName}</h4>
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
                  <div className="p-3 bg-light rounded border">
                    <h6 className="mb-2 fw-bold">Creation Details</h6>
                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                      <span>Created By:</span>
                      <span className="fw-bold">{auditModal.createdInfo.name}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Created At:</span>
                      <span className="fw-bold">{auditModal.createdInfo.time ? new Date(auditModal.createdInfo.time).toLocaleString() : "Unknown"}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h6 className="mb-2 fw-bold">Change History</h6>
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
                            <th>Field</th>
                            <th>Old Value</th>
                            <th>New Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditModal.auditData.map((audit, idx) => (
                            <tr key={idx}>
                              <td>{audit.changedByUserName || "Unknown"}</td>
                              <td>{new Date(audit.changedAt).toLocaleString()}</td>
                              <td>{audit.columnName || audit.columnFieldName}</td>
                              <td>
                                {audit.oldValue === "" ? (
                                  <em className="text-muted">Empty</em>
                                ) : (
                                  audit.oldValue ?? "-"
                                )}
                              </td>
                              <td>
                                {audit.newValue === "" ? (
                                  <em className="text-muted">Empty</em>
                                ) : (
                                  audit.newValue ?? "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
      )}

      <ColorPickerModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        onSave={handleSaveOptions}
        columnHeading={selectedColorCol?.column_heading}
        options={selectedColorCol?.multipleValue || []}
        existingColors={selectedColorCol?.optionColors}
        existingTextColors={selectedColorCol?.optionTextColors}
      />

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
    </section>
  );
}

export default TableColumns;
