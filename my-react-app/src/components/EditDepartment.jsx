import { useState, useEffect } from "react";
import { API_URL } from "../../proxy";
import "./custom.css";
const EditDepartment = ({ isModalOpen, onClose, department, userData, handleCheckboxChange, fetchDepartments }) => {
    const [departmentName, setDepartmentName] = useState("");

    // console.log("departmentName", departmentName);

    // console.log("department._id", department?._id);
    useEffect(() => {
        if (department) {
            setDepartmentName(department.department || "");
        }
    }, [department]);

    const cleanDept = department?.name?.replace(/\d+/g, "").toLowerCase() || ""; console.log("cleanDept", cleanDept);
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Submitting:", {
            id: department?._id,
            departmentName
        });

        try {
            const response = await fetch(`${API_URL}/api/department/${department._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ department: departmentName }),
            });
            console.log("Payload:", JSON.stringify({ department: departmentName }));
            const data = await response.json();

            if (response.ok) {
                if (fetchDepartments) fetchDepartments();
                onClose();
            } else {
                console.error("Failed:", data);
            }
        } catch (err) {
            console.error("Error updating department name:", err);
        }
    };
    const handleArchive = async () => {
        try {
            const response = await fetch(`${API_URL}/api/department/${department._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "archived" }),
            });

            if (response.ok) {
                if (fetchDepartments) fetchDepartments();
                onClose();
            } else {
                console.error("Failed to archive department");
            }
        } catch (err) {
            console.error("Error archiving department:", err);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ "maxWidth": "500px", "padding": "10px" }} onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    ×
                </button>

                <div className="form-container">
                    <div className="form-header">
                        <h2>Edit Department</h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="departmentName" className="form-label">Department Name</label>
                            <input
                                type="text"
                                className="form-input text-dark"
                                id="departmentName"
                                value={departmentName}
                                onChange={(e) => setDepartmentName(e.target.value)}
                            />
                        </div>
                        <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
                            {userData
                                .filter(user => user.status === 'staff')
                                .map((user, index) => (
                                    <div key={user._id || index} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value={user.user_name}
                                            id={`${user._id}-${cleanDept}`}
                                            checked={
                                                Array.isArray(user.department)
                                                    ? user.department.map(d => d.toLowerCase()).includes(cleanDept)
                                                    : user.department?.toLowerCase().includes(cleanDept)
                                            }
                                            onChange={(e) => handleCheckboxChange(e, user, cleanDept)}
                                        />

                                        <label
                                            htmlFor={`${user._id}-${cleanDept}`}
                                            className="form-check-label"
                                        >
                                            {user.user_name}
                                        </label>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <button type="submit" className="submit-btn" style={{ flex: 1, marginRight: '10px', marginTop: "0px" }}>
                                Save
                            </button>
                            <button style={{ "width": "auto", "height": "auto", marginTop: "0px" }} type="button" className="submit-btn btn btn-danger" onClick={handleArchive}>
                                Archive
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDepartment;