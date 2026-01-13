import React, { useState } from 'react';
import './custom.css';
import initialData from '../data.json';
import { IoCloseSharp } from "react-icons/io5";

const AddEntryModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        project: '',
        dailyCheck: 'No',
        tlComments: '',
        columns4: '',
        group: 'Group A',
        category: 'Redesign/Theme update',
        teamLead: 'Nikhil Joshi',
        status: 'Not started',
        discussion: 'No group',
        startDate: '',
        endDate: '',
        projectManager: 'Komal',
        client: '',
        salesDiscussion: 'Email',
        monthYear: '',
        ratingStatus: '',
        finalInvoicePending: 'No',
        ratingRequested: 'No',
        clientSatisfaction: '',
        priority: ''
    });
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.project.trim()) newErrors.project = "Project name is required";
        if (!formData.client.trim()) newErrors.client = "Client name is required";
        if (!formData.projectManager) newErrors.projectManager = "Project Manager is required";
        if (!formData.salesDiscussion) newErrors.salesDiscussion = "Sales Discussion is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.status) newErrors.status = "Status is required";
        if (!formData.discussion) newErrors.discussion = "Discussion method is required";
        if (!formData.startDate) newErrors.startDate = "Start Date is required";
        if (!formData.endDate) newErrors.endDate = "End Date is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const formatDate = (d) => {
                if (!d) return '';
                const [y, m, dNum] = d.split('-');
                return `${dNum}/${m}/${y}`;
            }

            const newEntry = {
                ...formData,
                startDate: formatDate(formData.startDate),
                endDate: formatDate(formData.endDate),
                // overue/overdue logic is usually calculated in the table component,
                // but we can pass it if the data structure expects it.
            };

            onSave(newEntry);
            onClose();

            // Reset form
            setFormData({
                project: '',
                dailyCheck: 'No',
                tlComments: '',
                columns4: '',
                group: 'Group A',
                category: 'Redesign/Theme update',
                teamLead: 'Nikhil Joshi',
                status: 'Not started',
                discussion: 'No group',
                startDate: '',
                endDate: '',
                projectManager: 'Komal',
                client: '',
                salesDiscussion: 'Email',
                monthYear: '',
                ratingStatus: '',
                finalInvoicePending: 'No',
                ratingRequested: 'No',
                clientSatisfaction: '',
                priority: ''
            });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button name='close' type="button" className="close_button" onClick={onClose}><IoCloseSharp /></button>
                <h2 className="modal-title">Add New Project</h2>
                <form onSubmit={handleSubmit} className="modal-scroll-form">

                    {/* <div className="modal-section-title">Project Info</div> */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="project" className="modal-label">Project Name *</label>
                            <input
                                type="text"
                                id='project'
                                name="project"
                                value={formData.project}
                                onChange={handleChange}
                                className={`modal-input ${errors.project ? 'error' : ''}`}
                                placeholder="Enter project name"
                            />
                            {errors.project && <span className="error-text">{errors.project}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="client" className="modal-label">Client Name *</label>
                            <input
                                type="text"
                                id='client'
                                name="client"
                                value={formData.client}
                                onChange={handleChange}
                                className={`modal-input ${errors.client ? 'error' : ''}`}
                                placeholder="Enter client name"
                            />
                            {errors.client && <span className="error-text">{errors.client}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="projectManager" className="modal-label">Project Manager *</label>
                            <select
                                id='projectManager'
                                name="projectManager"
                                value={formData.projectManager}
                                onChange={handleChange}
                                className={`modal-select ${errors.projectManager ? 'error' : ''}`}
                            >
                                <option value="Komal">Komal</option>
                                <option value="Pankaj">Pankaj</option>
                                <option value="Rahul">Rahul</option>
                                <option value="Khanak">Khanak</option>
                                <option value="Shubham">Shubham</option>
                                <option value="Kajal">Kajal</option>
                            </select>
                            {errors.projectManager && <span className="error-text">{errors.projectManager}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="salesDiscussion" className="modal-label">Sales Discussion *</label>
                            <select
                                id='salesDiscussion'
                                name="salesDiscussion"
                                value={formData.salesDiscussion}
                                onChange={handleChange}
                                className={`modal-select ${errors.salesDiscussion ? 'error' : ''}`}
                            >
                                <option value="Email">Email</option>
                                <option value="Whatsapp">Whatsapp</option>
                                <option value="Slack">Slack</option>
                            </select>
                            {errors.salesDiscussion && <span className="error-text">{errors.salesDiscussion}</span>}
                        </div>
                    </div>

                    <div className="modal-section-title">Assignment & Status</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="teamLead" className="modal-label">Team Lead</label>
                            <select
                                id='teamLead'
                                name="teamLead"
                                value={formData.teamLead}
                                onChange={handleChange}
                                className="modal-select"
                            >
                                <option value="Nikhil Joshi">Nikhil Joshi</option>
                                <option value="Komal Mankani">Komal Mankani</option>
                                <option value="Aditya">Aditya</option>
                                <option value="Shubham">Shubham</option>
                                <option value="Arun">Arun</option>
                                <option value="Vibha">Vibha</option>
                                <option value="Sunil">Sunil</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="status" className="modal-label">Status *</label>
                            <select
                                name="status"
                                id='status'
                                value={formData.status}
                                onChange={handleChange}
                                className={`modal-select ${errors.status ? 'error' : ''}`}
                            >
                                <option value="Not started">Not started</option>
                                <option value="ON TRACK">ON TRACK</option>
                                <option value="At Risk">At Risk</option>
                                <option value="Off Track">Off Track</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Rating">Rating</option>
                                <option value="Refunded">Refunded</option>
                                <option value="Forwarded to Client">Forwarded to Client</option>
                                <option value="Rating Requested">Rating Requested</option>
                                <option value="Risky Completed">Risky Completed</option>
                                <option value="Offtrack Client">Offtrack Client</option>
                                <option value="Follow Up">Follow Up</option>
                                <option value="Confirmation Pending">Confirmation Pending</option>
                            </select>
                            {errors.status && <span className="error-text">{errors.status}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category" className="modal-label">Category *</label>
                            <select
                                name="category"
                                id='category'
                                value={formData.category}
                                onChange={handleChange}
                                className={`modal-select ${errors.category ? 'error' : ''}`}
                            >
                                <option value="Redesign/Theme update">Redesign/Theme update</option>
                                <option value="Troubleshoot">Troubleshoot</option>
                                <option value="Theme Customization">Theme Customization</option>
                                <option value="CRO Changes">CRO Changes</option>
                                <option value="Graphics">Graphics</option>
                                <option value="Audit">Audit</option>
                                <option value="Seo">Seo</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Speed Optimization">Speed Optimization</option>
                                <option value="Wordpress">Wordpress</option>
                                <option value="Shopify Plus">Shopify Plus</option>
                                <option value="Monthly Maintaining">Monthly Maintaining</option>
                                <option value="Custlo App">Custlo App</option>
                            </select>
                            {errors.category && <span className="error-text">{errors.category}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="discussion" className="modal-label">Lead Discussion *</label>
                            <select
                                name="discussion"
                                id='discussion'
                                value={formData.discussion}
                                onChange={handleChange}
                                className={`modal-select ${errors.discussion ? 'error' : ''}`}
                            >
                                <option value="No group">No group</option>
                                <option value="On Whatsapp">On Whatsapp</option>
                                <option value="On Email">On Email</option>
                                <option value="skype">Skype</option>
                                <option value="Slack">Slack</option>
                                <option value="Aisensy">Aisensy</option>
                            </select>
                            {errors.discussion && <span className="error-text">{errors.discussion}</span>}
                        </div>
                    </div>

                    <div className="modal-section-title">Dates & Timeline</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startDate" className="modal-label">Start Date *</label>
                            <input
                                type="date"
                                id='startDate'
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className={`modal-input ${errors.startDate ? 'error' : ''}`}
                            />
                            {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate" className="modal-label">End Date *</label>
                            <input
                                type="date"
                                id='endDate'
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className={`modal-input ${errors.endDate ? 'error' : ''}`}
                            />
                            {errors.endDate && <span className="error-text">{errors.endDate}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="monthYear" className="modal-label">Target Month</label>
                        <input
                            type="month"
                            id='monthYear'
                            name="monthYear"
                            value={formData.monthYear}
                            onChange={handleChange}
                            className="modal-input"
                        />
                    </div>

                    <div className="modal-section-title">Optional Details</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="priority" className="modal-label">Priority</label>
                            <select
                                id='priority'
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="modal-select"
                            >
                                <option value="">Select...</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="group" className="modal-label">Group</label>
                            <select
                                id='group'
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                className="modal-select"
                            >
                                <option value="Group A">Group A</option>
                                <option value="Group B">Group B</option>
                                <option value="Group C">Group C</option>
                                <option value="Group D">Group D</option>
                                <option value="Group E">Group E</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tlComments" className="modal-label">TL Comments</label>
                        <textarea
                            name="tlComments"
                            id='tlComments'
                            value={formData.tlComments}
                            onChange={handleChange}
                            className="modal-textarea"
                            rows="2"
                            placeholder="Additional comments from TL"
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button name='cancel' type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button name='save' type="submit" className="btn-primary">Save Entry</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEntryModal;
