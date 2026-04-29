import { useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import "./User.css";
import md5 from "md5";
import './custom.css'
import { API_URL } from "../../proxy";

const STATUS_OPTIONS = ["Team leader", "admin"];

const initialForm = {
    user_name: "",
    email: "",
    password: "",
    status: "staff",
};

export default function UserForm({ isUserFormOpen, onClose, onUserCreated }) {
    const [isUserSavedFormOpen, setIsUserSavedFormOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Reset form to blank whenever the modal opens
    useEffect(() => {
        if (isUserFormOpen) {
            setForm(initialForm);
            setErrors({});
            setSubmitted(false);
            setShowPassword(false);
        }
    }, [isUserFormOpen]);

    const validate = () => {
        const errs = {};
        if (!form.user_name.trim()) errs.user_name = "Username is required.";
        if (!form.email.trim()) errs.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address.";
        if (!form.password.trim()) errs.password = "Password is required.";
        else if (form.password.length < 6) errs.password = "Password must be at least 6 characters.";
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((er) => ({ ...er, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...form,
                password: md5(form.password).toString(),
                updatedAt: new Date().toISOString(),
            };

            const response = await fetch(`${API_URL}/api/user/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("User saved successfully:", data);
                setSubmitted(true);
                if (onUserCreated) onUserCreated(data);
            } else {
                setErrors({ submit: data.error || "Failed to save user." });
            }
        } catch (error) {
            console.error("Error saving user:", error);
            setErrors({ submit: "An error occurred while saving the user." });
        } finally {
            setLoading(false);
            onClose();
            setIsUserSavedFormOpen(true);
        }
    };

    const handleReset = () => {
        setForm(initialForm);
        setErrors({});
        setSubmitted(false);
    };

    if (submitted && isUserSavedFormOpen) {
        return (
            <div
                className="modal-overlay"
            >
                <div className="modal-content" style={{ maxWidth: 500, maxHeight: "100%" }}>
                    <div
                        className="text-center"
                    >
                        <button type="button" className="close-btn" onClick={() => setIsUserSavedFormOpen(false)}><IoCloseSharp /></button>

                        <div className="mb-3" style={{ fontSize: 28 }}>✅</div>
                        <h3 className="fw-bold text-dark mb-2">User Saved!</h3>
                        <p className="text-dark-50 mb-4">
                            <strong className="text-dark">{form.user_name}</strong>'s profile has been saved to the database.
                        </p>
                    </div>
                </div>
            </div >
        );
    }
    if (!isUserFormOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="form-container p-0">
                    <button type="button" className="close-btn" onClick={onClose}><IoCloseSharp /></button>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-dark mb-1">Create New User</h2>
                        <p className="text-dark-50 mb-0">Fill in the details below to add a user to the system.</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        <div
                            className=""
                        >
                            {errors.submit && (
                                <div className="alert alert-danger py-2 small mb-3">
                                    {errors.submit}
                                </div>
                            )}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label text-dark-50 small">Username *</label>
                                    <input
                                        type="text"
                                        name="user_name"
                                        className={`form-control bg-transparent text-dark  ${errors.user_name ? "is-invalid" : ""}`}
                                        placeholder="e.g. Nikhil"
                                        value={form.user_name}
                                        onChange={handleChange}
                                    />
                                    {errors.user_name && <div className="invalid-feedback">{errors.user_name}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label text-dark-50 small">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`form-control bg-transparent text-dark  ${errors.email ? "is-invalid" : ""}`}
                                        placeholder="user@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label text-dark-50 small">Password *</label>
                                    <div className="input-group password-input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className={`form-control bg-transparent text-dark  ${errors.password ? "is-invalid" : ""}`}
                                            placeholder="Min. 6 characters"
                                            value={form.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword((s) => !s)}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 2L22 22" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path
                                                        d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335"
                                                        stroke="#000000"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818"
                                                        stroke="#000000"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
                                                        stroke="#000000"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                                                        stroke="#000000"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="3"
                                                        stroke="#000000"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label text-dark-50 small">Status</label>
                                    <select
                                        name="status"
                                        className="form-select bg-transparent text-dark "
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* --- Submit --- */}
                            <div className="d-flex gap-3 mt-4 pt-2">
                                <button
                                    type="submit"
                                    className="w-50 btn flex-grow-1 fw-semibold py-2"
                                    disabled={loading}
                                    style={{
                                        borderRadius: 12,
                                        background: "#000",
                                        color: "#fff",
                                        border: "none",
                                        fontSize: 15,
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="w-50 btn btn-outline-secondary px-4 py-2"
                                    style={{ borderRadius: 12 }}
                                    onClick={handleReset}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Preview Panel */}
                        {(form.user_name || form.email) && (
                            <div
                                className="mt-3"
                                style={{
                                    borderRadius: 14,
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}
                            >
                                <p className="text-dark-50 small mb-2">LIVE PREVIEW</p>
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                        style={{ width: 44, height: 44, background: "#e87c00", fontSize: 18, flexShrink: 0 }}
                                    >
                                        {form.user_name ? form.user_name[0].toUpperCase() : "?"}
                                    </div>
                                    <div>
                                        <div className="text-dark fw-semibold">{form.user_name || "—"}</div>
                                        <div className="text-dark-50 small">{form.email || "—"}</div>
                                    </div>
                                    {form.status && (
                                        <span className="badge ms-auto text-white" style={{ background: "#e87c00" }}>
                                            {form.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}