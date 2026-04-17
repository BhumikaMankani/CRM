// import React, { useEffect, useState, useRef } from 'react';
// import * as XLSX from 'xlsx';
// import { IoCloseSharp } from "react-icons/io5";
// import MatchColumn from "./MatchColumn";
// import { FaRegImages } from "react-icons/fa";
// import "./Excel.css"

// function ExcelToJson({
//     columns,
//     setData,
//     isUploadModelOpen,
//     setIsUploadModelOpen,
//     dataCollection,
//     data,
//     API_URL,
//     dataEndpoint
// }) {
//     const [excelData, setExcelData] = useState([]);
//     const [isModelOpen, setIsModelOpen] = useState(false);
//     const [mapping, setMapping] = useState({});
//     const fileInputRef = useRef(null);

//     let createdByUserName = "Unknown";
//     let createdByUserId = null;
//     try {
//         const storedUser = localStorage.getItem("user");
//         if (storedUser) {
//             const parsed = JSON.parse(storedUser);
//             createdByUserName = parsed.user_name || parsed.email || "Unknown";
//             createdByUserId = parsed.email || null;
//         }
//     } catch (e) {
//         // ignore
//     }
//     useEffect(() => {
//         // optional if needed
//     }, [columns, data]);

//     const onClose = () => {
//         setIsModelOpen(false);
//         fileInputRef.current.value = "";
//     };

//     // FILE UPLOAD
//     const handleFileUpload = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         const reader = new FileReader();

//         reader.onload = (event) => {
//             const workbook = XLSX.read(event.target.result, { type: "array" });
//             const sheetName = workbook.SheetNames[0];
//             const sheet = workbook.Sheets[sheetName];
//             const json = XLSX.utils.sheet_to_json(sheet);

//             // console.log("Excel Data:", json);

//             setExcelData(json);
//             setIsModelOpen(true);
//         };

//         reader.readAsArrayBuffer(file);
//     };

//     // Main project logic
//     const handleMainProjectCreate = async (savedRow, newRow) => {
//         try {
//             const projectColumn = columns.find(col => col.showInMainProject);
//             const taskColumn = columns.find(col =>
//                 col.isMatched === true
//             );

//             const projectName = newRow[projectColumn?.name];
//             const taskName = newRow[taskColumn?.name];

//             if (!projectName) return savedRow;

//             const mpRes = await fetch(`${API_URL}/api/mainProject`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     projectId: savedRow._id,
//                     projectName,
//                     taskName,
//                     taskDepartment: dataCollection
//                 }),
//             });

//             if (mpRes.ok) {
//                 const responseData = await mpRes.json();
//                 const mainProjectList = responseData.data;

//                 if (mainProjectList && mainProjectList.length > 0) {
//                     const newMainProjectId = mainProjectList[0]._id;

//                     // attach locally
//                     savedRow.mainProjectId = newMainProjectId;

//                     // update DB row
//                     await fetch(
//                         `${API_URL}/api/data/${savedRow._id}?collectionName=${dataCollection}`,
//                         {
//                             method: "PUT",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify({ mainProjectId: newMainProjectId }),
//                         }
//                     );
//                 }
//             }

//             return savedRow;

//         } catch (err) {
//             console.error("MainProject Error:", err);
//             return savedRow;
//         }
//     };
//     // 🚀 SUBMIT
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         let errors = [];

//         // STEP 1: GET MATCH FIELDS (from checkbox)
//         const matchFields = columns
//             .filter(col => col.isMatched)
//             .map(col => col.name);
//         // const mainProject = columns.filter(col => col.showInMainProject === true).map(col => col.name);
//         // console.log("Match Fields:", matchFields);

//         const projectColumn = columns.find(col => col.showInMainProject === true);
//         // console.log("projectColumn", projectColumn);

//         const projectField = projectColumn?.name;
//         const taskColumn = columns.find(col => col.isMatched === true);
//         const taskField = taskColumn?.name;
//         // console.log("projectField", projectField);
//         const existingProjectSet = new Set(
//             data.map(d =>
//                 d[projectField]?.toString().trim().toLowerCase()
//             )
//         );
//         // console.log("existingProjectSet", existingProjectSet);

