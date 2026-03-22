"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { BiSun } from 'react-icons/bi';
import { IoMoonOutline } from "react-icons/io5";
import { motion } from 'framer-motion';

const ThemeSwitcher: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.div
            className="cursor-pointer p-2 rounded-full border-[0.5px] border-[var(--bg-general-light)] bg-(--bg-general-lighter)"
            onClick={toggleTheme}
            whileTap={{ scale: 0.9 }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
            {theme === 'light' ? (
                <IoMoonOutline size={24} color='black' />
            ) : (
                <BiSun size={24} />
            )}
        </motion.div>
    );
};

export default ThemeSwitcher;