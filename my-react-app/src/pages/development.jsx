import React from 'react';
import Development from '../components/Development';

const DevelopmentPage = () => {
    return (
        <div>
            <Development
                departmentKey="development"
                dataEndpoint="/api/development"
                dataColumns="/api/columns"
            />
        </div>
    );
}

export default DevelopmentPage;