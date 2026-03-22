"use client";

import React from "react";

type BadgeColor = "blue" | "green" | "yellow" | "red" | "purple" | "gray" | "orange" | "violet" | "indigo" | "cyan" | "teal" | "lime" | "pink" | "grape";

interface BadgeProps {
    children: React.ReactNode;
    color?: BadgeColor;
    variant?: "filled" | "light" | "outline";
    size?: "sm" | "md" | "lg";
    className?: string;
}

const colorClasses: Record<BadgeColor, { filled: string; light: string; outline: string }> = {
    blue: {
        filled: "bg-blue-500 text-white",
        light: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        outline: "border border-blue-500 text-blue-500",
    },
    green: {
        filled: "bg-green-500 text-white",
        light: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        outline: "border border-green-500 text-green-500",
    },
    yellow: {
        filled: "bg-yellow-500 text-white",
        light: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        outline: "border border-yellow-500 text-yellow-500",
    },
    red: {
        filled: "bg-red-500 text-white",
        light: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        outline: "border border-red-500 text-red-500",
    },
    purple: {
        filled: "bg-[var(--brand-primary)] text-white",
        light: "bg-[var(--brand-primary-lighter)] text-[var(--brand-primary)] dark:bg-[var(--brand-primary-light)] dark:text-purple-100",
        outline: "border border-[var(--brand-primary)] text-[var(--brand-primary)]",
    },
    gray: {
        filled: "bg-gray-500 text-white",
        light: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        outline: "border border-gray-500 text-gray-500",
    },
    orange: {
        filled: "bg-[var(--brand-secondary)] text-white",
        light: "bg-[var(--brand-secondary-lighter)] text-[var(--brand-secondary)] dark:bg-[var(--brand-secondary-light)] dark:text-orange-100",
        outline: "border border-[var(--brand-secondary)] text-[var(--brand-secondary)]",
    },
    violet: {
        filled: "bg-violet-500 text-white",
        light: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
        outline: "border border-violet-500 text-violet-500",
    },
    indigo: {
        filled: "bg-indigo-500 text-white",
        light: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
        outline: "border border-indigo-500 text-indigo-500",
    },
    cyan: {
        filled: "bg-cyan-500 text-white",
        light: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
        outline: "border border-cyan-500 text-cyan-500",
    },
    teal: {
        filled: "bg-teal-500 text-white",
        light: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
        outline: "border border-teal-500 text-teal-500",
    },
    lime: {
        filled: "bg-lime-500 text-white",
        light: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
        outline: "border border-lime-500 text-lime-500",
    },
    pink: {
        filled: "bg-pink-500 text-white",
        light: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        outline: "border border-pink-500 text-pink-500",
    },
    grape: {
        filled: "bg-purple-600 text-white",
        light: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        outline: "border border-purple-600 text-purple-600",
    },
};

const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    color = "gray",
    variant = "light",
    size = "md",
    className = "",
}) => {
    const colorClass = colorClasses[color][variant];
    const sizeClass = sizeClasses[size];

    return (
        <span
            className={`inline-flex items-center font-medium rounded-md ${colorClass} ${sizeClass} ${className}`}
        >
            {children}
        </span>
    );
};



