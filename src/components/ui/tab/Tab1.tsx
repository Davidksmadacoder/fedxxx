import React from 'react'

type Tab1Props = {
    label: string;
    active: boolean;
    onClick: () => void;
}

const Tab1: React.FC<Tab1Props> = ({ label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${active
                    ? "bg-[var(--bg-general)] text-white"
                    : "bg-[var(--bg-general-light)] text-[var(--bg-general)] "
                }`}
        >
            {label}
        </button>
    )
}

export default Tab1