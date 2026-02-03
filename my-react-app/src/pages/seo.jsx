import React from "react";
import Development from '../components/Development';

const Seo = () => {
  return (
    <div>
      <Development
        departmentKey="seo"
        dataEndpoint="/api/seo"
        dataColumns="/api/seo-columns"
      />
    </div>
  );
};

export default Seo;
