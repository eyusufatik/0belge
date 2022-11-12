import React from 'react';

const Error = ({ code }) => {
  return (
    <div className="error">
        <h1>{code}</h1>
    </div>
  );
};

export default Error;