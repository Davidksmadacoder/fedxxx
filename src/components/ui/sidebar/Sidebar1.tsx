"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";

export interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    children?: NavItem[];
}

interface Sidebar1Props {
    isOpen: boolean;
    onClose: () => void;
    navItems: NavItem[];
}

const Sidebar1: React.FC<Sidebar1Props> = ({ isOpen, onClose, navItems }) => {
    const [active, setActive] = useState("");
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (typeof window !== "undefined") {
            setActive(window.location.pathname);
            // Auto-expand parent if child is active
            navItems.forEach((item) => {
                if (item.children) {
                    const hasActiveChild = item.children.some(
                        (child) => child.href === window.location.pathname
                    );
                    if (hasActiveChild) {
                        setExpandedItems((prev) => new Set(prev).add(item.href));
                    }
                }
            });
        }
    }, [navItems]);

    const toggleExpand = (href: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(href)) {
                newSet.delete(href);
            } else {
                newSet.add(href);
            }
            return newSet;
        });
    };

    const renderNavItem = (item: NavItem, level: number = 0) => {
        const isExpanded = expandedItems.has(item.href);
        const hasChildren = item.children && item.children.length > 0;
        const isActive = active === item.href || (hasChildren && item.children?.some(child => active === child.href));

        return (
            <div key={item.href} className={level > 0 ? "ml-4" : ""}>
                {hasChildren ? (
                    <>
                        <button
                            onClick={() => toggleExpand(item.href)}
                            className={`group w-full flex gap-2 items-center justify-between p-2 my-1 rounded-md transition-colors duration-200 custom-black-white-theme-switch-text hover:bg-[var(--bg-general-lighter)] ${
                                isActive
                                    ? "text-[var(--bg-general)] bg-[var(--bg-general-lighter)]"
                                    : ""
                            }`}
                        >
                            <div className="flex gap-2 items-center">
                                <span
                                    className={`text-[20px] rounded-full p-1 transition-colors duration-200 group-hover:bg-[var(--bg-general)] group-hover:text-[var(--bg-white)] custom-black-white-theme-switch-text ${
                                        isActive
                                            ? "bg-[var(--bg-general)] text-[var(--bg-white)]"
                                            : ""
                                    }`}
                                >
                                    {item.icon}
                                </span>
                                <span
                                    className={`text-[14px] font-semibold transition-colors group-hover:text-[var(--bg-general)] custom-black-white-theme-switch-text ${
                                        isActive ? "text-[var(--bg-general)]" : ""
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </div>
                            <span className="text-sm transition-transform duration-200 custom-black-white-theme-switch-text">
                                {isExpanded ? <IoIosArrowDown /> : <IoIosArrowForward />}
                            </span>
                        </button>
                        {isExpanded && (
                            <div className="mt-1">
                                {item.children?.map((child) => renderNavItem(child, level + 1))}
                            </div>
                        )}
                    </>
                ) : (
                    <Link
                        href={item.href}
                        onClick={() => {
                            setActive(item.href);
                            onClose();
                        }}
                        className={`group flex gap-2 items-center p-2 my-1 rounded-md transition-colors duration-200 custom-black-white-theme-switch-text hover:bg-[var(--bg-general-lighter)] ${
                            active === item.href
                                ? "text-[var(--bg-general)] bg-[var(--bg-general-lighter)]"
                                : ""
                        }`}
                    >
                        <span
                            className={`text-[20px] rounded-full p-1 transition-colors duration-200 group-hover:bg-[var(--bg-general)] group-hover:text-[var(--bg-white)] custom-black-white-theme-switch-text ${
                                active === item.href
                                    ? "bg-[var(--bg-general)] text-[var(--bg-white)]"
                                    : ""
                            }`}
                        >
                            {item.icon}
                        </span>
                        <span
                            className={`text-[14px] font-semibold transition-colors group-hover:text-[var(--bg-general)] custom-black-white-theme-switch-text ${
                                active === item.href ? "text-[var(--bg-general)]" : ""
                            }`}
                        >
                            {item.label}
                        </span>
                    </Link>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Backdrop when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 md:hidden z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed h-full top-16 left-0 custom-black-white-theme-switch-bg w-56 sm:w-64 border-r border-[var(--bg-general-light)] transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
            >
                <nav className="px-4 py-2 overflow-y-auto h-[calc(100%-4rem)] custom-scrollbar">
                    {navItems.map((item) => renderNavItem(item))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar1;
