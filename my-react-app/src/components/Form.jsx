import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import "./Form.css";

function Form({
  isPopupOpen,
  onPopupClose,
  onPopupSave,
  showColumnHeading,
  showDataType,
  showSortable,
  availableColumns = [],
  availableUsers = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "text",
    sorting: false,
    options: [{ text: "", color: "#ffffff" }],
    conditionColumn1: "",
    conditionColumn2: "",
    equalPrefix: "",
    morePrefix: "",
    lessPrefix: "",
    hasDefaultValue: false,
    defaultValue: "",
    access: [],
    showInfo: false,
    sticky: false,
  });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    // If type changes from select to something else, reset default value fields
    if (e.target.name === "type" && value !== "select") {
      setFormData({
        ...formData,
        [e.target.name]: value,
        hasDefaultValue: false,
        defaultValue: "",
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: value,
      });
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };

    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const handleAccessToggle = (userId) => {
    setFormData((prev) => {
      const current = prev.access || [];
      if (current.includes(userId)) {
        return { ...prev, access: current.filter((id) => id !== userId) };
      }
      return { ...prev, access: [...current, userId] };
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", color: "#ffffff" }],
    });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const multipleValue = formData.options
      .filter((opt) => opt.text.trim() !== "")
      .map((opt) => opt.text.trim());

    const optionColors = {};
    formData.options.forEach((opt) => {
      if (opt.text.trim() !== "") {
        optionColors[opt.text.trim()] = opt.color;
      }
    });

    const payload = {
      column_heading: formData.name.trim(),
      column_type: formData.type,
      sorting: formData.sorting,
      multipleValue: formData.type === "select" ? multipleValue : [],
      optionColors: formData.type === "select" ? optionColors : {},
      conditionColumn1:
        formData.type === "condition"
          ? formData.conditionColumn1
          : undefined,
      conditionColumn2:
        formData.type === "condition"
          ? formData.conditionColumn2
          : undefined,
      equalPrefix:
        formData.type === "condition" ? formData.equalPrefix : undefined,
      morePrefix:
        formData.type === "condition" ? formData.morePrefix : undefined,
      lessPrefix:
        formData.type === "condition" ? formData.lessPrefix : undefined,
      equalColor:
        formData.type === "condition" ? formData.equalColor : undefined,
      moreColor:
        formData.type === "condition" ? formData.moreColor : undefined,
      lessColor:
        formData.type === "condition" ? formData.lessColor : undefined,
      hasDefaultValue:
        formData.type === "select" ? !!formData.hasDefaultValue : false,
      defaultValue:
        formData.type === "select" && formData.hasDefaultValue
          ? formData.defaultValue
          : undefined,
      access: Array.isArray(formData.access) ? formData.access : [],
      showInfo: !!formData.showInfo,
      sticky: !!formData.sticky,
    };

    console.log("payload", payload);

    if (onPopupSave) {
      onPopupSave(payload);
    }

    if (onPopupClose) {
      onPopupClose();
    }

    setFormData({
      name: "",
      type: "text",
      options: [{ text: "", color: "#ffffff" }],
      sorting: false,
      conditionColumn1: "",
      conditionColumn2: "",
      equalPrefix: "",
      morePrefix: "",
      lessPrefix: "",
      hasDefaultValue: false,
      defaultValue: "",
      access: [],
      showInfo: false,
      sticky: false,
    });
  };

  if (!isPopupOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onPopupClose}>
          ×
        </button>

        <div className="form-container">
          <div className="form-header">
            <h2>Add New Column</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {showColumnHeading && (
              <div className="form-group">
                <label>Column Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Status, Department"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {showDataType && (
              <div className="form-group">
                <label>Data Type</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select (Dropdown)</option>
                  <option value="condition">Condition</option>
                </select>
              </div>
            )}

            {showSortable && (
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  onChange={handleChange}
                  type="checkbox"
                  id="sorting"
                  name="sorting"
                  checked={formData.sorting}
                />
                <label
                  className="form-check-label"
                  htmlFor="sorting"
                >
                  Sorting and filter options
                </label>
              </div>
            )}
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                onChange={handleChange}
                type="checkbox"
                id="showInfo"
                name="showInfo"
                checked={formData.showInfo}
              />
              <label
                className="form-check-label"
                htmlFor="showInfo"
              >
                Show Info
              </label>
            </div>

            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                onChange={handleChange}
                type="checkbox"
                id="sticky"
                name="sticky"
                checked={formData.sticky}
              />
              <label
                className="form-check-label"
                htmlFor="sticky"
              >
                Sticky Column
              </label>
            </div>

            <div className="form-group">
              <label>Access</label>
              <p className="small text-muted mb-2">
                Users who can edit or delete this column (Admin always has access)
              </p>
              <div
                className="access-users-list"
                style={{
                  maxHeight: "120px",
                  overflowY: "auto",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  padding: "10px",
                }}
              >
                {availableUsers.length === 0 ? (
                  <span className="text-muted small">No users available</span>
                ) : (
                  availableUsers.map((user) => (
                    <div
                      key={user._id}
                      className="form-check"
                      style={{ marginBottom: "6px" }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`access-${user._id}`}
                        checked={(formData.access || []).includes(user._id)}
                        onChange={() => handleAccessToggle(user._id)}
                      />
                      <label
                        className="form-check-label text-dark"
                        htmlFor={`access-${user._id}`}
                        style={{ fontSize: "14px" }}
                      >
                        {user.user_name || user.email} {user.status === "admin" && "(Admin)"}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {formData.type === "select" && (
              <div className="options-container">
                <label className="options-label">
                  Dropdown Options
                </label>

                {formData.options.map((option, index) => (
                  <div key={index} className="option-row d-flex align-items-center gap-2 mb-2">
                    <input
                      type="color"
                      className="form-control form-control-color p-0 border-0"
                      style={{ width: '30px', height: '30px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      value={option.color}
                      onChange={(e) =>
                        handleOptionChange(index, 'color', e.target.value)
                      }
                      title="Select background color"
                    />
                    <input
                      type="text"
                      className="option-input text-black flex-grow-1"
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(index, 'text', e.target.value)
                      }
                      required={index === 0}
                    />

                    {formData.options.length > 1 && (
                      <button
                        type="button"
                        className="icon-btn delete"
                        onClick={() => removeOption(index)}
                        title="Remove option"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="add-option-btn"
                  onClick={addOption}
                >
                  <FaPlus size={12} /> Add Another Option
                </button>

                <div className="form-check form-check-inline" style={{ marginTop: "15px" }}>
                  <input
                    className="form-check-input"
                    onChange={handleChange}
                    type="checkbox"
                    id="hasDefaultValue"
                    name="hasDefaultValue"
                    checked={formData.hasDefaultValue}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="hasDefaultValue"
                  >
                    Set default value
                  </label>
                </div>

                {formData.hasDefaultValue && (
                  <div className="form-group" style={{ marginTop: "10px" }}>
                    <label>Default Value</label>
                    <select
                      name="defaultValue"
                      className="form-select"
                      value={formData.defaultValue}
                      onChange={handleChange}
                      required={formData.hasDefaultValue}
                    >
                      <option value="">Select default value</option>
                      {formData.options
                        .filter((opt) => opt.text.trim() !== "")
                        .map((option, index) => (
                          <option key={index} value={option.text}>
                            {option.text}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {formData.type === "condition" && (
              <div className="options-container">
                <label className="options-label">
                  Condition Columns
                </label>

                <div className="form-group">
                  <label>Column 1</label>
                  <select
                    className="form-select text-dark"
                    value={formData.conditionColumn1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditionColumn1: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Column</option>
                    {availableColumns.map((col) => (
                      <option
                        key={col.name}
                        value={col.name}
                      >
                        {col.column_heading}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Column 2</label>
                  <select
                    className="form-select text-dark"
                    value={formData.conditionColumn2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditionColumn2: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Column</option>
                    {availableColumns.map((col) => (
                      <option
                        key={col.name}
                        value={col.name}
                      >
                        {col.column_heading}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Prefix (if days equal 0)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Deadline Today"
                    value={formData.equalPrefix}
                    onChange={(e) =>
                      setFormData({ ...formData, equalPrefix: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Prefix (if days &gt; 0)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Due in"
                    value={formData.morePrefix}
                    onChange={(e) =>
                      setFormData({ ...formData, morePrefix: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Prefix (if days &lt; 0)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Overdue by"
                    value={formData.lessPrefix}
                    onChange={(e) =>
                      setFormData({ ...formData, lessPrefix: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn">
              Create Column
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Form;