//         const dailyCheckColumn = columns.find(col =>
//             col.hasDefaultValue === true
//         )
//         // Identify status column for automatic defaulting if not mapped
//         const statusColumn = columns.find(col =>
//             col.column_heading.toLowerCase().includes("status") ||
//             col.name.toLowerCase().includes("status")
//         );
//         const dailyCheckColumnName = dailyCheckColumn ? dailyCheckColumn.name : null;
//         const statusFieldName = statusColumn ? statusColumn.name : null;
//         const isStatusMapped = statusFieldName && Object.values(mapping).includes(statusFieldName);
//         const isDailyCheckMapped = dailyCheckColumnName && Object.values(mapping).includes(dailyCheckColumnName);

//         const chunkSize = 20; // 🔥 control load (10–50 best)

//         const convertExcelDateSafe = (value) => {
//             if (!value) return null;

//             let date;

//             if (typeof value === "number") {
//                 const utc_days = Math.floor(value - 25569);
//                 const utc_value = utc_days * 86400;
//                 date = new Date(utc_value * 1000);
//             } else {
//                 date = new Date(value);
//             }

//             if (!date) return null;

//             const yyyy = date.getFullYear();
//             const mm = String(date.getMonth() + 1).padStart(2, "0");
//             const dd = String(date.getDate()).padStart(2, "0");

//             return {
//                 inputFormat: `${yyyy}-${mm}-${dd}`,
//                 monthYear: date.toLocaleString("default", {
//                     month: "long",
//                     year: "numeric"
//                 })
//             };
//         };

//         // 🔥 PROCESS IN CHUNKS
//         for (let i = 0; i < excelData.length; i += chunkSize) {

//             const chunk = excelData.slice(i, i + chunkSize);

//             const promises = chunk.map(async (excelRow) => {
//                 // console.log("excelRow", excelRow);
//                 const excelKeyForProject = Object.keys(mapping).find(
//                     (k) => mapping[k] === taskField
//                 );

//                 if (!excelKeyForProject) return null;

//                 const excelValueRaw = excelRow[excelKeyForProject];
//                 if (!excelValueRaw) return null;

//                 const normalizedValue = excelValueRaw.toString().trim();
//                 const lowerValue = normalizedValue.toLowerCase();
//                 // console.log("lowerCalue", lowerValue);
//                 if (existingProjectSet.has(lowerValue)) {
//                     // console.log("⛔ Skipping duplicate:", normalizedValue);
//                     return null;
//                 }

//                 // ✅ Prevent duplicates inside same Excel upload
//                 existingProjectSet.add(lowerValue);
//                 let newRow = {};

//                 // 🔁 STEP 1: BUILD ROW
//                 Object.keys(mapping).forEach((excelKey) => {
//                     const dbKey = mapping[excelKey];
//                     const excelValue = excelRow[excelKey];

//                     if (!dbKey || dbKey === "__SKIP__") return;

//                     // 🔥 SPECIAL DATE HANDLING
//                     if (dbKey === "Date and month") {
//                         const converted = convertExcelDateSafe(excelValue);

//                         if (converted) {
//                             const { inputFormat, monthYear } = converted;

//                             const dateColumns = columns.filter(c => c.column_type === "date");
//                             const monthCol = columns.find(c => c.column_type === "monthYear");

//                             dateColumns.forEach(col => {
//                                 newRow[col.name] = inputFormat;
//                             });

//                             if (monthCol) {
//                                 newRow[monthCol.name] = monthYear;
//                             }
//                         }

//                         return;
//                     }
//                     // newRow[mainProject] = excelValue;
//                     newRow[projectField] = normalizedValue;

//                     // Task = Project (as per your requirement)
//                     const taskColumn = columns.find(col =>
//                         col.name.toLowerCase().includes("task")
//                     );

//                     if (taskColumn) {
//                         newRow[taskColumn.name] = normalizedValue;
//                     }
//                     console.log("taskColumn", taskColumn);
//                     newRow[dbKey] = excelValue;
//                 });

