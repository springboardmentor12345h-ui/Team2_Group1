import React from 'react';
import Card from './Card';

const StatsCard = ({ title, value, icon: Icon, trend, className = '' }) => {
    return (
        <Card className={`p-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-secondary-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>
                </div>
                {Icon && (
                    <div className="p-3 bg-primary-50 rounded-lg">
                        <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${trend.value >= 0 ? 'text-success' : 'text-error'}`}>
                        {trend.value > 0 ? '+' : ''}{trend.value}%
                    </span>
                    <span className="ml-2 text-secondary-400">{trend.label}</span>
                </div>
            )}
        </Card>
    );
};

export default StatsCard;
