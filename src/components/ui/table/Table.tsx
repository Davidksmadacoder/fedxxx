"use client";

import React from "react";

/* -------------------------------------------------------------------------------------------------
 * Small utility: className joiner (no external deps)
 * ------------------------------------------------------------------------------------------------- */
function cn(...classes: Array<string | undefined | null | false>) {
    return classes.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------------------------------- */
interface TableProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;

    /** Visual variants */
    striped?: boolean;
    hover?: boolean;
    compact?: boolean;

    /** Accessibility / semantics */
    caption?: string;
    "aria-label"?: string;

    /** Layout helpers */
    minWidth?: number | string;
}

interface TableHeadProps {
    children: React.ReactNode;
    className?: string;

    /** Keep header visible while scrolling */
    sticky?: boolean;
}

interface TableBodyProps {
    children: React.ReactNode;
    className?: string;
}

interface TableRowProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;

    /** For clickable rows */
    role?: React.AriaRole;
    tabIndex?: number;

    /** Visual states */
    selected?: boolean;
    disabled?: boolean;
}

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    colSpan?: number;
}

interface TableHeaderProps extends TableCellProps {
    /** Optional alignment helper */
    align?: "left" | "center" | "right";
}

/* -------------------------------------------------------------------------------------------------
 * Components
 * ------------------------------------------------------------------------------------------------- */

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
    (
        {
            children,
            className,
            containerClassName,
            striped = false,
            hover = true,
            compact = false,
            caption,
            minWidth,
            ...aria
        },
        ref
    ) => {
        return (
            <div
                className={cn(
                    "overflow-x-auto custom-scrollbar",
                    "rounded-2xl border border-[var(--brand-primary-lighter)]",
                    "bg-transparent",
                    containerClassName
                )}
            >
                <table
                    ref={ref}
                    {...aria}
                    className={cn(
                        "w-full border-collapse",
                        "text-sm",
                        compact ? "min-w-full" : "min-w-full",
                        className
                    )}
                    style={
                        minWidth
                            ? {
                                  minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth,
                              }
                            : undefined
                    }
                    data-striped={striped ? "true" : "false"}
                    data-hover={hover ? "true" : "false"}
                    data-compact={compact ? "true" : "false"}
                >
                    {caption ? (
                        <caption className="sr-only">{caption}</caption>
                    ) : null}
                    {children}
                </table>
            </div>
        );
    }
);
Table.displayName = "Table";

export const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
    ({ children, className, sticky = true }, ref) => {
        return (
            <thead
                ref={ref}
                className={cn(
                    // Uses your CSS variables so it looks good in light/dark automatically
                    "bg-[var(--brand-primary-light)]/60",
                    "border-b border-[var(--brand-primary-lighter)]",
                    sticky ? "sticky top-0 z-10 backdrop-blur" : "",
                    className
                )}
            >
                {children}
            </thead>
        );
    }
);
TableHead.displayName = "TableHead";

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
    ({ children, className }, ref) => {
        return (
            <tbody
                ref={ref}
                className={cn(
                    "divide-y divide-[var(--brand-primary-lighter)]",
                    className
                )}
            >
                {children}
            </tbody>
        );
    }
);
TableBody.displayName = "TableBody";

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
    (
        {
            children,
            className,
            onClick,
            role,
            tabIndex,
            selected = false,
            disabled = false,
        },
        ref
    ) => {
        const clickable = !!onClick && !disabled;

        return (
            <tr
                ref={ref}
                onClick={clickable ? onClick : undefined}
                role={role ?? (clickable ? "button" : undefined)}
                tabIndex={tabIndex ?? (clickable ? 0 : undefined)}
                onKeyDown={
                    clickable
                        ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onClick?.();
                              }
                          }
                        : undefined
                }
                aria-disabled={disabled || undefined}
                className={cn(
                    "transition-colors duration-150",
                    "border-b border-[var(--brand-primary-lighter)]",
                    // Row padding is applied on cells; keep row clean
                    clickable ? "cursor-pointer" : "",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                    selected ? "bg-[var(--brand-primary-light)]/60" : "",
                    // Hover styles controlled by data-hover on table, but safe default here too
                    !disabled && "hover:bg-[var(--brand-primary-light)]/40",
                    // Focus ring for keyboard navigation when row is clickable
                    clickable ? "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]/40 dark:focus-visible:ring-[var(--accent-primary-on-dark)]/75" : "",
                    className
                )}
            >
                {children}
            </tr>
        );
    }
);
TableRow.displayName = "TableRow";

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
    ({ children, className, colSpan }, ref) => {
        return (
            <td
                ref={ref}
                colSpan={colSpan}
                className={cn(
                    "px-4 py-3.5",
                    "align-middle",
                    "text-sm",
                    "custom-black-white-theme-switch-text",
                    "break-words",
                    className
                )}
            >
                {children}
            </td>
        );
    }
);
TableCell.displayName = "TableCell";

export const TableHeader = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
    ({ children, className, align = "left", colSpan }, ref) => {
        return (
            <th
                ref={ref}
                colSpan={colSpan}
                className={cn(
                    "px-4 py-3.5",
                    "text-xs font-semibold uppercase tracking-wider",
                    "custom-black-white-theme-switch-text",
                    "whitespace-nowrap",
                    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left",
                    className
                )}
            >
                {children}
            </th>
        );
    }
);
TableHeader.displayName = "TableHeader";
