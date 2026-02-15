import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-secondary-100 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
