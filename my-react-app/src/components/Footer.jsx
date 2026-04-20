import React from 'react';

const Footer = ({ isDrawerOpen }) => {
    return (
        <footer className={`pt-4 pb-4 border-top mt-5 ${isDrawerOpen ? 'left__300' : ''}`}>
            <div className="d-flex justify-content-center gap-2 mb-2 align-items-center">
                @copyright 2026 | All rights reserved
            </div>
        </footer>
    );
}

export default Footer;