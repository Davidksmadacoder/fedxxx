import React from "react";

interface NumberInputProps {
    label?: string;
    placeholder?: string;
    value?: number | string | undefined;
    onChange?: (value: number | string) => void;
    error?: string;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    thousandSeparator?: boolean;
    className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    label,
    placeholder,
    value,
    onChange,
    error,
    required,
    min,
    max,
    step,
    className = "",
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        if (inputValue === "") {
            onChange?.("");
            return;
        }
        const numValue = Number(inputValue);
        if (!isNaN(numValue)) {
            if (min !== undefined && numValue < min) return;
            if (max !== undefined && numValue > max) return;
            onChange?.(numValue);
        }
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type="number"
                value={value === undefined || value === "" ? "" : value}
                onChange={handleChange}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                className={`w-full px-3 py-2 custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)] ${
                    error ? "border-red-500 focus:ring-red-500" : "border-[var(--bg-general-light)]"
                }`}
            />
            {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
        </div>
    );
};
