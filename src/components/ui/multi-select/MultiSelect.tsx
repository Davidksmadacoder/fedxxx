"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectProps {
    label?: string;
    data: MultiSelectOption[] | string[];
    value: string[];
    onChange?: (value: string[]) => void;
    placeholder?: string;
    clearable?: boolean;
    searchable?: boolean;
    className?: string;
    maw?: string | number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    data,
    value = [],
    onChange,
    placeholder = "Select...",
    clearable = false,
    searchable = false,
    className = "",
    maw,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const options: MultiSelectOption[] = data.map((item) =>
        typeof item === "string" ? { value: item, label: item } : item
    );

    const filteredOptions = searchable
        ? options.filter((opt) =>
              opt.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue];
        onChange?.(newValue);
    };

    const removeOption = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(value.filter((v) => v !== optionValue));
    };

    return (
        <div
            className={`relative ${className}`}
            style={maw ? { maxWidth: typeof maw === "number" ? `${maw}px` : maw } : undefined}
            ref={dropdownRef}
        >
            {label && (
                <label className="block text-sm font-medium mb-1 custom-black-white-theme-switch-text">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-left custom-black-white-theme-switch-bg custom-black-white-theme-switch-text border border-[var(--bg-general-light)] rounded-md flex items-center justify-between hover:border-[var(--bg-general)] transition-colors min-h-[38px]"
            >
                <div className="flex flex-wrap gap-1 flex-1">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map((opt) => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-general-lighter)] text-[var(--bg-general)] rounded text-xs"
                            >
                                {opt.label}
                                <button
                                    onClick={(e) => removeOption(opt.value, e)}
                                    className="hover:text-red-500"
                                >
                                    <FaTimes size={10} />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                </div>
                <FaChevronDown
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    size={12}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 custom-black-white-theme-switch-bg border border-[var(--bg-general-light)] rounded-md shadow-lg">
                    {searchable && (
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 border-b border-[var(--bg-general-light)] custom-black-white-theme-switch-bg custom-black-white-theme-switch-text focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {clearable && value.length > 0 && (
                            <button
                                onClick={() => {
                                    onChange?.([]);
                                    setSearchTerm("");
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-[var(--bg-general-lighter)] custom-black-white-theme-switch-text transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                        {filteredOptions.map((option) => {
                            const isSelected = value.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
                                    className={`w-full px-3 py-2 text-left hover:bg-[var(--bg-general-lighter)] transition-colors flex items-center gap-2 ${
                                        isSelected
                                            ? "bg-[var(--bg-general-lighter)] text-[var(--bg-general)]"
                                            : "custom-black-white-theme-switch-text"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="w-4 h-4"
                                    />
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};



