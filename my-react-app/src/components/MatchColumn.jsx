import { useState } from "react";
import "./error.css";
import { IoCloseSharp } from "react-icons/io5";

function MatchColumn({ isModelOpen, onClose, excelData, handleSubmit, columns, data, setMapping, mapping }) {
    const [error, setError] = useState("");
    // const [extraValues, setExtraValues] = useState({});
    // const selectedColumns = Object.values(mapping);

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
                                            <select className="w-100 form-input text-dark"
                                                value={mapping[excelKey] || ""}
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