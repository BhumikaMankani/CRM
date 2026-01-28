// // import Table from './Table';
// // import AddEntryModal from './AddEntryModal';
// // import initialData from '../data.json';
// // import { useEffect, useState, useMemo } from 'react';
// // import filterIcon from '../assets/filter.svg';
// // import { FaSort, FaSortUp, FaSortDown, FaTimes, FaTrash } from 'react-icons/fa';
// // import Form from './Form';
// // import Addmore from './Addmore';

// // function TableColumns() {


// //     const [data, setData] = useState([]);

// //     useEffect(() => {
// //         fetch("/api/projects")
// //             .then(res => res.json())
// //             .then(data => setData(data))
// //             .catch(err => console.error("Fetch error:", err));
// //     }, []);

// //     const [isSynced, setIsSynced] = useState(false);

// //     // console.log("data", data);
// //     const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
// //     const [isModalOpen, setIsModalOpen] = useState(false);
// //     const [isAddMoreVisible, setIsAddMoreVisible] = useState(false);
// //     const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
// //     const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
// //     const [filters, setFilters] = useState({});
// //     const [activeSuggestionField, setActiveSuggestionField] = useState(null);
// //     const [isFilterOpen, setIsFilterOpen] = useState(false);
// //     const [isDeleteMode, setIsDeleteMode] = useState(false);
// //     const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, accessor: '', label: '', isDynamic: false });

// //     const columnOptions = {
// //         group: ["Group A", "Group B", "Group C", "Group D", "Group E"],
// //         category: [
// //             "Redesign/Theme update",
// //             "Troubleshoot",
// //             "Theme Customization",
// //             "CRO Changes",
// //             "Graphics",
// //             "Audit",
// //             "Seo",
// //             "Marketing",
// //             "Speed Optimization",
// //             "Wordpress",
// //             "Shopify Plus",
// //             "Monthly Maintaining",
// //             "Custlo App"
// //         ],
// //         teamLead: [
// //             "Nikhil Joshi",
// //             "Komal Mankani",
// //             "Aditya",
// //             "Shubham",
// //             "Arun",
// //             "Vibha",
// //             "Sunil"
// //         ],
// //         status: [
// //             "Not started",
// //             "ON TRACK",
// //             "At Risk",
// //             "Off Track",
// //             "Completed",
// //             "On Hold",
// //             "Rating",
// //             "Refunded",
// //             "Forwarded to Client",
// //             "Rating Requested",
// //             "Risky Completed",
// //             "Offtrack Client",
// //             "Follow Up",
// //             "Confirmation Pending"
// //         ],
// //         discussion: [
// //             "No group",
// //             "On Whatsapp",
// //             "On Email",
// //             "skype",
// //             "Slack",
// //             "Aisensy"
// //         ],
// //         projectManager: ["Komal", "Pankaj", "Rahul", "Khanak", "Shubham", "Kajal"],
// //         salesDiscussion: ["Email", "Whatsapp", "Slack"]
// //     };

// //     const priorityRank = {
// //         'High': 1,
// //         'Medium': 2,
// //         'Low': 3,
// //         '': 4 // Empty values at the end
// //     };

// //     // Sorting Logic
// //     const handleSort = (key) => {
// //         let direction = 'asc';
// //         if (sortConfig.key === key && sortConfig.direction === 'asc') {
// //             direction = 'desc';
// //         }
// //         setSortConfig({ key, direction });
// //     };

// //     const showAddMore = () => {
// //         setIsAddMoreVisible(true);
// //     };
// //     const hideAddMore = () => {
// //         setIsAddMoreVisible(false);
// //     };
// //     // Filter Logic
// //     const handleFilterChange = (key, value) => {
// //         setFilters(prev => ({
// //             ...prev,
// //             [key]: value
// //         }));
// //     };

// //     const handleFilterClick = () => {
// //         setIsFilterOpen(!isFilterOpen);
// //     };

// //     const [hiddenColumns, setHiddenColumns] = useState(() => {
// //         const saved = localStorage.getItem('hidden-columns');
// //         return saved ? JSON.parse(saved) : [];
// //     });

// //     const handleColumnEditClick = () => {
// //         setIsDeleteMode(!isDeleteMode);
// //     };

// //     const handleDeleteClick = (accessor, label, isDynamic) => {
// //         setDeleteConfirmation({ isOpen: true, accessor, label, isDynamic });
// //     };

// //     const confirmDelete = async () => {
// //         const { accessor, label, isDynamic } = deleteConfirmation;

// //         if (isDynamic) {
// //             try {
// //                 const res = await fetch(`/api/submit/${accessor}`, {
// //                     method: 'DELETE'
// //                 });
// //                 if (!res.ok) throw new Error("Failed to delete column");

// //                 // Refresh dynamic columns (optional but good to keep in sync)
// //                 fetch('/api/submit')
// //                     .then(r => r.json())
// //                     .then(defs => setDynamicDefs(defs));

// //                 // Update dynamicDefs locally immediately to prevent shifting
// //                 setDynamicDefs(prev => prev.filter(col => col.name !== accessor));

// //                 // Sync frontend data by removing the deleted property
// //                 setData(prevData => prevData.map(row => {
// //                     const newRow = { ...row };
// //                     delete newRow[accessor];
// //                     return newRow;
// //                 }));
// //             } catch (err) {
// //                 console.error("Error deleting dynamic column:", err);
// //             }
// //         } else {
// //             // Static column - add to hidden list
// //             const newHidden = [...hiddenColumns, accessor];
// //             setHiddenColumns(newHidden);
// //             localStorage.setItem('hidden-columns', JSON.stringify(newHidden));
// //         }

// //         setDeleteConfirmation({ isOpen: false, accessor: '', label: '', isDynamic: false });
// //         setIsDeleteMode(false);
// //     };

// //     const handleHeaderRename = async (oldName, newName) => {
// //         if (!newName || oldName === newName) return;
// //         const trimmedNewName = newName.trim();
// //         if (!trimmedNewName || oldName === trimmedNewName) return;

// //         try {
// //             const res = await fetch(`/api/submit/${oldName}`, {
// //                 method: "PUT",
// //                 headers: { "Content-Type": "application/json" },
// //                 body: JSON.stringify({ newName: trimmedNewName })
// //             });

// //             if (!res.ok) throw new Error("Failed to rename column");

// //             const updatedCol = await res.json();

// //             // 1. Update dynamicDefs while preserving index
// //             setDynamicDefs(prev => prev.map(col =>
// //                 col.name === oldName ? { ...col, name: newName } : col
// //             ));

// //             // 2. Update data to rename the field in all documents
// //             setData(prevData => prevData.map(row => {
// //                 const newRow = { ...row };
// //                 if (newRow.hasOwnProperty(oldName)) {
// //                     newRow[newName] = newRow[oldName];
// //                     delete newRow[oldName];
// //                 }
// //                 return newRow;
// //             }));

// //         } catch (err) {
// //             console.error("Rename failed:", err);
// //         }
// //     };

// //     const cancelDelete = () => {
// //         setDeleteConfirmation({ isOpen: false, accessor: '', label: '', isDynamic: false });
// //         setIsDeleteMode(false);
// //     };

// //     const handleClearFilters = () => {
// //         setFilters({});
// //         setIsFilterOpen(false);
// //     };

