import { useState, useEffect } from "react";
import "./error.css";
import { IoCloseSharp } from "react-icons/io5";

function MatchColumn({ isModelOpen, onClose, excelData, handleSubmit, columns, data, setMapping, mapping }) {
    const [error, setError] = useState("");
    // const [extraValues, setExtraValues] = useState({});
    // const selectedColumns = Object.values(mapping);
    const normalizeKey = (key) => {
        return key
            ?.toLowerCase()
            .replace(/\s+/g, "")     // remove spaces
            .replace(/[_-]/g, "");   // remove _ and -
    };

    const rawDefaultMapping = {
        "STORETITLE": "project1768984734240",
        "MYSHOPIFYURL": "client_website1771568591613",
        "EMAIL": "client_email1771568580679",
        "PHONENUMBER": "client_number1771581555805",
        "COUNTRY": "country1776430495372",
        "PLAN": "shopify_plan1776430433476",
        "RELATIONSHIPSTARTED": "Date and month",
        "ACCOUNTSTATUS": "__SKIP__",
        "ACCOUNTSTATUS_1": "__SKIP__"
    };

    const defaultMapping = Object.fromEntries(
        Object.entries(rawDefaultMapping).map(([key, value]) => [
            normalizeKey(key),
            value,
        ])
    );
    useEffect(() => {
        if (excelData.length > 0) {
            const initialMapping = {};

            Object.keys(excelData[0]).forEach((excelKey) => {
                const normalizedExcelKey = normalizeKey(excelKey);

                if (defaultMapping[normalizedExcelKey]) {
                    initialMapping[excelKey] = defaultMapping[normalizedExcelKey];
                } else {
                    initialMapping[excelKey] = "";
                }
            });

            setMapping(initialMapping);
        }
    }, [excelData]);
    if (!isModelOpen) return;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <IoCloseSharp />
                </button>

                <div className="form-container">
                    <div className="form-header">
                        <h2>Add excel data to current data</h2>
                    </div>
                    <form onSubmit={(e) => {
                        e.preventDefault();

                        const excelKeys = excelData[0] ? Object.keys(excelData[0]) : [];

                        // ❌ check empty mappings
                        const hasEmpty = excelKeys.some(
                            (key) => !mapping[key] || mapping[key] === ""
                        );

                        if (hasEmpty) {
                            setError("Please map all columns before submitting");

                            setTimeout(() => {
                                setError("");
                            }, 2000);

                            return;
                        }

                        // ✅ all good → run original submit
                        handleSubmit(e);
                    }}>
                        <div className="form-group" style={{ "marginBottom": "0" }}>
                            <div className="row">
                                <div className="col-6">
                                    <h6>Excel column Name</h6>
                                    {excelData[0] && Object.keys(excelData[0]).map((key) => (
                                        <div key={key} className="mb-2">
                                            <label style={{ "display": "none" }}>{key}</label>
                                            <input
                                                type="text"
                                                className="form-input text-dark"
                                                value={key}
                                                onChange={(e) => {
                                                    const newKey = e.target.value;
                                                    const newExcelData = excelData.map((item) => {
                                                        const { [key]: value, ...rest } = item;
                                                        return { [newKey]: value, ...rest };
                                                    });
                                                    setExcelData(newExcelData);
                                                }}
                                                disabled
                                                placeholder="e.g. Status, Department"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="col-6">
                                    <h6>Current column Names</h6>
                                    {excelData[0] && Object.keys(excelData[0]).map((excelKey) => (
                                        <div key={excelKey} className="mb-2">
                                            <label style={{ "display": "none" }}>{excelKey}</label>
                                            {/* <select className="w-100 form-input text-dark"
                                                value={`${excelKey === 'STORETITLE' ? 'project1768984734240' : mapping[excelKey] || ""} ${excelKey === 'MYSHOPIFYURL' ? 'client_website1771568591613' : mapping[excelKey] || ""} ${excelKey === 'MYSHOPIFYURL' ? 'client_website1771568591613' : mapping[excelKey] || ""}`}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    setMapping((prev) => ({
                                                        ...prev,
                                                        [excelKey]: value,   // ✅ THIS BUILDS MAPPING
                                                    }));

                                                    console.log("Updated mapping:", {
                                                        ...mapping,
                                                        [excelKey]: value,
                                                    });
                                                }}
                                            >
                                                <option value="">Select</option>
                                                <option value="__SKIP__">Do Not Import</option>
                                                <option value="Date and month">Date and month</option>
                                                {columns
                                                    .filter((column) => {
                                                        // ❗ hide already selected values (except current one)
                                                        return !Object.values(mapping).includes(column.name)
                                                            || mapping[excelKey] === column.name;
                                                    })
                                                    .map((column, index) => column.showInMainProject !== true && (
                                                        <option key={column.name || index} value={column.name}>
                                                            {column.column_heading}
                                                        </option>
                                                    ))}
                                            </select> */}
                                            <select
                                                className="w-100 form-input text-dark"
                                                value={mapping[excelKey] || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    setMapping((prev) => ({
                                                        ...prev,
                                                        [excelKey]: value,
                                                    }));
                                                    console.log("Updated mapping:", {
                                                        ...mapping,
                                                        [excelKey]: value,
                                                    });
                                                }}
                                            >
                                                <option value="">Select</option>
                                                <option value="__SKIP__">Do Not Import</option>
                                                <option value="Date and month">Date and month</option>

                                                {columns
                                                    .filter((column) => {
                                                        return (
                                                            !Object.values(mapping).includes(column.name) ||
                                                            mapping[excelKey] === column.name
                                                        );
                                                    })
                                                    .map(
                                                        (column, index) =>
                                                            column.showInMainProject !== true && (
                                                                <option key={column.name || index} value={column.name}>
                                                                    {column.column_heading}
                                                                </option>
                                                            )
                                                    )}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-danger mb-0 mt-3 fw-bold"><span className="fw-bold ">Note:</span>You can only select one column for each excel column.</p>
                            </div>
                        </div>
                        <button type="submit" className="submit-btn">
                            Save
                        </button>
                    </form>
                </div>
            </div >
            {error && (
                <div className="error-popup">
                    {error}
                </div>
            )}
        </div >
    );
}

export default MatchColumn;