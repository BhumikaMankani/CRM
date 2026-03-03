import React, { useState, useRef, useEffect } from 'react';
import { FaPalette } from 'react-icons/fa';
import { SlArrowDown } from "react-icons/sl";
import './CustomSelectDropdown.css';

const CustomSelectDropdown = ({
    value,
    options,
    onChange,
    disabled,
    optionColors,
    optionTextColors,
    getContrastYIQ,
    onEditColors,
    showEditButton = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        onEditColors();
    };

    // Get color for a specific option
    const getOptionColor = (opt) => {
        const trimmedOpt = opt.toString().trim();
        let optColor = null;

        if (optionColors[trimmedOpt]) {
            optColor = optionColors[trimmedOpt];
        } else if (optionColors.get && optionColors.get(trimmedOpt)) {
            optColor = optionColors.get(trimmedOpt);
        } else {
            const target = trimmedOpt.toLowerCase();
            const keys = Object.keys(optionColors);
            const match = keys.find(k => k.trim().toLowerCase() === target);
            if (match) optColor = optionColors[match];
        }

        return optColor;
    };

    // Get text color for a specific option
    const getOptionTextColor = (opt, bgColor) => {
        const trimmedOpt = opt.toString().trim();
        let textColor = getContrastYIQ(bgColor);

        if (bgColor) {
            if (optionTextColors[trimmedOpt]) {
                textColor = optionTextColors[trimmedOpt];
            } else if (optionTextColors.get && optionTextColors.get(trimmedOpt)) {
                textColor = optionTextColors.get(trimmedOpt);
            } else {
                const target = trimmedOpt.toLowerCase();
                const keys = Object.keys(optionTextColors);
                const match = keys.find(k => k.trim().toLowerCase() === target);
                if (match) textColor = optionTextColors[match];
            }
        }

        return textColor;
    };

    // Get display value
    const selectedOption = value || '';
    const selectedColor = getOptionColor(selectedOption);
    const selectedTextColor = getOptionTextColor(selectedOption, selectedColor);

    return (
        <div className="custom-select-dropdown" ref={dropdownRef}>
            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    // backgroundColor: selectedColor || 'transparent',
                    color: selectedColor ? selectedTextColor : 'inherit',
                    fontWeight: selectedColor ? '600' : 'normal',
                }}
            >
                <span>{selectedOption || 'Select'}</span>
                <span className="custom-select-arrow"><SlArrowDown /></span>
            </div>

            {isOpen && !disabled && (
                <div className="custom-select-options">
                    <div
                        className="custom-select-option"
                        onMouseDown={(e) => { e.preventDefault(); handleOptionClick(''); }}
                    >
                        Select
                    </div>
                    {options.map((opt) => {
                        const optColor = getOptionColor(opt);
                        const optTextColor = getOptionTextColor(opt, optColor);

                        return (
                            <div
                                key={opt}
                                className={`custom-select-option ${value === opt ? 'selected' : ''}`}
                                onMouseDown={(e) => { e.preventDefault(); handleOptionClick(opt); }}
                                style={{
                                    color: 'black',
                                    fontWeight: 'normal',
                                }}
                            >
                                {opt}
                            </div>
                        );
                    })}

                    {showEditButton && (
                        <>
                            {/* <div className="custom-select-divider"></div> */}
                            <div
                                className="custom-select-edit-button"
                                onMouseDown={(e) => { e.preventDefault(); handleEditClick(e); }}
                            >
                                <svg
                                    fill="currentColor"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 528.899 528.899"
                                >
                                    <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z"></path>
                                </svg>
                                {/* <span>Edit Colors</span> */}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelectDropdown;
