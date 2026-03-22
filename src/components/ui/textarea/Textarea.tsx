"use client";

import React from "react";

interface TextareaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: () => void;
    error?: string;
    required?: boolean;
    minRows?: number;
    helperText?: string;
    className?: string;
    id?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    required,
    minRows = 3,
    helperText,
    disabled = false,
    className = "",
    id,
    ...rest
}) => {
    const textareaId =
        id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const describedBy = error
        ? `${textareaId}-error`
        : helperText
            ? `${textareaId}-helper`
            : undefined;

    return (
        <div className={className}>
            {label ? (
                <label
                    htmlFor={textareaId}
                    className="mb-1.5 block text-sm font-medium custom-black-white-theme-switch-text"
                >
                    {label}
                    {required ? <span className="ml-1 text-red-500">*</span> : null}
                </label>
            ) : null}

            <textarea
                id={textareaId}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                rows={minRows}
                required={required}
                disabled={disabled}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={describedBy}
                className={[
                    "w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200",
                    "custom-black-white-theme-switch-text placeholder:text-slate-400", 
                    // "dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]/20 focus:border-[var(--bg-general)]",
                    "resize-y",
                    disabled ? "opacity-60 cursor-not-allowed" : "",
                    error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-[var(--bg-general)]/20 hover:[var(--bg-general)]/20 ",
                ].join(" ")}
                {...rest}
            />

            {error ? (
                <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                    {error}
                </p>
            ) : helperText ? (
                <p id={`${textareaId}-helper`} className="mt-1.5 text-xs custom-black-white-theme-switch-text">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
};
