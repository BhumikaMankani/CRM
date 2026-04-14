import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { IoCloseSharp } from "react-icons/io5";
import MatchColumn from "./MatchColumn";
import { FaRegImages } from "react-icons/fa";
import "./Excel.css"

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

            console.log("Excel Data:", json);

            setExcelData(json);
            setIsModelOpen(true);
        };

        reader.readAsArrayBuffer(file);
    };

    // 🚀 SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        let errors = [];

        // STEP 1: GET MATCH FIELDS (from checkbox)
        const matchFields = columns
            .filter(col => col.isMatched)
            .map(col => col.name);

        console.log("Match Fields:", matchFields);

        if (matchFields.length === 0) {
            alert("Please select at least one match field");
            return;
        }

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

                let newRow = {};
                let updatePayload = {};

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
                        // UPDATE
                        return fetch(
                            `${API_URL}/api/data/${matchedRow._id}?collectionName=${dataCollection}`,
                            {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                // body: JSON.stringify(newRow),
                                body: JSON.stringify({
                                    ...newRow,
                                    createdByUserId,
                                    createdByUserName
                                }),
                            }
                        ).then(res => res.json());
                    } else {
                        // CREATE
                        return fetch(`${API_URL}${dataEndpoint}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...newRow, createdByUserId, createdByUserName, uploadedByExcel: true }),
                        }).then(res => res.json());
                    }
                } catch (err) {
                    console.error("Error:", err);
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