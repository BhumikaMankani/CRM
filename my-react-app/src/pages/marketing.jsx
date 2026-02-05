import React from 'react';
import Development from '../components/Development';

const Marketing = () => {
  return (
    <div>
      <Development
        departmentKey="marketing"
        dataEndpoint="/api/marketing"
        dataColumns="/api/marketing-columns"
      />
    </div>
  );
};

export default Marketing;