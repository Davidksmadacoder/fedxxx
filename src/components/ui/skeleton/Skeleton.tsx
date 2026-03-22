"use client";

import React from "react";

interface SkeletonProps {
    height?: number | string;
    width?: number | string;
    radius?: "sm" | "md" | "lg" | "xl" | "full";
    className?: string;
}

const radiusClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
};

export const Skeleton: React.FC<SkeletonProps> = ({
    height = 20,
    width = "100%",
    radius = "md",
    className = "",
}) => {
    return (
        <div
            className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${radiusClasses[radius]} ${className}`}
            style={{
                height: typeof height === "number" ? `${height}px` : height,
                width: typeof width === "number" ? `${width}px` : width,
            }}
        />
    );
};



