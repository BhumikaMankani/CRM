import { LiaLockSolid, LiaEditSolid } from 'react-icons/lia';

function Profile({ handleLogout, status }) {
    return (
        <div className="user-row rounded d-flex w-100 gap-2 flex-column position-relative">
            <div className="d-flex align-items-center gap-2 w-100">
                <div className="dup_avatar">{status?.user_name?.[0]?.toUpperCase()}</div>
                <div className="popup-user-details d-flex justify-content-between align-items-center w-100">
                    <div className="popup-name fw-bold text-white">{status?.user_name}</div>
                    {/* <span className={`status-badge ${status?.status}`}>
                        {status?.status?.charAt(0).toUpperCase() + status?.status?.slice(1)}
                    </span> */}
                    <span className={`status-badge ${status?.status}`}>
                        {status?.status === 'staff' ?
                            ("Team leader")
                            : (status?.status?.charAt(0).toUpperCase() + status?.status?.slice(1)
                            )}
                    </span>
                </div>
            </div>
            <div className="user-popup-footer w-100">
                <button className="cursor-pointer button button-primary d-flex align-items-center justify-content-center gap-2 rounded popup-logout-btn w-100" onClick={handleLogout}>
                    <LiaLockSolid />
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Profile;
