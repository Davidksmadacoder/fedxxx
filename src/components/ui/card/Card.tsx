"use client";

import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: "sm" | "md" | "lg";
    radius?: "sm" | "md" | "lg" | "xl";
    withBorder?: boolean;
}

const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
};

const radiusClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
};

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    padding = "md",
    radius = "md",
    withBorder = false,
}) => {
    return (
        <div
            className={`custom-black-white-theme-switch-bg ${paddingClasses[padding]} ${radiusClasses[radius]} ${
                withBorder ? "border border-[var(--bg-general-light)]" : ""
            } ${className}`}
        >
            {children}
        </div>
    );
};



