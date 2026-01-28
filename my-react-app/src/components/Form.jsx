// import React, { useState } from 'react';
// import { FaPlus, FaTrash } from 'react-icons/fa';
// import './Form.css';

// function Form({ isPopupOpen, onPopupClose, onPopupSave, showColumnHeading, showDataType, showSortable }) {
//     const [formData, setFormData] = useState({
//         name: '',
//         type: 'text',
//         sorting: false,
//         options: ['']
//     });

//     const handleChange = (e) => {
//         const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
//         setFormData({ ...formData, [e.target.name]: value });
//     };

//     const handleOptionChange = (index, value) => {
//         const newOptions = [...formData.options];
//         newOptions[index] = value;
//         setFormData({ ...formData, options: newOptions });
//     };

//     const addOption = () => {
//         setFormData({ ...formData, options: [...formData.options, ''] });
//     };

//     const removeOption = (index) => {
//         const newOptions = formData.options.filter((_, i) => i !== index);
//         setFormData({ ...formData, options: newOptions });
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         // Prepare data matching the schema
//         const payload = {
//             column_heading: formData.name.trim(),
//             column_type: formData.type,
//             sorting: formData.sorting,
//             multipleValue: formData.type === 'select' ? formData.options.filter(opt => opt.trim() !== '') : []
//         };

//         console.log("payload", payload);
//         if (onPopupSave) {
//             onPopupSave(payload);
//         }

//         if (onPopupClose) {
//             onPopupClose();
//         }

//         setFormData({ name: '', type: 'text', options: [''], sorting: false }); // Clear form
//     };

//     if (!isPopupOpen) return null;

//     return (
//         <div className="modal-overlay">
//             <div className="modal-content">
//                 <button className="close-btn" onClick={onPopupClose}>×</button>
//                 <div className="form-container">
//                     <div className="form-header">
//                         <h2>Add New Column</h2>
//                     </div>
//                     <form onSubmit={handleSubmit}>
//                         {showColumnHeading ? (
//                             <div className="form-group">
//                                 <label>Column Name</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     className="form-input"
//                                     placeholder="e.g. Status, Department"
//                                     value={formData.name}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                             </div>
//                         ) : null}
//                         {showDataType ? (
//                             <div className="form-group">
//                                 <label>Data Type</label>
//                                 <select
//                                     name="type"
//                                     className="form-select"
//                                     value={formData.type}
//                                     onChange={handleChange}
//                                 >
//                                     <option value="text">Text</option>
//                                     <option value="number">Number</option>
//                                     <option value="date">Date</option>
//                                     <option value="select">Select (Dropdown)</option>
//                                 </select>
//                             </div>
//                         ) : null}
//                         {showSortable ? (
//                             <div className="form-check form-check-inline">
//                                 <input
//                                     className="form-check-input"
//                                     onChange={handleChange}
//                                     type="checkbox"
//                                     id="sorting"
//                                     name="sorting"
//                                     checked={formData.sorting}
//                                 />
//                                 <label className="form-check-label" htmlFor="sorting">Sorting and filter options</label>
//                             </div>
//                         ) : null}

//                         {formData.type === 'select' && (
//                             <div className="options-container">
//                                 <label className="options-label">Dropdown Options</label>
//                                 {formData.options.map((option, index) => (
//                                     <div key={index} className="option-row">
//                                         <input
//                                             type="text"
//                                             className="option-input text-black"
//                                             placeholder={`Option ${index + 1}`}
//                                             value={option}
//                                             onChange={(e) => handleOptionChange(index, e.target.value)}
//                                             required={index === 0} // Require at least the first option
//                                         />
//                                         {formData.options.length > 1 && (
//                                             <button
//                                                 type="button"
//                                                 className="icon-btn delete"
//                                                 onClick={() => removeOption(index)}
//                                                 title="Remove option"
//                                             >
//                                                 <FaTrash size={14} />
//                                             </button>
//                                         )}
//                                     </div>
//                                 ))}
//                                 <button type="button" className="add-option-btn" onClick={addOption}>
//                                     <FaPlus size={12} /> Add Another Option
//                                 </button>
//                             </div>
//                         )}

//                         <button type="submit" className="submit-btn">Create Column</button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Form;


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
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "text",
    sorting: false,
    options: [""],
    conditionColumn1: "",
    conditionColumn2: "",
  });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;

    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
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

    const payload = {
      column_heading: formData.name.trim(),
      column_type: formData.type,
      sorting: formData.sorting,
      multipleValue:
        formData.type === "select"
          ? formData.options.filter((opt) => opt.trim() !== "")
          : [],
      conditionColumn1:
        formData.type === "condition"
          ? formData.conditionColumn1
          : undefined,
      conditionColumn2:
        formData.type === "condition"
          ? formData.conditionColumn2
          : undefined,
      equalColor:
        formData.type === "condition" ? formData.equalColor : undefined,
      moreColor:
        formData.type === "condition" ? formData.moreColor : undefined,
      lessColor:
        formData.type === "condition" ? formData.lessColor : undefined,
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
      options: [""],
      sorting: false,
      conditionColumn1: "",
      conditionColumn2: "",
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

            {formData.type === "select" && (
              <div className="options-container">
                <label className="options-label">
                  Dropdown Options
                </label>

                {formData.options.map((option, index) => (
                  <div key={index} className="option-row">
                    <input
                      type="text"
                      className="option-input text-black"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
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