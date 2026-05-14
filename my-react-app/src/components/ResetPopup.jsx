import React, { useState, useEffect } from 'react';
import { API_URL } from '/proxy';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ResetPopup = ({ status, allDepartments }) => {
    const [isResetLocked, setIsResetLocked] = useState(() => {
        return localStorage.getItem("resetLocked") === "true";
    });
    // const [isResetLocked, setIsResetLocked] = useState(false);
    const [loadingUpdater, setLoadingUpdater] = useState(false);
    const [resetConfirmation, setResetConfirmation] = useState({
        isOpen: false,
    });

    const updateColumnDefaultValue = async () => {
        try {
            setLoadingUpdater(true);

            const response = await fetch(`${API_URL}/api/reset-all-departments`, {
                method: "POST",
            });
            const data = await response.json();

            console.log("Reset all department data", data);
            if (data.success) {
                localStorage.setItem("resetLocked", "true");
                setIsResetLocked(true);
                // window.location.reload();
            } else {
                alert("❌ Update failed: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server error during reset");
        } finally {
            setLoadingUpdater(false);
        }
    };
    console.log("isResetLocked", isResetLocked);
    if (isResetLocked || !status) return null;

    return (
        <div className="reset-overlay">
            <div className="reset-modal">
                <h2 className="reset-title">Reset it</h2>
                <p className="reset-message">
                    The daily status reset is required to continue. Please click the button below to reset all values to their defaults.
                </p>
                <button
                    type="button"
                    className="btn btn-outline-dark reset-button"
                    onClick={() => setResetConfirmation({ isOpen: true })}
                    disabled={loadingUpdater}
                >
                    {loadingUpdater ? "Updating..." : "Reset"}
                </button>
                {loadingUpdater && (
                    <div className="loading-overlay-professional">
                        <div className="professional-loader">
                            <AiOutlineLoading3Quarters className="spinner-large" />
                            <p>Updating database values, please wait...</p>
                        </div>
                    </div>
                )}
            </div>
            {
                resetConfirmation.isOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1060,
                        }}
                    >
                        <div
                            className="delete-confirmation-modal"
                            style={{
                                backgroundColor: "white",
                                padding: "20px",
                                borderRadius: "8px",
                                textAlign: "center",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                        >
                            <h5 className="mb-3">Confirm Reset</h5>
                            <p className="mb-4">
                                Are you sure you want to reset columns to their default values?
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                                <button
                                    className="btn btn-outline-secondary" style={{ background: "transparent", color: "black" }}
                                    onClick={() => setResetConfirmation({ isOpen: false })}
                                >
                                    No
                                </button>
                                <button
                                    className="btn btn-secondary" style={{ background: "red", color: "white" }}
                                    disabled={loadingUpdater}
                                    onClick={() => {
                                        setResetConfirmation({ isOpen: false });
                                        updateColumnDefaultValue();
                                    }}
                                >
                                    {loadingUpdater ? "Updating..." : "Yes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <style jsx>{`
                .reset-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    backdrop-filter: blur(5px);
                }
                .reset-modal {
                    background: #fff;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    text-align: center;
                    max-width: 450px;
                    width: 90%;
                    position: relative;
                    animation: modalFadeIn 0.4s ease-out;
                }
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .reset-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 15px;
                    font-family: 'Inter', sans-serif;
                }
                .reset-message {
                    color: #666;
                    font-size: 1.1rem;
                    line-height: 1.5;
                    margin-bottom: 30px;
                }
                .reset-button {
                    background: linear-gradient(135deg, #6e8efb, #a777e3);
                    color: white;
                    border: none;
                    padding: 12px 40px;
                    font-size: 1.2rem;
                    font-weight: 600;
                    border-radius: 30px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 10px 20px rgba(110, 142, 251, 0.3);
                }
                .reset-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px rgba(110, 142, 251, 0.4);
                }
                .reset-button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
                .spinner-large {
                    font-size: 3rem;
                    color: #fff;
                    margin-bottom: 20px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .loading-overlay-professional {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                .professional-loader {
                    text-align: center;
                    color: white;
                }
                .professional-loader p {
                    font-size: 1.2rem;
                    letter-spacing: 1px;
                }
            `}</style>
        </div >
    );
};

export default ResetPopup;
