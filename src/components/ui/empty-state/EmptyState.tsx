"use client";

import React from "react";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = "",
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
            {icon && (
                <div className="mb-4 p-4 rounded-full bg-[var(--bg-general-lighter)]">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold mb-2 custom-black-white-theme-switch-text">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
                    {description}
                </p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
};



