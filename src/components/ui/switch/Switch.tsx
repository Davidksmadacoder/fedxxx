"use client";

import React from "react";

interface SwitchProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    color?: string;
    className?: string;
    disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
    label,
    checked,
    onChange,
    color = "var(--brand-primary)",
    className = "",
    disabled = false,
}) => {
    return (
        <label className={`flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>
            <div className="relative inline-flex items-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only"
                />
                <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                        checked ? "" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    style={checked ? { backgroundColor: color } : undefined}
                >
                    <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            checked ? "translate-x-5" : ""
                        }`}
                    />
                </div>
            </div>
            {label && (
                <span className="text-sm custom-black-white-theme-switch-text">{label}</span>
            )}
        </label>
    );
};