//                 // If status column exists but not mapped, default to "COMPLETED"
//                 if (statusFieldName && !isStatusMapped) {
//                     newRow[statusFieldName] = "Archived";
//                 }

//                 if (dailyCheckColumnName && !isDailyCheckMapped) {
//                     newRow[dailyCheckColumnName] = "No";
//                 }

//                 // 🔍 STEP 2: MATCH
//                 const matchedRow = data.find((d) => {
//                     return matchFields.every((field) => {
//                         const excelKey = Object.keys(mapping).find(
//                             (k) => mapping[k] === field
//                         );
//                         if (!excelKey) return false;

//                         return (
//                             d[field]?.toString().trim().toLowerCase() ===
//                             excelRow[excelKey]?.toString().trim().toLowerCase()
//                         );
//                     });
//                 });

//                 try {
//                     if (matchedRow) {
//                         return null;
//                     } else {
//                         // CREATE
//                         return fetch(`${API_URL}${dataEndpoint}`, {
//                             method: "POST",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify({
//                                 ...newRow,
//                                 createdByUserId,
//                                 createdByUserName,
//                                 uploadedByExcel: true
//                             }),
//                         })
//                             .then(res => res.json())
//                             .then(async (saved) => {
//                                 // 🔥 ADD THIS LINE
//                                 const updatedRow = await handleMainProjectCreate(saved, newRow);
//                                 return updatedRow;
//                             });
//                         // return fetch(`${API_URL}${dataEndpoint}`, {
//                         //     method: "POST",
//                         //     headers: { "Content-Type": "application/json" },
//                         //     body: JSON.stringify({ ...newRow, createdByUserId, createdByUserName, uploadedByExcel: true }),
//                         // }).then(res => res.json());
//                     }
//                 } catch (err) {
//                     console.error("Error:", err);
//                     return null;
//                 }
//             });

//             // 🔥 WAIT FOR CHUNK
//             const results = await Promise.all(promises);

//             // 🔥 UPDATE UI ONCE PER CHUNK (NOT PER ROW)
//             setData((prev) => [
//                 ...results.filter(Boolean),
//                 ...prev
//             ]);
//         }
//         if (errors.length) {
//             console.log("Errors:", errors);
//             alert(errors.join("\n"));
//         }

//         setIsUploadModelOpen(false);
//         setIsModelOpen(false);
//         fileInputRef.current.value = "";
//     };

//     return (
//         <div className="modal fade show d-block" tabIndex="-1">
//             <div className="modal-dialog modal-dialog-centered">
//                 <div className="modal-content shadow-lg border-0 rounded-4">

//                     {/* HEADER */}
//                     <div className="modal-header border-0" style={{ "padding": "0px" }}>
//                         <h5 className="modal-title fw-bold">Select Excel File</h5>
//                         <button
//                             type="button"
//                             className="btn-close"
//                             onClick={() => setIsUploadModelOpen(false)}
//                         ></button>
//                     </div>

//                     {/* BODY */}
//                     <div className="modal-body text-center" style={{ "paddingLeft": "0px", "paddingRight": "0px", "paddingBottom": "0px" }}>

//                         {/* ICON */}
//                         {/* <div className="mb-3">
//                             <FaRegImages size={80} className="text-secondary" />
//                         </div> */}

//                         {/* TEXT */}
//                         {/* <p className="text-muted mb-3">
//                             Upload your Excel file to import data
//                         </p> */}

//                         {/* DROP AREA */}
//                         <div className="border border-2 border-dashed rounded-3 p-4 mb-3 bg-light">

//                             <p className="small text-muted mb-2">
//                                 Files Supported: <strong>.xlsx, .xls</strong>
//                             </p>

//                             <label className="btn btn-primary border-0">
//                                 Choose File
//                                 <input
//                                     type="file"
//                                     ref={fileInputRef}
//                                     accept=".xlsx, .xls"
//                                     onChange={handleFileUpload}
//                                     hidden
//                                 />
//                             </label>

//                             <p className="mt-2 small text-muted">
//                                 {fileInputRef?.current?.files?.[0]?.name || "No file selected"}
//                             </p>
//                         </div>
//                     </div>

