"use client";

import React from "react";
import { Button } from "@/components/ui/button/Button";
import { TextInput } from "@/components/ui/input/TextInput";
import { FaChevronRight } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface AdminPageHeaderProps {
    title: string;
    description?: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
        loading?: boolean;
    };
    secondaryActions?: Array<{
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
        variant?: "light" | "outline" | "subtle";
        loading?: boolean;
    }>;
    breadcrumbs?: BreadcrumbItem[];
    searchProps?: {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        placeholder?: string;
    };
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
    title,
    description,
    primaryAction,
    secondaryActions,
    breadcrumbs,
    searchProps,
}) => {
    return (
        <div className="mb-6 space-y-4">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <FaChevronRight className="custom-black-white-theme-switch-text" size={12} />
                            )}
                            {crumb.href ? (
                                <a
                                    href={crumb.href}
                                    className="custom-black-white-theme-switch-text hover:text-[var(--bg-general)] transition-colors"
                                >
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="custom-black-white-theme-switch-text font-medium">
                                    {crumb.label}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold custom-black-white-theme-switch-text mb-3 tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm lg:text-base custom-black-white-theme-switch-text max-w-3xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions and Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {searchProps && (
                        <div className="min-w-[280px] sm:min-w-[320px]">
                            <TextInput
                                value={searchProps.value}
                                onChange={searchProps.onChange}
                                placeholder={searchProps.placeholder || "Search..."}
                                leftSection={<LuSearch size={16} />}
                                className="w-full"
                            />
                        </div>
                    )}
                    {(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
                        <div className="flex flex-wrap items-center gap-3">
                            {secondaryActions?.map((action, index) => (
                                <Button
                                    key={index}
                                    variant={action.variant || "light"}
                                    onClick={action.onClick}
                                    leftSection={action.icon}
                                    loading={action.loading}
                                    size="sm"
                                >
                                    {action.label}
                                </Button>
                            ))}
                            {primaryAction && (
                                <Button
                                    onClick={primaryAction.onClick}
                                    leftSection={primaryAction.icon}
                                    loading={primaryAction.loading}
                                    color="brandOrange"
                                    size="sm"
                                >
                                    {primaryAction.label}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

