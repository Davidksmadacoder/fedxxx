"use client";

import React from "react";

interface TextInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: string;
    required?: boolean;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
    helperText?: string;
    className?: string;
    id?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    required,
    type = "text",
    leftSection,
    rightSection,
    helperText,
    disabled = false,
    className = "",
    id,
    ...rest
}) => {
    const inputId =
        id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const describedBy = error
        ? `${inputId}-error`
        : helperText
            ? `${inputId}-helper`
            : undefined;

    return (
        <div className={className}>
            {label ? (
                <label
                    htmlFor={inputId}
                    className="mb-1.5 block text-sm font-medium custom-black-white-theme-switch-text"
                >
                    {label}
                    {required ? <span className="ml-1 text-red-500">*</span> : null}
                </label>
            ) : null}

            <div className="relative">
                {leftSection ? (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                        {leftSection}
                    </div>
                ) : null}

                <input
                    id={inputId}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={describedBy}
                    className={[
                        "h-12 w-full rounded-xl border px-4 text-sm transition-all duration-200",
                        "custom-black-white-theme-switch-text placeholder:text-slate-400",
                        // "dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]/20 focus:border-[var(--bg-general)]",
                        disabled ? "opacity-60 cursor-not-allowed" : "",
                        leftSection ? "pl-11" : "",
                        rightSection ? "pr-11" : "",
                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-[var(--bg-general)]/20 hover:[var(--bg-general)]/20 ",
                    ].join(" ")}
                    {...rest}
                />

                {rightSection ? (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500">
                        {rightSection}
                    </div>
                ) : null}
            </div>

            {error ? (
                <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                    {error}
                </p>
            ) : helperText ? (
                <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {helperText}
                </p>
            ) : null}
        </div>
    );
};
