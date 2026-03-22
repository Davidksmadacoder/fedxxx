"use client";

import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
    total: number;
    value: number;
    onChange: (page: number) => void;
    color?: string;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    total,
    value,
    onChange,
    color = "#2563EB",
    className = "",
}) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (total <= maxVisible) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            if (value <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(total);
            } else if (value >= total - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = total - 3; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = value - 1; i <= value + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(total);
            }
        }

        return pages;
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <button
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value === 1}
                className="px-3 py-2 rounded-md custom-black-white-theme-switch-text custom-black-white-theme-switch-bg border border-[var(--bg-general-light)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-general-lighter)] transition-colors"
                style={{ color: value === 1 ? undefined : color }}
            >
                <FaChevronLeft size={12} />
            </button>

            {getPageNumbers().map((page, index) => {
                if (page === "...") {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-2 custom-black-white-theme-switch-text"
                        >
                            ...
                        </span>
                    );
                }

                const pageNum = page as number;
                const isActive = pageNum === value;

                return (
                    <button
                        key={pageNum}
                        onClick={() => onChange(pageNum)}
                        className={`px-3 py-2 rounded-md font-medium transition-colors ${
                            isActive
                                ? "text-white"
                                : "custom-black-white-theme-switch-text custom-black-white-theme-switch-bg border border-[var(--bg-general-light)] hover:bg-[var(--bg-general-lighter)]"
                        }`}
                        style={
                            isActive
                                ? {
                                      backgroundColor: color,
                                  }
                                : undefined
                        }
                    >
                        {pageNum}
                    </button>
                );
            })}

            <button
                onClick={() => onChange(Math.min(total, value + 1))}
                disabled={value === total}
                className="px-3 py-2 rounded-md custom-black-white-theme-switch-text custom-black-white-theme-switch-bg border border-[var(--bg-general-light)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-general-lighter)] transition-colors"
                style={{ color: value === total ? undefined : color }}
            >
                <FaChevronRight size={12} />
            </button>
        </div>
    );
};



