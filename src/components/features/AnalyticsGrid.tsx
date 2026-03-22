"use client";

import React from "react";

interface AnalyticsItem {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
}

interface AnalyticsGridProps {
    items: AnalyticsItem[];
    title?: string;
    description?: string;
    className?: string;
}

export const AnalyticsGrid: React.FC<AnalyticsGridProps> = ({
    items,
    title,
    description,
    className = "",
}) => {
    return (
        <div className={`mb-6 ${className}`}>
            {(title || description) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="text-lg font-semibold custom-black-white-theme-switch-text mb-1">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="custom-black-white-theme-switch-bg border border-[var(--bg-general-light)] rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: item.color
                                        ? `${item.color}20`
                                        : "var(--bg-general-lighter)",
                                    color: item.color || "var(--bg-general)",
                                }}
                            >
                                {item.icon}
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold custom-black-white-theme-switch-text">
                                {item.value}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.title}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};