//                     {/* MATCH COLUMN MODAL */}
//                     {isModelOpen && (
//                         <MatchColumn
//                             isModelOpen={isModelOpen}
//                             excelData={excelData}
//                             setExcelData={setExcelData}
//                             handleSubmit={handleSubmit}
//                             onClose={onClose}
//                             mapping={mapping}
//                             setMapping={setMapping}
//                             columns={columns}
//                             data={data}
//                         />
//                     )}

//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ExcelToJson;

import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { IoCloseSharp } from "react-icons/io5";
import MatchColumn from "./MatchColumn";
import { FaRegImages } from "react-icons/fa";
import "./Excel.css"

// ── Toast styles injected once ──────────────────────────────────────────────
const TOAST_STYLE = `
@keyframes _slideIn {
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes _slideOut {
  from { transform: translateX(0);    opacity: 1; }
  to   { transform: translateX(110%); opacity: 0; }
}
._toast-wrap {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
._toast {
  pointer-events: all;
  min-width: 300px;
  max-width: 380px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  border-left: 5px solid #4f46e5;
  padding: 14px 16px 12px;
  font-family: inherit;
  animation: _slideIn 0.35s cubic-bezier(.4,0,.2,1) forwards;
}
._toast.leaving {
  animation: _slideOut 0.3s cubic-bezier(.4,0,.2,1) forwards;
}
._toast.success  { border-left-color: #16a34a; }
._toast.warning  { border-left-color: #d97706; }
._toast.error    { border-left-color: #dc2626; }
._toast.info     { border-left-color: #4f46e5; }
._toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
._toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  display: flex;
  align-items: center;
  gap: 6px;
}
._toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  font-size: 16px;
  line-height: 1;
  padding: 0;
}
._toast-body {
  font-size: 13px;
  color: #444;
  line-height: 1.55;
}
._toast-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
._toast-badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
._badge-green  { background: #dcfce7; color: #15803d; }
._badge-yellow { background: #fef9c3; color: #92400e; }
._badge-red    { background: #fee2e2; color: #991b1b; }
._badge-gray   { background: #f1f5f9; color: #475569; }
._toast-divider {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 8px 0 6px;
}
._toast-footer {
  font-size: 11px;
  color: #aaa;
  margin-top: 4px;
}
`;

// ── Inject styles once ───────────────────────────────────────────────────────
if (!document.getElementById('_excel-toast-styles')) {
    const s = document.createElement('style');
    s.id = '_excel-toast-styles';
    s.textContent = TOAST_STYLE;
    document.head.appendChild(s);
}

// ── Toast container singleton ────────────────────────────────────────────────
function getToastContainer() {
    let el = document.getElementById('_toast-container');
    if (!el) {
        el = document.createElement('div');
        el.id = '_toast-container';
        el.className = '_toast-wrap';
        document.body.appendChild(el);
    }
    return el;
}

