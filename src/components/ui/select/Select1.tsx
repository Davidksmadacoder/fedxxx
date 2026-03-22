import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';

interface Select1Props {
    label: string;
    id: string;
    options: { value: string; label: string }[];
    error?: string;
    register: any;
}

const Select1: React.FC<Select1Props> = ({ label, id, options, error, register }) => {
    return (
        <div className="w-full custom-black-white-theme-switch-text">
            <label htmlFor={id} className="block custom-black-white-theme-switch-text text-xs font-medium mb-1.5">
                {label}
            </label>

            <div className="relative">
                <select
                    id={id}
                    {...register(id)}
                    className={`mb-4 w-full p-2.5 pr-10 text-sm border rounded-lg custom-black-white-theme-switch-bg focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)] transition-colors duration-200 custom-black-white-theme-switch-text appearance-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-[var(--bg-general-light)]'
                        }`}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 grid place-items-center pr-3 mb-[3%]">
                    <IoIosArrowDown className="text-[var(--bg-general)] h-4 w-4 block" />
                </div>
            </div>

            {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
        </div>
    );
};

export default Select1;
