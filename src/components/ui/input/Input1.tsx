import React from 'react';
import { IconType } from 'react-icons';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

interface Input1Props {
    label: string;
    placeholder?: string;
    type?: string;
    error?: string;
    Icon?: IconType;
    id: string;
    register: any;
    showPassword?: boolean;
    setShowPassword?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Input1: React.FC<Input1Props> = ({
    label,
    placeholder,
    type = 'text',
    error,
    Icon,
    id,
    register,
    showPassword,
    setShowPassword,
}) => {
    const computedType =
        type === 'password' && typeof showPassword !== 'undefined'
            ? (showPassword ? 'text' : 'password')
            : type;

    return (
        <div className="w-full custom-black-white-theme-switch-text">
            <label htmlFor={id} className="block custom-black-white-theme-switch-text text-xs font-medium mb-1.5">
                {label}
            </label>

            <div className="relative">
                <input
                    type={computedType}
                    id={id}
                    placeholder={placeholder}
                    {...register(id)}
                    className={`mb-4 placeholder:text-[0.75rem] w-full test-base touch-manipulation p-2.5 pr-10 text-sm border rounded-lg custom-black-white-theme-switch-bg focus:outline-none focus:ring-2 focus:ring-[var(--bg-general)] transition-colors duration-200 custom-black-white-theme-switch-text ${error ? 'border-red-500 focus:ring-red-500' : 'border-[var(--bg-general-light)]'
                        } ${Icon ? 'pl-10' : 'pl-2.5'}`}
                />

                {Icon && (
                    <div className="absolute inset-y-0 left-0 grid place-items-center pl-3 mb-[3%] pointer-events-none">
                        <Icon className="text-[var(--bg-general)] h-4 w-4 block" />
                    </div>
                )}

                {typeof setShowPassword !== 'undefined' && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 grid place-items-center pr-3 w-10 mb-[3%]"
                        onClick={() => setShowPassword(prev => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <AiOutlineEye className="text-[var(--bg-general)] h-4 w-4 block" />
                        ) : (
                            <AiOutlineEyeInvisible className="text-[var(--bg-general)] h-4 w-4 block" />
                        )}
                    </button>
                )}
            </div>

            {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
        </div>
    );
};

export default Input1;
