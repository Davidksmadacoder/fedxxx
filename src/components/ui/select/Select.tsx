"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  data: SelectOption[] | string[];
  value?: string;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  clearable?: boolean;
  searchable?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maw?: string | number;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  data,
  value,
  onChange,
  placeholder = "Select...",
  clearable = false,
  searchable = false,
  error,
  helperText,
  disabled = false,
  required,
  className = "",
  maw,
  id,
}) => {
  const autoId = useId();
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : `select-${autoId}`);
  const listboxId = `${selectId}-listbox`;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const options: SelectOption[] = useMemo(
    () =>
      data.map((item) =>
        typeof item === "string" ? { value: item, label: item } : item
      ),
    [data]
  );

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchTerm, searchable]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [isOpen, searchable]);

  const commit = (val: string | null) => {
    onChange?.(val);
    setIsOpen(false);
    setSearchTerm("");
    setActiveIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((v) => !v);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm("");
      setActiveIndex(-1);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={maw ? { maxWidth: typeof maw === "number" ? `${maw}px` : maw } : undefined}
      ref={dropdownRef}
    >
      {label ? (
        <label className="mb-1.5 block text-sm font-medium custom-black-white-theme-switch-text">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
      ) : null}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen((v) => !v)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        className={[
          "flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm transition-all duration-200",
          "custom-black-white-theme-switch-text placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)]/20 focus:border-[var(--bg-general)]",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-[var(--bg-general)]/20 hover:[var(--bg-general)]/20 ",
        ].join(" ")}
      >
        <span className={selectedOption ? "" : "text-slate-400 dark:text-slate-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <FaChevronDown
          className={`text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          size={14}
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-[9999] mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        >
          {searchable ? (
            <div className="border-b border-slate-200 p-2 dark:border-slate-800">
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search..."
                className="placeholder:text-black"
                // className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[var(--bg-general)]/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : null}

          <div className="max-h-64 overflow-y-auto">
            {clearable ? (
              <button
                type="button"
                onClick={() => commit(null)}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
              >
                Clear
              </button>
            ) : null}

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = value === opt.value;
                const isActive = idx === activeIndex;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => commit(opt.value)}
                    className={[
                      "w-full px-4 py-2.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-[var(--bg-general-lighter)] text-[var(--bg-general)] font-semibold"
                        : "text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-white/5",
                      isActive && !isSelected ? "bg-slate-50 dark:bg-white/5" : "",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
