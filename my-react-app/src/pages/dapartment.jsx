import React from 'react'
import Departments from '../components/Departments'
function Dapartment({ setIsLoggedIn }) {
    return (
        <div>
            <Departments setIsLoggedIn={setIsLoggedIn} />
        </div>
    )
}

export default Dapartment