// //     const filteredAndSortedData = useMemo(() => {
// //         let result = [...data];

// //         // Apply Filters
// //         Object.keys(filters).forEach(key => {
// //             if (filters[key]) {
// //                 result = result.filter(item => {
// //                     // Special case for Overdue Days display text
// //                     if (key === 'overdueDays') {
// //                         const { text } = calculateOverdue(item.endDate);
// //                         if (text.toLowerCase().includes(filters[key].toLowerCase())) return true;
// //                     }

// //                     // Handle DD/MM/YYYY date filtering with YYYY-MM-DD input
// //                     if (key === 'startDate' || key === 'endDate') {
// //                         const filterVal = filters[key]; // YYYY-MM-DD
// //                         const itemVal = item[key]; // DD/MM/YYYY
// //                         if (itemVal) {
// //                             const [d, m, y] = itemVal.split('/');
// //                             const normalizedItem = `${y}-${m}-${d}`;
// //                             return normalizedItem.includes(filterVal);
// //                         }
// //                         return false;
// //                     }

// //                     const itemValue = item[key] ? item[key].toString().toLowerCase() : '';
// //                     return itemValue.includes(filters[key].toLowerCase());
// //                 });
// //             }
// //         });

// //         // console.log("filteredAndSortedData", filteredAndSortedData);

// //         // Apply Sorting
// //         if (sortConfig.key) {
// //             result.sort((a, b) => {
// //                 const aValue = a[sortConfig.key] || '';
// //                 const bValue = b[sortConfig.key] || '';

// //                 // 1. Custom sorting for Priority
// //                 if (sortConfig.key === 'priority') {
// //                     const rankA = priorityRank[aValue] || 4;
// //                     const rankB = priorityRank[bValue] || 4;
// //                     return sortConfig.direction === 'asc' ? rankA - rankB : rankB - rankA;
// //                 }

// //                 // 2. Chronological sorting for Month (YYYY-MM)
// //                 if (sortConfig.key === 'monthYear') {
// //                     if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
// //                     if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
// //                     return 0;
// //                 }

// //                 // 3. Chronological sorting for DD/MM/YYYY dates
// //                 if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate' || sortConfig.key === 'overdueDays') {
// //                     const sortKey = sortConfig.key === 'overdueDays' ? 'endDate' : sortConfig.key;
// //                     const parseDate = (str) => {
// //                         if (!str) return 0;
// //                         const [d, m, y] = str.split('/').map(Number);
// //                         return new Date(y, m - 1, d).getTime();
// //                     };
// //                     const timeA = parseDate(a[sortKey] || '');
// //                     const timeB = parseDate(b[sortKey] || '');
// //                     return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
// //                 }

// //                 // 4. Default Alphabetical Sort for others
// //                 const strA = aValue.toString().toLowerCase();
// //                 const strB = bValue.toString().toLowerCase();

// //                 if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
// //                 if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
// //                 return 0;
// //             });
// //         }

// //         return result;
// //     }, [data, sortConfig, filters]);
// //     // Save data to localStorage on every change
// //     // const handleDataChange = (index, field, value) => {
// //     //     setData(prevData => {
// //     //         const updatedData = [...prevData];
// //     //         updatedData[index] = {
// //     //             ...updatedData[index],
// //     //             [field]: value
// //     //         };
// //     //         localStorage.setItem('table-data', JSON.stringify(updatedData));
// //     //         return updatedData;
// //     //     });
// //     // };

// //     const handleDataChange = async (index, field, value) => {
// //         const updatedRow = { ...data[index], [field]: value };

// //         // console.log("updatedRow", updatedRow);
// //         try {
// //             const res = await fetch(`/api/projects/${updatedRow._id}`, {
// //                 method: "PUT",
// //                 headers: { "Content-Type": "application/json" },
// //                 body: JSON.stringify(updatedRow)
// //             });

// //             if (!res.ok) throw new Error("Failed to update");

// //             setData(prevData => {
// //                 const updatedData = [...prevData];
// //                 updatedData[index] = updatedRow;
// //                 return updatedData;
// //             });
// //         } catch (err) {
// //             console.error("Update failed:", err);
// //         }
// //     };

// //     const handleSaveEntry = async (newEntry) => {
// //         try {
// //             const res = await fetch("/api/projects", {
// //                 method: "POST",
// //                 headers: { "Content-Type": "application/json" },
// //                 body: JSON.stringify(newEntry)
// //             });
// //             // console.log("newEntry", newEntry);
// //             const savedEntry = await res.json();

// //             setData(prevData => [...prevData, savedEntry]);
// //         } catch (err) {
// //             console.error("Error saving entry:", err);
// //         }
// //     };

// //     const handleColumnSaveEntry = async (newColumn) => {
// //         try {
// //             const res = await fetch("/api/submit", {
// //                 method: "POST",
// //                 headers: { "Content-Type": "application/json" },
// //                 body: JSON.stringify(newColumn)
// //             });
// //             // console.log("newColumn", newColumn);
// //             const savedColumn = await res.json();

// //             setDynamicDefs(prevData => [...prevData, savedColumn]);
// //         } catch (err) {
// //             console.error("Error saving newColumn:", err);
// //         }
// //     };

// //     // Daily reset for Daily Check
// //     useEffect(() => {
// //         const today = new Date().toLocaleDateString();
// //         const lastReset = localStorage.getItem('last-reset-date');

// //         if (lastReset !== today) {
// //             const updatedData = data.map(row => ({
// //                 ...row,
// //                 dailyCheck: "No"
// //             }));

// //             setData(updatedData);
// //             localStorage.setItem('table-data', JSON.stringify(updatedData));
// //             localStorage.setItem('last-reset-date', today);
// //         }
// //     }, [data.length]);

// //     // Helper to calculate overdue days
// //     const calculateOverdue = (dateStr) => {
// //         if (!dateStr) return { text: "No Date", className: "overdue-block deadline-green" };

// //         const [day, month, year] = dateStr.split('/');
// //         if (!day || !month || !year) {
// //             return { text: dateStr, className: "overdue-block deadline-green" };
// //         }

// //         const targetDate = new Date(`${year}-${month}-${day}`);
// //         const today = new Date();
// //         today.setHours(0, 0, 0, 0);
// //         targetDate.setHours(0, 0, 0, 0);

// //         const diffTime = targetDate - today;
// //         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

// //         if (diffDays < 0) {
// //             return {
// //                 text: `Overdue by ${Math.abs(diffDays)} days`,
// //                 className: "overdue-block bg-danger"
// //             };
// //         } else if (diffDays === 0) {
// //             return {
// //                 text: `Deadline Today`,
// //                 className: "overdue-block bg-warning"
// //             };
// //         } else {
// //             return {
// //                 text: `Deadline in ${diffDays} days`,
// //                 className: "overdue-block bg-success"
// //             };
// //         }
// //     };

// //     const formatDateForInput = (dateStr) => {
// //         if (!dateStr) return '';
// //         const [day, month, year] = dateStr.split('/');
// //         return `${year}-${month}-${day}`;
// //     };

// //     const formatDateFromInput = (dateStr) => {
// //         if (!dateStr) return '';
// //         const [year, month, day] = dateStr.split('-');
// //         return `${day}/${month}/${year}`;
// //     };

