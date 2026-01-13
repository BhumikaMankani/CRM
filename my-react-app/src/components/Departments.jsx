import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Marketing from "../pages/marketing";
import Seo from "../pages/seo";
import Form from "../components/Form";
import Development from "../pages/development";

function Departments() {

    // const [columnsDef, setColumnsDef] = useState([]);
    // const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    // useEffect(() => {
    //     fetch("/api/departments")
    //         .then(res => {
    //             if (!res.ok) throw new Error("Failed to fetch departments");
    //             return res.json();
    //         })
    //         .then(setColumnsDef)
    //         .catch(err => console.error("Error loading departments:", err));
    // }, [])
    const data = [
        { department: 'Seo', link: '/seo' },
        { department: 'Marketing', link: '/marketing' },
        { department: 'Development', link: '/development' },
    ];


    const columns = [
        {
            header: 'Count',
            render: (row, rowIndex) => (
                <span className="text-muted">
                    {rowIndex + 1}
                </span>
            )
        },
        {
            header: 'Department',
            accessor: 'department',
            render: (row) => (
                <div className="cell-input-wrapper">
                    <Link to={row.link}>{row.department}</Link>
                </div>
            )
        },
    ];

    return (
        <section className="ftco-section">
            <div className="row">
                <div className="col-md-12">
                    {/* <button
                        className="btn btn-outline-dark"
                        onClick={() => addRow()}
                    >
                        Add Row
                    </button>
                    <button
                        className="btn btn-outline-dark"
                        onClick={() => setIsColumnModalOpen(true)}
                    >
                        Add Column
                    </button> */}
                    <table className="table">
                        <thead className="thead-primary">
                            <tr>
                                {columns.map((column, index) => (
                                    <th key={index}>{column.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex}>
                                            {column.render
                                                ? column.render(row, rowIndex)
                                                : row[column.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* <Form
                        showColumnHeading={true}
                        isPopupOpen={isColumnModalOpen}
                        onPopupClose={() => setIsColumnModalOpen(false)}
                        onPopupSave={async (newColumn) => {
                            try {
                                const res = await fetch("/api/columns", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(newColumn)
                                });

                                if (!res.ok) {
                                    const errorData = await res.json();
                                    throw new Error(errorData.error || "Failed to save column");
                                }

                                const saved = await res.json();
                                setColumnsDef(prev => [...prev, saved]);
                            } catch (err) {
                                console.error("Error saving column:", err);
                                alert("Error saving column: " + err.message);
                            }
                        }}
                    /> */}
                </div>
            </div>
        </section>
    );
}

export default Departments;