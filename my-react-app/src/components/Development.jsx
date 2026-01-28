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
//                                 disabled={!canEdit(col.name)}
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
//                             disabled={!canEdit(col.name)}
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
import { API_URL } from "../../proxy";
import { FaTrash, FaTimes } from "react-icons/fa";

function TableColumns() {
  // Create a ref for FilterSidebar
  const filterSidebarRef = useRef(null);

  // Column states
  const [columnsDef, setColumnsDef] = useState([]);

  // Data states (row)
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

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
  const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = useState(false);

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
  const handleSaveFilter = async (filterName, filterData) => {
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
      alert("Filter saved successfully!");
    } catch (err) {
      console.error("Error saving filter:", err);
      alert(`Failed to save filter: ${err.message}`);
    }
  };

  // Apply saved filter
  const handleFilterSelect = (filterData) => {
    setFilters(filterData);
    setIsFilterOpen(true);
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

      alert("Filter deleted successfully!");
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
      const filterValue = filters[key]?.toLowerCase();
      if (filterValue) {
        processedData = processedData.filter((row) => {
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

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return processedData;
  }, [data, filters, sortConfig]);
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/columns`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch columns");
        return res.json();
      })
      .then(setColumnsDef)
      .finally(() => setLoading(false))
      .catch((err) => console.error("Error loading columns:", err));

    fetch(`${API_URL}/api/development`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch development data");
        return res.json();
      })
      .then(setData)
      .finally(() => setLoading(false))
      .catch((err) => console.error("Error loading data:", err));
  }, []);

  /* ---------------- UPDATE CELL ---------------- */
  const handleChange = (rowId, field, value) => {
    setData((prev) =>
      prev.map((row) => (row._id === rowId ? { ...row, [field]: value } : row)),
    );

    const rowToUpdate = data.find((r) => r._id === rowId);
    if (rowToUpdate) {
      fetch(`${API_URL}/api/development/${rowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rowToUpdate, [field]: value }),
      });
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
    // Clear sorting and filters to ensure new row is visible at bottom
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
      setData((prev) => [...prev, saved]);
      setIsModalOpen(false); // Close modal after saving

      // Scroll to bottom
      const tableWrap = document.querySelector(".table-wrap");
      if (tableWrap) {
        tableWrap.scrollTop = tableWrap.scrollHeight;
      }
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
            </div>
            {isFilterOpen && col.sorting && (
              <div className="filter-row-input">
                <div className="filter-input-wrapper">
                  {col.column_type === "select" ? (
                    <select
                      className="form-control form-control-sm text-dark"
                      value={filters[col.name] || ""}
                      onChange={(e) =>
                        handleFilterChange(col.name, e.target.value)
                      }
                    >
                      <option value="">All</option>
                      {(col.multipleValue || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
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
            const startDate = row[col.conditionColumn1];
            const endDate = row[col.conditionColumn2];

            if (!startDate || !endDate) {
              return <span className="text-muted">-</span>;
            }

            try {
              const start = new Date(startDate);
              const end = new Date(endDate);

              if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return <span className="text-muted">Invalid dates</span>;
              }

              const diffTime = end - start;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return <span>{Math.abs(diffDays)} days</span>;
            } catch (err) {
              return <span className="text-muted">Error</span>;
            }
          }

          if (col.column_type === "select") {
            return (
              <select
                value={value}
                className="bg-transparent border-0 w-100 text-dark"
                onChange={(e) =>
                  handleChange(row._id, col.name, e.target.value)
                }
                disabled={!canEdit(col.name)}
              >
                <option value="">Select</option>
                {(col.multipleValue || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
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
          isOpen={isFilterOpen}
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

        <div className="col-md-10 col-sm-8">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="small">Loading ...</p>
            </div>
          ) : (
            <Table columns={columns} data={filteredAndSortedData} />
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

      <SaveFilterModal
        isOpen={isSaveFilterModalOpen}
        onClose={() => setIsSaveFilterModalOpen(false)}
        onSave={handleSaveFilter}
        filters={filters}
      />
    </section>
  );
}

export default TableColumns;