// //     const renderSortIcon = (key) => {
// //         if (sortConfig.key !== key) return <FaSort style={{ opacity: 0.3 }} />;
// //         return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
// //     };

// //     const renderHeader = (label, accessor, isSortable = false, isFilterable = true, inputType = 'text', isDynamic = false) => {
// //         const options = columnOptions[accessor];
// //         const filterValue = filters[accessor] || '';

// //         const globalIndex = columnOptions;
// //         // Show all options if field is empty OR if current value matches an option exactly (to allow switching)
// //         const showAll = !filterValue || (options && options.includes(filterValue));
// //         const filteredOptions = options ? (
// //             showAll ? options : options.filter(opt =>
// //                 opt.toLowerCase().includes(filterValue.toLowerCase())
// //             )
// //         ) : [];

// //         return (
// //             <div className="header-cell-content">
// //                 <div
// //                     className={`header-top ${isSortable ? 'sortable' : ''}`}

// //                     style={{ cursor: isSortable ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
// //                 >
// //                     <div className="d-flex align-items-center flex-grow-1">
// //                         <input
// //                             id={`filter-${accessor}`}
// //                             type="text"
// //                             className={`header-label sorting bg-transparent border-0 shadow-none ${isDeleteMode && isDynamic ? 'editable-header' : ''}`}
// //                             defaultValue={label}
// //                             readOnly={!(isDeleteMode && isDynamic)}
// //                             onBlur={(e) => isDeleteMode && isDynamic && handleHeaderRename(accessor, e.target.value)}
// //                             onKeyDown={(e) => {
// //                                 if (e.key === 'Enter' && isDeleteMode && isDynamic) {
// //                                     e.target.blur();
// //                                 }
// //                             }}
// //                         />
// //                         {isDeleteMode && (
// //                             <FaTrash
// //                                 className="column-delete-icon"
// //                                 onClick={(e) => {
// //                                     e.stopPropagation();
// //                                     handleDeleteClick(accessor, label, isDynamic);
// //                                 }}
// //                                 style={{ color: 'red', cursor: 'pointer', marginLeft: '8px', fontSize: '14px' }}
// //                             />
// //                         )}
// //                     </div>
// //                     {isSortable && <span className="sort-icon" onClick={isSortable ? () => handleSort(accessor) : undefined}>{renderSortIcon(accessor)}</span>}
// //                 </div>
// //                 {isFilterable && isFilterOpen && (
// //                     <div className="header-bottom" style={{ position: 'relative' }}>
// //                         <div className="filter-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
// //                             <label htmlFor={`filter-${accessor}`} className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
// //                                 Filter {label}
// //                             </label>
// //                             <input
// //                                 id={`filter-${accessor}`}
// //                                 type={inputType}
// //                                 className="column-filter bg-transparent border-0 shadow-none"
// //                                 placeholder={`Search ${label}...`}
// //                                 value={filterValue}
// //                                 onChange={(e) => handleFilterChange(accessor, e.target.value)}
// //                                 onFocus={() => setActiveSuggestionField(accessor)}
// //                                 onClick={(e) => e.stopPropagation()}
// //                                 style={{ paddingRight: filterValue ? '25px' : '10px' }}
// //                             />
// //                             {filterValue && (
// //                                 <FaTimes
// //                                     className="filter-clear-icon"
// //                                     onClick={(e) => {
// //                                         e.stopPropagation();
// //                                         handleFilterChange(accessor, '');
// //                                     }}
// //                                 />
// //                             )}
// //                         </div>
// //                         {activeSuggestionField === accessor && filteredOptions.length > 0 && (
// //                             <div className="filter-suggestions">
// //                                 {filteredOptions.map((opt, idx) => (
// //                                     <div
// //                                         key={idx}
// //                                         className="suggestion-item"
// //                                         onClick={() => {
// //                                             handleFilterChange(accessor, opt);
// //                                             setActiveSuggestionField(null);
// //                                         }}
// //                                     >
// //                                         {opt}
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         )}
// //                     </div>
// //                 )}
// //             </div>
// //         );
// //     };

// //     const columns = [
// //         {
// //             header: renderHeader('', 'rowIndex', false, false),
// //             accessor: 'rowIndex',
// //             render: (row, rowIndex) => (
// //                 <div
// //                     onMouseEnter={() => setHoveredRowIndex(rowIndex)}
// //                     onMouseLeave={() => setHoveredRowIndex(null)}
// //                     className="row-index-wrapper"
// //                 >


// //                     {hoveredRowIndex === rowIndex ? (
// //                         <Addmore onAddClick={() => setIsModalOpen(true)} />
// //                     ) : <span className="text-muted">{rowIndex + 1}</span>}
// //                 </div>