// ── Show toast ───────────────────────────────────────────────────────────────
function showImportToast({ added, skippedDuplicate, skippedBlank, skippedError, total }) {
    const container = getToastContainer();
    const toast = document.createElement('div');

    // decide overall tone
    let type = 'success';
    let icon = '✅';
    let title = 'Import Completed';

    if (added === 0 && skippedBlank > 0 && skippedDuplicate === 0) {
        type = 'error'; icon = '⚠️'; title = 'No Rows Imported';
    } else if (added === 0) {
        type = 'warning'; icon = '⚠️'; title = 'Nothing New to Import';
    } else if (skippedDuplicate > 0 || skippedBlank > 0 || skippedError > 0) {
        type = 'info'; icon = 'ℹ️'; title = 'Import Completed with Skips';
    }

    toast.className = `_toast ${type}`;

    // build reason rows
    let reasonRows = '';

    if (added > 0) {
        reasonRows += `
          <div class="_toast-row">
            <span class="_toast-badge _badge-green">+${added} added</span>
            <span>Rows successfully imported</span>
          </div>`;
    }

    if (skippedDuplicate > 0) {
        reasonRows += `
          <div class="_toast-row">
            <span class="_toast-badge _badge-yellow">${skippedDuplicate} skipped</span>
            <span>Already exist in the table</span>
          </div>`;
    }

    if (skippedBlank > 0) {
        reasonRows += `
          <div class="_toast-row">
            <span class="_toast-badge _badge-red">${skippedBlank} skipped</span>
            <span>Match column (ID) was blank</span>
          </div>`;
    }

    if (skippedError > 0) {
        reasonRows += `
          <div class="_toast-row">
            <span class="_toast-badge _badge-gray">${skippedError} skipped</span>
            <span>Could not be processed</span>
          </div>`;
    }

    // summary line
    let summaryText = '';
    if (added === 0 && total > 0) {
        summaryText = `All ${total} rows were skipped — nothing new was added.`;
    } else if (added === total) {
        summaryText = `All ${total} rows imported successfully.`;
    } else {
        summaryText = `${added} of ${total} rows imported.`;
    }

    toast.innerHTML = `
      <div class="_toast-header">
        <span class="_toast-title">${icon} ${title}</span>
        <button class="_toast-close" onclick="this.closest('._toast').remove()">✕</button>
      </div>
      <div class="_toast-body">
        <div style="margin-bottom:6px; font-size:13px; color:#555;">${summaryText}</div>
        <hr class="_toast-divider"/>
        ${reasonRows}
        <div class="_toast-footer" style="margin-top:8px;">
          ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>`;

    container.appendChild(toast);

    // auto-dismiss after 7s
    const timer = setTimeout(() => {
        toast.classList.add('leaving');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 7000);

    // cancel auto-dismiss on hover
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => {
        setTimeout(() => {
            toast.classList.add('leaving');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, 2000);
    });
}

// ── Main Component ────────────────────────────────────────────────────────────
function ExcelToJson({
    columns,
    setData,
    isUploadModelOpen,
    setIsUploadModelOpen,
    dataCollection,
    data,
    API_URL,
    dataEndpoint
}) {
    const [excelData, setExcelData] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [mapping, setMapping] = useState({});
    const fileInputRef = useRef(null);

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
    useEffect(() => {
        // optional if needed
    }, [columns, data]);

    const onClose = () => {
        setIsModelOpen(false);
        fileInputRef.current.value = "";
    };

    // FILE UPLOAD
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);

            // console.log("Excel Data:", json);

            setExcelData(json);
            setIsModelOpen(true);
        };

        reader.readAsArrayBuffer(file);
    };

    // Main project logic
    const handleMainProjectCreate = async (savedRow, newRow) => {
        try {
            const projectColumn = columns.find(col => col.showInMainProject);
            const taskColumn = columns.find(col =>
                col.isMatched === true
            );

            const projectName = newRow[projectColumn?.name];
            const taskName = newRow[taskColumn?.name];

            if (!projectName) return savedRow;

            const mpRes = await fetch(`${API_URL}/api/mainProject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: savedRow._id,
                    projectName,
                    taskName,
                    taskDepartment: dataCollection
                }),
            });

            if (mpRes.ok) {
                const responseData = await mpRes.json();
                const mainProjectList = responseData.data;

                if (mainProjectList && mainProjectList.length > 0) {
                    const newMainProjectId = mainProjectList[0]._id;

                    // attach locally
                    savedRow.mainProjectId = newMainProjectId;

                    // update DB row
                    await fetch(
                        `${API_URL}/api/data/${savedRow._id}?collectionName=${dataCollection}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ mainProjectId: newMainProjectId }),
                        }
                    );
                }
            }

            return savedRow;

        } catch (err) {
            console.error("MainProject Error:", err);
            return savedRow;
        }
    };

    // 🚀 SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        let errors = [];

        // ── counters for toast ──────────────────────────────────────────────
        let countAdded = 0;
        let countSkippedDuplicate = 0;
        let countSkippedBlank = 0;
        let countSkippedError = 0;
        const totalRows = excelData.length;
        // ───────────────────────────────────────────────────────────────────

        // STEP 1: GET MATCH FIELDS (from checkbox)
        const matchFields = columns
            .filter(col => col.isMatched)
            .map(col => col.name);
        // const mainProject = columns.filter(col => col.showInMainProject === true).map(col => col.name);
        // console.log("Match Fields:", matchFields);

        const projectColumn = columns.find(col => col.showInMainProject === true);
        // console.log("projectColumn", projectColumn);

        const projectField = projectColumn?.name;
        const taskColumn = columns.find(col => col.isMatched === true);
        const taskField = taskColumn?.name;
        // console.log("projectField", projectField);
        const existingProjectSet = new Set(
            data.map(d =>
                d[projectField]?.toString().trim().toLowerCase()
            )
        );
        // console.log("existingProjectSet", existingProjectSet);

        const dailyCheckColumn = columns.find(col =>
            col.hasDefaultValue === true
        )
        // Identify status column for automatic defaulting if not mapped
        const statusColumn = columns.find(col =>
            col.column_heading.toLowerCase().includes("status") ||
            col.name.toLowerCase().includes("status")
        );
        const dailyCheckColumnName = dailyCheckColumn ? dailyCheckColumn.name : null;
        const statusFieldName = statusColumn ? statusColumn.name : null;
        const isStatusMapped = statusFieldName && Object.values(mapping).includes(statusFieldName);
        const isDailyCheckMapped = dailyCheckColumnName && Object.values(mapping).includes(dailyCheckColumnName);

        const chunkSize = 20; // 🔥 control load (10–50 best)

        const convertExcelDateSafe = (value) => {
            if (!value) return null;

            let date;

            if (typeof value === "number") {
                const utc_days = Math.floor(value - 25569);
                const utc_value = utc_days * 86400;
                date = new Date(utc_value * 1000);
            } else {
                date = new Date(value);
            }

            if (!date) return null;

            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");

            return {
                inputFormat: `${yyyy}-${mm}-${dd}`,
                monthYear: date.toLocaleString("default", {
                    month: "long",
                    year: "numeric"
                })
            };
        };

        // 🔥 PROCESS IN CHUNKS
        for (let i = 0; i < excelData.length; i += chunkSize) {

            const chunk = excelData.slice(i, i + chunkSize);

            const promises = chunk.map(async (excelRow) => {
                // console.log("excelRow", excelRow);
                const excelKeyForProject = Object.keys(mapping).find(
                    (k) => mapping[k] === taskField
                );

                if (!excelKeyForProject) {
                    countSkippedBlank++;   // ← mapped column not found
                    return null;
                }

                const excelValueRaw = excelRow[excelKeyForProject];
                if (!excelValueRaw) {
                    countSkippedBlank++;   // ← isMatched column value is blank
                    return null;
                }

                const normalizedValue = excelValueRaw.toString().trim();
                const lowerValue = normalizedValue.toLowerCase();
                // console.log("lowerCalue", lowerValue);
                if (existingProjectSet.has(lowerValue)) {
                    // console.log("⛔ Skipping duplicate:", normalizedValue);
                    countSkippedDuplicate++;   // ← already exists in DB
                    return null;
                }

                // ✅ Prevent duplicates inside same Excel upload
                existingProjectSet.add(lowerValue);
                let newRow = {};

                // 🔁 STEP 1: BUILD ROW
                Object.keys(mapping).forEach((excelKey) => {
                    const dbKey = mapping[excelKey];
                    const excelValue = excelRow[excelKey];

                    if (!dbKey || dbKey === "__SKIP__") return;

                    // 🔥 SPECIAL DATE HANDLING
                    if (dbKey === "Date and month") {
                        const converted = convertExcelDateSafe(excelValue);

                        if (converted) {
                            const { inputFormat, monthYear } = converted;

                            const dateColumns = columns.filter(c => c.column_type === "date");
                            const monthCol = columns.find(c => c.column_type === "monthYear");

                            dateColumns.forEach(col => {
                                newRow[col.name] = inputFormat;
                            });

                            if (monthCol) {
                                newRow[monthCol.name] = monthYear;
                            }
                        }

                        return;
                    }
                    // newRow[mainProject] = excelValue;
                    newRow[projectField] = normalizedValue;

                    // Task = Project (as per your requirement)
                    const taskColumn = columns.find(col =>
                        col.name.toLowerCase().includes("task")
                    );

                    if (taskColumn) {
                        newRow[taskColumn.name] = normalizedValue;
                    }
                    console.log("taskColumn", taskColumn);
                    newRow[dbKey] = excelValue;
                });

                // If status column exists but not mapped, default to "COMPLETED"
                if (statusFieldName && !isStatusMapped) {
                    newRow[statusFieldName] = "Archived";
                }

                if (dailyCheckColumnName && !isDailyCheckMapped) {
                    newRow[dailyCheckColumnName] = "No";
                }

                // 🔍 STEP 2: MATCH
                const matchedRow = data.find((d) => {
                    return matchFields.every((field) => {
                        const excelKey = Object.keys(mapping).find(
                            (k) => mapping[k] === field
                        );
                        if (!excelKey) return false;

                        return (
                            d[field]?.toString().trim().toLowerCase() ===
                            excelRow[excelKey]?.toString().trim().toLowerCase()
                        );
                    });
                });

                try {
                    if (matchedRow) {
                        countSkippedDuplicate++;   // ← matched row already exists
                        return null;
                    } else {
                        // CREATE
                        return fetch(`${API_URL}${dataEndpoint}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...newRow,
                                createdByUserId,
                                createdByUserName,
                                uploadedByExcel: true
                            }),
                        })
                            .then(res => res.json())
                            .then(async (saved) => {
                                countAdded++;   // ← successfully added
                                // 🔥 ADD THIS LINE
                                const updatedRow = await handleMainProjectCreate(saved, newRow);
                                return updatedRow;
                            });
                    }
                } catch (err) {
                    console.error("Error:", err);
                    countSkippedError++;   // ← unexpected error
                    return null;
                }
            });

            // 🔥 WAIT FOR CHUNK
            const results = await Promise.all(promises);

            // 🔥 UPDATE UI ONCE PER CHUNK (NOT PER ROW)
            setData((prev) => [
                ...results.filter(Boolean),
                ...prev
            ]);
        }

        if (errors.length) {
            console.log("Errors:", errors);
            alert(errors.join("\n"));
        }

        // ── Show toast summary ──────────────────────────────────────────────
        showImportToast({
            added: countAdded,
            skippedDuplicate: countSkippedDuplicate,
            skippedBlank: countSkippedBlank,
            skippedError: countSkippedError,
            total: totalRows,
        });
        // ───────────────────────────────────────────────────────────────────

        setIsUploadModelOpen(false);
        setIsModelOpen(false);
        fileInputRef.current.value = "";
    };

    return (
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-4">

                    {/* HEADER */}
                    <div className="modal-header border-0" style={{ "padding": "0px" }}>
                        <h5 className="modal-title fw-bold">Select Excel File</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setIsUploadModelOpen(false)}
                        ></button>
                    </div>

                    {/* BODY */}
                    <div className="modal-body text-center" style={{ "paddingLeft": "0px", "paddingRight": "0px", "paddingBottom": "0px" }}>

                        {/* ICON */}
                        {/* <div className="mb-3">
                            <FaRegImages size={80} className="text-secondary" />
                        </div> */}

                        {/* TEXT */}
                        {/* <p className="text-muted mb-3">
                            Upload your Excel file to import data
                        </p> */}

                        {/* DROP AREA */}
                        <div className="border border-2 border-dashed rounded-3 p-4 mb-3 bg-light">

                            <p className="small text-muted mb-2">
                                Files Supported: <strong>.xlsx, .xls</strong>
                            </p>

                            <label className="btn btn-primary border-0">
                                Choose File
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    hidden
                                />
                            </label>

                            <p className="mt-2 small text-muted">
                                {fileInputRef?.current?.files?.[0]?.name || "No file selected"}
                            </p>
                        </div>
                    </div>

                    {/* MATCH COLUMN MODAL */}
                    {isModelOpen && (
                        <MatchColumn
                            isModelOpen={isModelOpen}
                            excelData={excelData}
                            setExcelData={setExcelData}
                            handleSubmit={handleSubmit}
                            onClose={onClose}
                            mapping={mapping}
                            setMapping={setMapping}
                            columns={columns}
                            data={data}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}

export default ExcelToJson;
