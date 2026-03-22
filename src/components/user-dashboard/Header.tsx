"use client";

import Logo from '../common/Logo';
import ProfileDropdown from './ProfileDropdown';
import ThemeSwitcher from '../features/ThemeSwitcher';

const Header: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between custom-side-padding px-4 md:px-6 custom-black-white-theme-switch-bg border-b border-[var(--bg-general-light)]">
            <div className="flex items-center">
                <Logo size="medium" />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <ThemeSwitcher />
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default Header;