// //             )
// //         },
// //         {
// //             header: renderHeader('Project', 'project', true),
// //             accessor: 'project',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <div className="cell-input-wrapper">
// //                         <label htmlFor={`project-${rowIndex}`} className="visually-hidden">Project</label>
// //                         <input
// //                             id={`project-${rowIndex}`}
// //                             type="text"
// //                             value={row.project}
// //                             onChange={(e) => handleDataChange(globalIndex, 'project', e.target.value)}
// //                             className="project-text bg-transparent border-0 shadow-none"
// //                         />
// //                     </div>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Daily Check', 'dailyCheck', true, false),
// //             accessor: 'dailyCheck',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <div className="cell-input-wrapper">
// //                         <label htmlFor={`dailyCheck-${rowIndex}`} className="visually-hidden">Daily Check</label>
// //                         <select
// //                             id={`dailyCheck-${rowIndex}`}
// //                             value={row.dailyCheck}
// //                             onChange={(e) => handleDataChange(globalIndex, 'dailyCheck', e.target.value)}
// //                             className="w-100 daily-check-cell form-select-sm bg-transparent border-0 shadow-none"
// //                         >
// //                             <option value="No">No</option>
// //                             <option value="Yes">Yes</option>
// //                         </select>
// //                     </div>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('TL Comments', 'tlComments', false, false),
// //             accessor: 'tlComments',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="text"
// //                         value={row.tlComments}
// //                         onChange={(e) => handleDataChange(globalIndex, 'tlComments', e.target.value)}
// //                         className="tl-comments bg-transparent border-0 shadow-none"
// //                     />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Overdue Days', 'overdueDays', true, false),
// //             accessor: 'overdueDays',
// //             render: (row) => {
// //                 const { text, className } = calculateOverdue(row.endDate);
// //                 return <div className={className}>{text}</div>;
// //             }
// //         },
// //         {
// //             header: renderHeader('Group', 'group', true),
// //             accessor: 'group',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <select
// //                         value={row.group}
// //                         onChange={(e) => handleDataChange(globalIndex, 'group', e.target.value)}
// //                         className="w-100 group-block form-select-sm bg-transparent border-0 shadow-none"
// //                     >
// //                         <option value="Group A">Group A</option>
// //                         <option value="Group B">Group B</option>
// //                         <option value="Group C">Group C</option>
// //                         <option value="Group D">Group D</option>
// //                         <option value="Group E">Group E</option>
// //                     </select>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Category', 'category'),
// //             accessor: 'category',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <div className="cell-input-wrapper">
// //                         <label htmlFor={`category-${rowIndex}`} className="visually-hidden">Category</label>
// //                         <select
// //                             id={`category-${rowIndex}`}
// //                             value={row.category}
// //                             onChange={(e) => handleDataChange(globalIndex, 'category', e.target.value)}
// //                             className="w-100 category-select form-select-sm bg-transparent border-0 shadow-none"
// //                         >
// //                             <option value="Redesign/Theme update">Redesign/Theme update</option>
// //                             <option value="Troubleshoot">Troubleshoot</option>
// //                             <option value="Theme Customization">Theme Customization</option>
// //                             <option value="CRO Changes">CRO Changes</option>
// //                             <option value="Graphics">Graphics</option>
// //                             <option value="Audit">Audit</option>
// //                             <option value="Seo">Seo</option>
// //                             <option value="Marketing">Marketing</option>
// //                             <option value="Speed Optimization">Speed Optimization</option>
// //                             <option value="Wordpress">Wordpress</option>
// //                             <option value="Shopify Plus">Shopify Plus</option>
// //                             <option value="Monthly Maintaining">Monthly Maintaining</option>
// //                             <option value="Custlo App">Custlo App</option>
// //                         </select>
// //                     </div>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Start Date', 'startDate', true, true, 'date'),
// //             accessor: 'startDate',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="date"
// //                         value={formatDateForInput(row.startDate)}
// //                         onChange={(e) => handleDataChange(globalIndex, 'startDate', formatDateFromInput(e.target.value))}
// //                         className="start-date bg-transparent border-0 shadow-none"
// //                     />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('End Date', 'endDate', true, true, 'date'),
// //             accessor: 'endDate',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="date"
// //                         value={formatDateForInput(row.endDate)}
// //                         onChange={(e) => handleDataChange(globalIndex, 'endDate', formatDateFromInput(e.target.value))}
// //                         className="end-date bg-transparent border-0 shadow-none" />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Team Lead', 'teamLead'),
// //             accessor: 'teamLead',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <select
// //                         value={row.teamLead}
// //                         onChange={(e) => handleDataChange(globalIndex, 'teamLead', e.target.value)}
// //                         className="w-100 team-lead-text form-select-sm bg-transparent border-0 shadow-none"
// //                     >
// //                         <option value="Nikhil Joshi">Nikhil Joshi</option>
// //                         <option value="Komal Mankani">Komal Mankani</option>
// //                         <option value="Aditya">Aditya</option>
// //                         <option value="Shubham">Shubham</option>
// //                         <option value="Arun">Arun</option>
// //                         <option value="Vibha">Vibha</option>
// //                         <option value="Sunil">Sunil</option>
// //                     </select>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Status', 'status'),
// //             accessor: 'status',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <div className="cell-input-wrapper">
// //                         <label htmlFor={`status-${rowIndex}`} className="visually-hidden">Status</label>
// //                         <select
// //                             id={`status-${rowIndex}`}
// //                             value={row.status}
// //                             onChange={(e) => handleDataChange(globalIndex, 'status', e.target.value)}
// //                             className={`w-100 status-select status-${row.status?.toLowerCase().replace(/\s+/g, '-')}`}
// //                         >
// //                             <option value="Not started">Not started</option>
// //                             <option value="ON TRACK">ON TRACK</option>
// //                             <option value="At Risk">At Risk</option>
// //                             <option value="Off Track">Off Track</option>
// //                             <option value="Completed">Completed</option>
// //                             <option value="On Hold">On Hold</option>
// //                             <option value="Rating">Rating</option>
// //                             <option value="Refunded">Refunded</option>
// //                             <option value="Forwarded to Client">Forwarded to Client</option>
// //                             <option value="Rating Requested">Rating Requested</option>
// //                             <option value="Risky Completed">Risky Completed</option>
// //                             <option value="Offtrack Client">Offtrack Client</option>
// //                             <option value="Follow Up">Follow Up</option>
// //                             <option value="Confirmation Pending">Confirmation Pending</option>
// //                         </select>
// //                     </div>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Team lead discussion', 'discussion'),
// //             accessor: 'discussion',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <select
// //                         value={row.discussion}
// //                         onChange={(e) => handleDataChange(globalIndex, 'discussion', e.target.value)}
// //                         className="w-100 form-select-sm bg-transparent border-0 shadow-none"
// //                     >
// //                         <option value="No group">No group</option>
// //                         <option value="On Whatsapp">On Whatsapp</option>
// //                         <option value="On Email">On Email</option>
// //                         <option value="skype">Skype</option>
// //                         <option value="Slack">Slack</option>
// //                         <option value="Aisensy">Aisensy</option>
// //                     </select>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Project Manager', 'projectManager', true),
// //             accessor: 'projectManager',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <select
// //                         value={row.projectManager}
// //                         onChange={(e) => handleDataChange(globalIndex, 'projectManager', e.target.value)}
// //                         className="w-100 project_manager form-select-sm bg-transparent border-0 shadow-none"
// //                     >
// //                         <option value="Komal">Komal</option>
// //                         <option value="Pankaj">Pankaj</option>
// //                         <option value="Rahul">Rahul</option>
// //                         <option value="Khanak">Khanak</option>
// //                         <option value="Shubham">Shubham</option>
// //                         <option value="Kajal">Kajal</option>
// //                     </select>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Client', 'client', true),
// //             accessor: 'client',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="text"
// //                         value={row.client}
// //                         onChange={(e) => handleDataChange(globalIndex, 'client', e.target.value)}
// //                         className="client-text bg-transparent border-0 shadow-none"
// //                     />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Sales Discussion', 'salesDiscussion'),
// //             accessor: 'salesDiscussion',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <select
// //                         value={row.salesDiscussion}
// //                         onChange={(e) => handleDataChange(globalIndex, 'salesDiscussion', e.target.value)}
// //                         className="w-100 sales-discussion form-select-sm bg-transparent border-0 shadow-none"
// //                     >
// //                         <option value="Email">Email</option>
// //                         <option value="Whatsapp">Whatsapp</option>
// //                         <option value="Slack">Slack</option>
// //                     </select>
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Month', 'monthYear', true, true, 'month'),
// //             accessor: 'monthYear',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="month"
// //                         value={row.monthYear}
// //                         onChange={(e) => handleDataChange(globalIndex, 'monthYear', e.target.value)}
// //                         className="month-year bg-transparent border-0 shadow-none"
// //                     />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Rating Status', 'ratingStatus', false, false),
// //             accessor: 'ratingStatus',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="text"
// //                         value={row.ratingStatus}
// //                         onChange={(e) => handleDataChange(globalIndex, 'ratingStatus', e.target.value)}
// //                         className='bg-transparent border-0 shadow-none' />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Final Invoice Pending', 'finalInvoicePending', false, false),
// //             accessor: 'finalInvoicePending',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="text"
// //                         value={row.finalInvoicePending}
// //                         onChange={(e) => handleDataChange(globalIndex, 'finalInvoicePending', e.target.value)}
// //                         className='bg-transparent border-0 shadow-none'
// //                     />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Rating Requested', 'ratingRequested', false, false),
// //             accessor: 'ratingRequested',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="text"
// //                         value={row.ratingRequested}
// //                         onChange={(e) => handleDataChange(globalIndex, 'ratingRequested', e.target.value)}
// //                         className='bg-transparent border-0 shadow-none'
// //                     />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Client Satisfaction', 'clientSatisfaction', false, false),
// //             accessor: 'clientSatisfaction',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="text"
// //                         value={row.clientSatisfaction}
// //                         onChange={(e) => handleDataChange(globalIndex, 'clientSatisfaction', e.target.value)}
// //                         className='bg-transparent border-0 shadow-none'
// //                     />
// //                 );
// //             }
// //         },
// //         {
// //             header: renderHeader('Priority', 'priority', true, false),
// //             accessor: 'priority',
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 return (
// //                     <input
// //                         type="text"
// //                         value={row.priority}
// //                         onChange={(e) => handleDataChange(globalIndex, 'priority', e.target.value)}
// //                         className='bg-transparent border-0 shadow-none '
// //                     />
// //                 );
// //             }
// //         }

// //     ];

// //     const [dynamicDefs, setDynamicDefs] = useState([]);

// //     useEffect(() => {
// //         fetch('/api/submit')
// //             .then(res => res.json())
// //             .then(defs => {
// //                 setDynamicDefs(defs);
// //             })
// //             .catch(err => console.error("Error fetching dynamic columns:", err));
// //     }, []);

// //     const dynamicColumns = useMemo(() => {
// //         return dynamicDefs.map(col => ({
// //             header: renderHeader(col.name, col.name, true, true, 'text', true),
// //             accessor: col.name,
// //             render: (row, rowIndex) => {
// //                 const globalIndex = data.findIndex(item => item === row);
// //                 if (col.type === 'select') {
// //                     return (
// //                         <div className="cell-input-wrapper">
// //                             <select
// //                                 value={row[col.name] || ''}
// //                                 onChange={(e) => handleDataChange(globalIndex, col.name, e.target.value)}
// //                                 className='w-100 form-select-sm bg-transparent border-0 shadow-none'

// //                             >
// //                                 <option value="">Select...</option>
// //                                 {col.options && col.options.map((opt, idx) => (
// //                                     <option key={idx} value={opt}>{opt}</option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     );
// //                 } else {
// //                     return (
// //                         <div className="cell-input-wrapper">
// //                             <input
// //                                 type={col.type === 'date' ? 'date' : (col.type === 'number' ? 'number' : 'text')}
// //                                 value={row[col.name] || ''}
// //                                 onChange={(e) => handleDataChange(globalIndex, col.name, e.target.value)}
// //                                 className='bg-transparent border-0 shadow-none'
// //                             />
// //                         </div>
// //                     );
// //                 }
// //             }
// //         }));
// //     }, [dynamicDefs, data, sortConfig, filters, isDeleteMode]); // include data so findIndex works with latest data

// //     const add = () => {
// //         return (
// //             <svg viewBox="0 0 16 16" fill="none" xmlnsXlink="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 1H6V6L1 6V10H6V15H10V10H15V6L10 6V1Z" fill="#000000"></path> </g></svg>
// //         )
// //     }
// //     const allColumns = [...columns, ...dynamicColumns].filter(col => !hiddenColumns.includes(col.accessor));

// //     return (
// //         <section className="ftco-section">
// //             <div className='heading_info'>
// //                 <h1>Projects List</h1>
// //                 <div className='sorting_custom'>
// //                     {Object.values(filters).some(v => v) && (
// //                         <button onClick={handleClearFilters} className='clear_filters_button' title="Clear Filters">
// //                             <FaTimes />
// //                         </button>
// //                     )}
// //                     <button onClick={handleColumnEditClick} className='btn btn-outline-dark me-2' title="Add Row">
// //                         <svg fill="#000000" version="1.1" id="Capa_1" xmlnsXlink="http://www.w3.org/2000/svg" viewBox="0 0 528.899 528.899" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><g> <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path> </g> </g></svg>
// //                     </button>
// //                     <button onClick={handleFilterClick} className='btn btn-outline-dark' title="Toggle Filters">
// //                         <svg viewBox="0 0 24 24" fill="none" xmlnsXlink="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fillRule="evenodd" clipRule="evenodd" d="M15 10.5A3.502 3.502 0 0 0 18.355 8H21a1 1 0 1 0 0-2h-2.645a3.502 3.502 0 0 0-6.71 0H3a1 1 0 0 0 0 2h8.645A3.502 3.502 0 0 0 15 10.5zM3 16a1 1 0 1 0 0 2h2.145a3.502 3.502 0 0 0 6.71 0H21a1 1 0 1 0 0-2h-9.145a3.502 3.502 0 0 0-6.71 0H3z" fill="#000000"></path></g></svg>
// //                     </button>
// //                 </div>
// //             </div>

// //             <Table
// //                 columns={allColumns}
// //                 data={filteredAndSortedData}
// //                 onAddClick={() => setIsModalOpen(true)}
// //                 onAddColumnClick={() => setIsColumnModalOpen(true)}
// //             />
// //             <Form
// //                 isPopupOpen={isColumnModalOpen}
// //                 onPopupClose={() => setIsColumnModalOpen(false)}
// //                 onPopupSave={handleColumnSaveEntry}
// //             />
// //             <AddEntryModal
// //                 isOpen={isModalOpen}
// //                 onClose={() => setIsModalOpen(false)}
// //                 onSave={handleSaveEntry}
// //             />

// //             {deleteConfirmation.isOpen && (
// //                 <div className="delete-confirmation-overlay" style={{
// //                     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
// //                     backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
// //                     justifyContent: 'center', alignItems: 'center', zIndex: 1000
// //                 }}>
// //                     <div className="delete-confirmation-modal" style={{
// //                         backgroundColor: 'white', padding: '20px', borderRadius: '8px',
// //                         textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
// //                     }}>
// //                         <h4>Delete Column</h4>
// //                         <p>Are you sure you want to delete the column "<strong>{deleteConfirmation.label}</strong>"?</p>
// //                         <div className="d-flex justify-content-center gap-2 mt-3">
// //                             <button className="btn btn-danger me-2" onClick={confirmDelete}>Yes</button>
// //                             <button className="btn btn-secondary" onClick={cancelDelete}>No</button>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}
// //         </section>
// //     );
// // }

// // export default TableColumns;


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
//   // Create a ref for FilterSidebar
//   const filterSidebarRef = useRef(null);

//   // Column states
//   const [columnsDef, setColumnsDef] = useState([]);

//   // Data states (row)
//   const [data, setData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

//   const [loading, setLoading] = useState(false);
//   // Column delete states
//   const [isDelete, setIsDelete] = useState(false);
//   const [deleteConfirmation, setDeleteConfirmation] = useState({
//     isOpen: false,
//     accessor: "",
//     label: "",
//     isDynamic: false,
//   });

//   // Sorting and filtering states
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
//   const [filters, setFilters] = useState({});
//   const [activeSuggestionField, setActiveSuggestionField] = useState(null);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = useState(false);

//   // hover delete row icon
//   const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

//   // Get data user
//   const [status, setStatus] = useState(() => {
//     // Get the item from localStorage
//     const savedData = localStorage.getItem("user");

//     // Parse it or return null if it doesn't exist
//     return savedData ? JSON.parse(savedData) : null;
//   });
//   // Handle column delete
//   const handleColumnEditClick = () => {
//     setIsDelete(!isDelete);
//   };

//   // Helper for overdue calculation
//   const calculateOverdue = (dateStr) => {
//     if (!dateStr)
//       return {
//         text: "No Date",
//         className: "overdue-block deadline-green text-center",
//       };

//     let year, month, day;
//     if (dateStr.includes("-")) {
//       // Assume YYYY-MM-DD (standard date input)
//       [year, month, day] = dateStr.split("-");
//     } else if (dateStr.includes("/")) {
//       // Assume DD/MM/YYYY
//       [day, month, year] = dateStr.split("/");
//     } else {
//       return {
//         text: dateStr,
//         className: "overdue-block deadline-green text-center",
//       };
//     }

//     if (!day || !month || !year) {
//       return {
//         text: dateStr,
//         className: "overdue-block deadline-green text-center",
//       };
//     }

//     const targetDate = new Date(`${year}-${month}-${day}`);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     targetDate.setHours(0, 0, 0, 0);

//     const diffTime = targetDate - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     if (diffDays < 0) {
//       return {
//         text: `Overdue by ${Math.abs(diffDays)} days`,
//         className: "overdue-block bg-danger p-1 rounded text-white text-center",
//       };
//     } else if (diffDays === 0) {
//       return {
//         text: `Deadline Today`,
//         className: "overdue-block bg-warning p-1 rounded text-dark text-center",
//       };
//     } else {
//       return {
//         text: `Deadline in ${diffDays} days`,
//         className:
//           "overdue-block bg-success p-1 rounded text-white text-center",
//       };
//     }
//   };

//   // Handle filter
//   const handleFilterClick = () => {
//     setIsFilterOpen(!isFilterOpen);
//   };

//   const handleFilterChange = useCallback((field, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   }, []);

//   const clearFilters = useCallback(() => {
//     setFilters({});
//     setIsFilterOpen(false);
//   }, []);

//   // Save filter
//   const handleSaveFilter = async (filterName, filterData) => {
//     try {
//       const userData = localStorage.getItem("user");
//       const user = userData ? JSON.parse(userData) : null;

//       if (!user || !user._id) {
//         console.error("User data missing:", user);
//         alert("User information not found. Please log in again.");
//         return;
//       }

//       console.log("Saving filter with data:", {
//         userId: user._id,
//         filterName,
//         filterData,
//       });

//       const response = await fetch(`${API_URL}/api/filters`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: user._id,
//           filterName,
//           filterData,
//         }),
//       });

//       console.log("Filter save response status:", response.status);

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Filter save error response:", errorData);
//         throw new Error(errorData.message || `HTTP Error: ${response.status}`);
//       }

//       const savedData = await response.json();
//       console.log("Filter saved successfully:", savedData);

//       // Add the new filter to the sidebar immediately
//       if (filterSidebarRef.current) {
//         filterSidebarRef.current.addNewFilterToList(savedData);
//       }

//       setIsSaveFilterModalOpen(false);
//       alert("Filter saved successfully!");
//     } catch (err) {
//       console.error("Error saving filter:", err);
//       alert(`Failed to save filter: ${err.message}`);
//     }
//   };

//   // Apply saved filter
//   const handleFilterSelect = (filterData) => {
//     setFilters(filterData);
//     setIsFilterOpen(true);
//   };

//   // Delete saved filter
//   const handleDeleteFilter = async (filterId, e) => {
//     if (e) e.stopPropagation();

//     try {
//       const response = await fetch(`${API_URL}/api/filters/${filterId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to delete filter");
//       }

//       // Update the sidebar to remove the deleted filter
//       if (
//         filterSidebarRef.current &&
//         filterSidebarRef.current.removeFilterFromList
//       ) {
//         filterSidebarRef.current.removeFilterFromList(filterId);
//       }

//       alert("Filter deleted successfully!");
//     } catch (err) {
//       console.error("Error deleting filter:", err);
//       alert(`Failed to delete filter: ${err.message}`);
//     }
//   };

//   const requestSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   const filteredAndSortedData = useMemo(() => {
//     let processedData = [...data];

//     // Apply filters
//     Object.keys(filters).forEach((key) => {
//       const filterValue = filters[key]?.toLowerCase();
//       if (filterValue) {
//         processedData = processedData.filter((row) => {
//           const cellValue = String(row[key] || "").toLowerCase();
//           return cellValue.includes(filterValue);
//         });
//       }
//     });

//     // Apply sorting
//     if (sortConfig.key) {
//       processedData.sort((a, b) => {
//         const aValue = a[sortConfig.key] || "";
//         const bValue = b[sortConfig.key] || "";

//         if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
//         return 0;
//       });
//     }

//     return processedData;
//   }, [data, filters, sortConfig]);
//   useEffect(() => {
//     setLoading(true);
//     fetch(`${API_URL}/api/columns`)
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch columns");
//         return res.json();
//       })
//       .then(setColumnsDef)
//       .finally(() => setLoading(false))
//       .catch((err) => console.error("Error loading columns:", err));

//     fetch(`${API_URL}/api/development`)
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch development data");
//         return res.json();
//       })
//       .then(setData)
//       .finally(() => setLoading(false))
//       .catch((err) => console.error("Error loading data:", err));
//   }, []);

//   /* ---------------- UPDATE CELL ---------------- */
//   const handleChange = (rowId, field, value) => {
//     setData((prev) =>
//       prev.map((row) => (row._id === rowId ? { ...row, [field]: value } : row)),
//     );

//     const rowToUpdate = data.find((r) => r._id === rowId);
//     if (rowToUpdate) {
//       fetch(`${API_URL}/api/development/${rowId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...rowToUpdate, [field]: value }),
//       });
//     }
//   };

//   const handleDeleteClick = (col) => {
//     setDeleteConfirmation({
//       isOpen: true,
//       accessor: col.name,
//       label: col.column_heading,
//       isDynamic: true,
//     });
//   };

//   const deleteRow = async (rowId, e) => {
//     if (e) e.stopPropagation();

//     const rowIdStr = String(rowId);
//     const itemToDelete = data.find((row) => String(row._id) === rowIdStr);

//     if (!itemToDelete) return;

//     // Optimistic update
//     const previousData = [...data];
//     setData((prev) => prev.filter((row) => String(row._id) !== rowIdStr));

//     console.log(data);
//     console.log(rowId);
//     try {
//       const response = await fetch(
//         `${API_URL}/api/development/deactivate/${rowId}`,
//         {
//           method: "PATCH",
//         },
//       );

//       if (!response.ok) {
//         console.error("Failed to deactivate row in database");
//         setData(data);
//       }
//     } catch (error) {
//       console.error("Network error:", error);
//       setData(data);
//     }
//   };

//   const confirmDelete = async () => {
//     const { accessor } = deleteConfirmation;
//     try {
//       const res = await fetch(`${API_URL}/api/columns/deactivate/${accessor}`, {
//         method: "PATCH",
//       });

//       if (!res.ok) throw new Error("Failed to deactivate column");

//       setColumnsDef((prev) => prev.filter((col) => col.name !== accessor));
//       setDeleteConfirmation({
//         isOpen: false,
//         accessor: "",
//         label: "",
//         isDynamic: false,
//       });
//     } catch (err) {
//       console.error("Deactivation failed:", err);
//       alert("Error: " + err.message);
//     }
//   };

//   const cancelDelete = () => {
//     setDeleteConfirmation({
//       isOpen: false,
//       accessor: "",
//       label: "",
//       isDynamic: false,
//     });
//   };

//   /* ---------------- ADD ROW ---------------- */
//   const addRow = async (newRowData) => {
//     // Clear sorting and filters to ensure new row is visible at bottom
//     setSortConfig({ key: null, direction: "asc" });
//     setFilters({});

//     try {
//       const newRow = { ...newRowData };
//       columnsDef.forEach((col) => {
//         if (!newRow.hasOwnProperty(col.name)) {
//           newRow[col.name] = "";
//         }
//       });

//       const res = await fetch(`${API_URL}/api/development`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newRow),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Failed to add row");
//       }

//       const saved = await res.json();
//       setData((prev) => [...prev, saved]);
//       setIsModalOpen(false); // Close modal after saving

//       // Scroll to bottom
//       const tableWrap = document.querySelector(".table-wrap");
//       if (tableWrap) {
//         tableWrap.scrollTop = tableWrap.scrollHeight;
//       }
//     } catch (err) {
//       console.error("Error adding row:", err);
//       alert("Error adding row: " + err.message);
//     }
//   };

//   const [userData, setUserData] = useState([]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/user`);
//         const data = await response.json();
//         setUserData(data);
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//       }
//     };
//     fetchUsers();
//   }, []);

//   const [columnAccess, setColumnAccess] = useState([]);

//   const handleColumnAccess = async (columnName) => {
//     // try {
//     //     const response = await fetch(`${aPI_URL}/api/user/column-access`, {
//     //         method: "PATCH",
//     //         headers: {
//     //             "Content-Type": "application/json",
//     //         },
//     //         body: JSON.stringify({ columnName }),
//     //     });
//     //     if (response.ok) {
//     //         const data = await response.json();
//     //         console.log(data.message);
//     //         alert(`Access for "${columnName}" granted to all staff`);
//     //     } else {
//     //         console.error("Failed to update column access");
//     //     }
//     // } catch (err) {
//     //     console.error("Error updating column access:", err);
//     // }
//   };

//   // Define allowed columns for staff
//   const valuesToMatch = useMemo(() => {
//     if (!status?.column_access) return [];
//     return status.column_access
//       .split(",")
//       .map((item) => item.trim().toLowerCase());
//   }, [status]);

//   // Check if user can edit this column
//   const canEdit = (columnName) => {
//     if (!status) return false;
//     if (status.status === "admin") return true;
//     if (status.status === "staff") {
//       return valuesToMatch.includes(columnName.toLowerCase());
//     }
//     return false;
//   };

//   /* ---------------- RENAME COLUMN ---------------- */
//   const handleRename = async (oldName, newName) => {
//     if (!newName || oldName === newName) return;
//     const trimmedNewName = newName.trim();
//     if (!trimmedNewName || oldName === trimmedNewName) return;

//     try {
//       const res = await fetch(`${API_URL}/api/columns/${oldName}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ newHeading: trimmedNewName }),
//       });

//       if (!res.ok) throw new Error("Failed to rename column heading");

//       setColumnsDef((prev) =>
//         prev.map((col) =>
//           col.name === oldName
//             ? { ...col, column_heading: trimmedNewName }
//             : col,
//         ),
//       );
//     } catch (err) {
//       console.error("Column rename failed:", err);
//       alert("Rename failed: " + err.message);
//     }
//   };

//   /* ---------------- DYNAMIC COLUMNS ---------------- */
//   const columns = useMemo(() => {
//     const baseColumns = [
//       {
//         header: (
//           <div className="d-flex flex-column gap-2 align-items-center"></div>
//         ),
//         accessor: "index",
//         render: (row, rowIndex) =>
//           columnsDef.length > 1 ? (
//             <div
//               className="row_index"
//               onMouseEnter={() => setHoveredRowIndex(rowIndex)}
//               onMouseLeave={() => setHoveredRowIndex(null)}
//             >
//               {status.status === "admin" ? (
//                 hoveredRowIndex === rowIndex ? (
//                   <button
//                     onClick={(e) => deleteRow(row._id, e)}
//                     className=" btn btn-link text-danger p-0"
//                     type="button"
//                   >
//                     <FaTrash className="delete-icon" size={14} />
//                   </button>
//                 ) : (
//                   <span>{rowIndex + 1}</span>
//                 )
//               ) : (
//                 <span>{rowIndex + 1}</span>
//               )}
//             </div>
//           ) : null,
//       },
//       ...columnsDef.map((col) => ({
//         header: (
//           <div className="d-flex flex-column gap-2">
//             <div className="d-flex align-items-center justify-content-between gap-2">
//               <div className="d-flex align-items-center gap-2 flex-grow-1">
//                 <input
//                   defaultValue={col.column_heading}
//                   className="header-edit-input flex-grow-1 text-dark"
//                   {...(status.status === "admin"
//                     ? {
//                         onBlur: (e) => handleRename(col.name, e.target.value),
//                         onKeyDown: (e) => e.key === "Enter" && e.target.blur(),
//                       }
//                     : { readOnly: true })}
//                 />
//                 {/* {status.status === 'admin' && (
//                                     // <button type="button" onClick={() => handleColumnAccess(col.name)}>
//                                     //     Toggle
//                                     // </button>
//                                 )} */}
//                 {col.sorting && (
//                   <button
//                     className="btn btn-link p-0 text-dark"
//                     onClick={() => requestSort(col.name)}
//                     title={`Sort by ${col.column_heading}`}
//                   >
//                     {sortConfig.key === col.name
//                       ? sortConfig.direction === "asc"
//                         ? "↑"
//                         : "↓"
//                       : "↕"}
//                   </button>
//                 )}
//               </div>
//               {isDelete && (
//                 <button
//                   className="btn btn-link text-danger p-0"
//                   onClick={() => handleDeleteClick(col)}
//                   title="Deactivate Column"
//                 >
//                   <FaTrash className="delete-icon" size={14} />
//                 </button>
//               )}
//             </div>
//             {isFilterOpen && col.sorting && (
//               <div className="filter-row-input">
//                 <div className="filter-input-wrapper">
//                   {col.column_type === "select" ? (
//                     <select
//                       className="form-control form-control-sm text-dark"
//                       value={filters[col.name] || ""}
//                       onChange={(e) =>
//                         handleFilterChange(col.name, e.target.value)
//                       }
//                     >
//                       <option value="">All</option>
//                       {(col.multipleValue || []).map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     <input
//                       type={
//                         col.column_type === "date"
//                           ? "date"
//                           : col.column_type === "number"
//                             ? "number"
//                             : "text"
//                       }
//                       className="form-control form-control-sm text-dark"
//                       placeholder={`Filter ${col.column_heading}...`}
//                       value={filters[col.name] || ""}
//                       onChange={(e) =>
//                         handleFilterChange(col.name, e.target.value)
//                       }
//                     />
//                   )}
//                   {filters[col.name] && (
//                     <button
//                       type="button"
//                       className="filter-clear-btn"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleFilterChange(col.name, "");
//                       }}
//                       title="Clear filter"
//                     >
//                       <FaTimes size={12} />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         ),
//         accessor: col.name,
//         render: (row) => {
//           const value = row[col.name] || "";

//           // Special handling for Overdue column

//           if (
//             col.name === "overdue" ||
//             col.column_heading.toLowerCase() === "overdue"
//           ) {
//             const endDateValue = row["end_date"] || row["endDate"] || "";
//             const overdueInfo = calculateOverdue(endDateValue);
//             return (
//               <div className={overdueInfo.className}>{overdueInfo.text}</div>
//             );
//           }

//           // Special handling for Condition columns (date difference calculation)
//           if (col.column_type === "condition") {
//             const startDate = row[col.conditionColumn1];
//             const endDate = row[col.conditionColumn2];

//             if (!startDate || !endDate) {
//               return <span className="text-muted">-</span>;
//             }

//             try {
//               const start = new Date(startDate);
//               const end = new Date(endDate);

//               if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//                 return <span className="text-muted">Invalid dates</span>;
//               }

//               const diffTime = end - start;
//               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//               return <span>{Math.abs(diffDays)} days</span>;
//             } catch (err) {
//               return <span className="text-muted">Error</span>;
//             }
//           }

//           if (col.column_type === "select") {
//             return (
//               <select
//                 value={value}
//                 className="bg-transparent border-0 w-100 text-dark"
//                 onChange={(e) =>
//                   handleChange(row._id, col.name, e.target.value)
//                 }
//                 disabled={!canEdit(col.name)}
//               >
//                 <option value="">Select</option>
//                 {(col.multipleValue || []).map((opt) => (
//                   <option key={opt} value={opt}>
//                     {opt}
//                   </option>
//                 ))}
//               </select>
//             );
//           }

//           return (
//             <input
//               type={
//                 col.column_type === "date"
//                   ? "date"
//                   : col.column_type === "number"
//                     ? "number"
//                     : "text"
//               }
//               value={value}
//               className="bg-transparent border-0 w-100 text-dark"
//               onChange={(e) => handleChange(row._id, col.name, e.target.value)}
//               disabled={!canEdit(col.name)}
//             />
//           );
//         },
//       })),
//     ];
//     return baseColumns;
//   }, [
//     columnsDef,
//     data,
//     isDelete,
//     isFilterOpen,
//     filters,
//     sortConfig,
//     activeSuggestionField,
//     clearFilters,
//     hoveredRowIndex,
//     status,
//     valuesToMatch,
//   ]);

//   return (
//     <section className="">
//       <div className="d-flex align-items-center gap-2 justify-content-end mb-4">
//         <button
//           onClick={handleFilterClick}
//           className={`btn ${isFilterOpen ? "btn-dark" : "btn-outline-dark"}`}
//           title="Toggle Filters"
//         >
//           <svg
//             viewBox="0 0 24 24"
//             fill="none"
//             style={{ width: "16px", height: "16px" }}
//             xmlnsXlink="http://www.w3.org/2000/svg"
//           >
//             <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
//             <g
//               id="SVGRepo_tracerCarrier"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             ></g>
//             <g id="SVGRepo_iconCarrier">
//               <path
//                 fillRule="evenodd"
//                 clipRule="evenodd"
//                 d="M15 10.5A3.502 3.502 0 0 0 18.355 8H21a1 1 0 1 0 0-2h-2.645a3.502 3.502 0 0 0-6.71 0H3a1 1 0 0 0 0 2h8.645A3.502 3.502 0 0 0 15 10.5zM3 16a1 1 0 1 0 0 2h2.145a3.502 3.502 0 0 0 6.71 0H21a1 1 0 1 0 0-2h-9.145a3.502 3.502 0 0 0-6.71 0H3z"
//                 fill="currentColor"
//               ></path>
//             </g>
//           </svg>
//         </button>
//         {status?.status === "admin" ? (
//           <button
//             onClick={handleColumnEditClick}
//             className={`btn ${isDelete ? "btn-dark" : "btn-outline-dark"}`}
//             title="Toggle Edit Mode"
//           >
//             <svg
//               fill="currentColor"
//               width="16"
//               height="16"
//               viewBox="0 0 528.899 528.899"
//             >
//               <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path>
//             </svg>
//           </button>
//         ) : null}
//         {status?.status === "admin" ? (
//           <button className="btn btn-outline-dark" onClick={() => addRow()}>
//             Create Row
//           </button>
//         ) : null}
//         {status?.status === "admin" ? (
//           <button
//             className="btn btn-outline-dark"
//             onClick={() => setIsColumnModalOpen(true)}
//           >
//             Create Column
//           </button>
//         ) : null}
//         {/* {isDelete && (
//                     <button
//                         onClick={() => setIsDelete(false)}
//                         className="btn btn-outline-danger"
//                         title="Cancel Edit Mode"
//                         style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                     >
//                         <FaTimes size={16} />
//                     </button>
//                 )} */}
//       </div>

//       <div className="row">
//         <FilterSidebar
//           ref={filterSidebarRef}
//           filters={filters}
//           isOpen={isFilterOpen}
//           status={status}
//           handleFilterChange={handleFilterChange}
//           handleChange={handleChange}
//           onFilterSelect={handleFilterSelect}
//           currentFilters={filters}
//           userId={status?._id}
//           clearFilters={clearFilters}
//           setIsSaveFilterModalOpen={setIsSaveFilterModalOpen}
//           handleDeleteFilter={handleDeleteFilter}
//         />

//         <div className="col-md-10 col-sm-8">
//           {loading ? (
//             <div className="loading-spinner">
//               <div className="spinner"></div>
//               <p className="small">Loading ...</p>
//             </div>
//           ) : (
//             <Table columns={columns} data={filteredAndSortedData} />
//           )}
//         </div>
//       </div>
//       <Form
//         showColumnHeading={true}
//         showDataType={true}
//         showSortable={true}
//         isPopupOpen={isColumnModalOpen}
//         onPopupClose={() => setIsColumnModalOpen(false)}
//         availableColumns={columnsDef}
//         onPopupSave={async (newColumn) => {
//           try {
//             const res = await fetch(`${API_URL}/api/columns`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify(newColumn),
//             });

//             if (!res.ok) {
//               const errorData = await res.json();
//               throw new Error(errorData.error || "Failed to save column");
//             }

//             const saved = await res.json();
//             setColumnsDef((prev) => [...prev, saved]);
//             console.log("saved", saved);
//             console.log("columnsDef", columnsDef);
//           } catch (err) {
//             console.error("Error saving column:", err);
//             alert("Error saving column: " + err.message);
//           }
//         }}
//       />

//       {deleteConfirmation.isOpen && (
//         <div
//           className="delete-confirmation-overlay"
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 1000,
//           }}
//         >
//           <div
//             className="delete-confirmation-modal"
//             style={{
//               backgroundColor: "white",
//               padding: "20px",
//               borderRadius: "8px",
//               textAlign: "center",
//               boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
//             }}
//           >
//             <h4>Delete Column</h4>
//             <p>
//               Are you sure you want to delete the column "
//               <strong>{deleteConfirmation.label}</strong>"?
//             </p>
//             <div className="d-flex justify-content-center gap-2 mt-3">
//               <button className="btn btn-danger me-2" onClick={confirmDelete}>
//                 Yes
//               </button>
//               <button className="btn btn-secondary" onClick={cancelDelete}>
//                 No
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SaveFilterModal
//         isOpen={isSaveFilterModalOpen}
//         onClose={() => setIsSaveFilterModalOpen(false)}
//         onSave={handleSaveFilter}
//         filters={filters}
//       />
//     </section>
//   );
// }

// export default TableColumns;
